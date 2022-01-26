import json
import re
from shutil import copyfile
from contextlib import contextmanager

from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import Http404, HttpResponse, HttpResponseBadRequest, JsonResponse, HttpResponseServerError
from django.shortcuts import get_object_or_404, render
from django.views import generic
from spinedb_api import DatabaseMapping, to_database, SpineIntegrityError, SpineDBVersionError, SpineDBAPIError
from .models import Execution, Project, PROJECT_NAME_LENGTH
from . import executor, site
from .exception import FlextoolException


class IndexView(LoginRequiredMixin, generic.ListView):
    template_name = "flextool3/index.html"
    context_object_name = "projects"
    login_url = "accounts/login/"

    def get_queryset(self):
        """Returns user's projects."""
        return Project.objects.filter(user_id=self.request.user.id)


class DetailView(LoginRequiredMixin, generic.DetailView):
    model = Project
    template_name = "flextool3/detail.html"


def edit(request, pk):
    project = get_object_or_404(Project, pk=pk)
    context = {"project": project}
    db_url = "sqlite:///" + str(project.model_database_path())
    try:
        db_map = DatabaseMapping(db_url)
    except SpineDBVersionError:
        _backup_database(project.model_database_path())
        try:
            db_map = DatabaseMapping(db_url, upgrade=True)
        except SpineDBAPIError as error:
            return HttpResponseServerError(f"Failed to upgrade database: {error}")
        else:
            db_map.connection.close()
            return render(request, "flextool3/database_upgraded.html", context)
    except SpineDBAPIError as error:
        return HttpResponseServerError(f"Failed to open database mapping: {error}", context)
    else:
        db_map.connection.close()
        return render(request, "flextool3/edit.html", context)


def _backup_database(database_path):
    backup_path = database_path.parent / (database_path.name + ".backup")
    copyfile(database_path, backup_path)


class SolveView(LoginRequiredMixin, generic.DetailView):
    model = Project
    template_name = "flextool3/solve.html"


class ResultsView(LoginRequiredMixin, generic.DetailView):
    model = Project
    template_name = "flextool3/results.html"


@login_required
def projects(request):
    if request.method != "POST":
        raise Http404()
    body = json.loads(request.body)
    try:
        question = body["type"]
    except KeyError as missing:
        return HttpResponseBadRequest(f"Missing '{missing}'.")
    if question == "project list?":
        return project_list(request.user.id)
    if question == "create project?":
        return create_project(request.user, body)
    if question == "destroy project?":
        return destroy_project(request.user, body)
    return HttpResponseBadRequest("Unknown 'type'.")


def project_list(user_id):
    response = {"projects": [project.project_list_data() for project in Project.objects.filter(user_id=user_id)]}
    return JsonResponse(response)


def create_project(user, request_body):
    try:
        project_name = request_body["name"]
    except KeyError as missing:
        return HttpResponseBadRequest(f"Missing '{missing}'")
    project_name = project_name[:PROJECT_NAME_LENGTH].strip()
    if re.match(r"(^\w&)|(^\w(\w|\s)*\w$)", project_name) is None:
        return HttpResponseBadRequest("Invalid project name.")
    try:
        new_project = Project.create(user, project_name, site.FLEXTOOL_PROJECTS_ROOT, site.FLEXTOOL_PROJECT_TEMPLATE)
    except FlextoolException as error:
        return HttpResponseBadRequest(str(error))
    new_project.save()
    return JsonResponse({"project": new_project.project_list_data()})


def destroy_project(user, request_body):
    """Destroys a project by it from the database and removing the project directory.

    Args:
        user (User): project owner
        request_body (dict): destroy request body

    Returns:
        HttpResponse: response to be sent to client
    """
    try:
        id_ = request_body["id"]
    except KeyError as missing:
        return HttpResponseBadRequest(f"Missing '{missing}'.")
    try:
        project = Project.objects.get(user_id=user.id, pk=id_)
    except Project.DoesNotExist:
        return HttpResponseBadRequest("Project does not exist.")
    project.remove_project_dir()
    project.delete()
    return JsonResponse({"id": id_})


@login_required
def model(request):
    if request.method != "POST":
        raise Http404()
    body = json.loads(request.body)
    try:
        project = _resolve_project(request, body)
    except FlextoolException as error:
        return HttpResponseBadRequest(str(error))
    try:
        type_ = body["type"]
    except KeyError as missing:
        return HttpResponseBadRequest(f"Missing '{missing}'.")
    try:
        if type_ == "object classes?":
            return get_object_classes(project)
        if type_ == "objects?":
            class_id = body.get("object_class_id")
            if class_id is not None and not isinstance(class_id, int):
                return HttpResponseBadRequest("Wrong 'object_class_id' data type.")
            return get_objects(project, class_id)
        if type_ == "object parameter values?":
            class_id = body.get("object_class_id")
            if class_id is not None and not isinstance(class_id, int):
                return HttpResponseBadRequest(f"Wrong 'object_class_id' data type.")
            return get_object_parameter_values(project, class_id)
        if type_ == "update values":
            try:
                updates = body["updates"]
            except KeyError as missing:
                return HttpResponseBadRequest(f"Missing '{missing}'")
            return update_parameter_values(project, updates)
    except SpineDBVersionError:
        return JsonResponse({"type": "upgrade database?"})
    return HttpResponseBadRequest("Unknown 'type'.")


def _resolve_project(request, body):
    try:
        project_id = body["projectId"]
    except KeyError as missing:
        raise FlextoolException(f"Missing '{missing}'.")
    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        raise FlextoolException("Project does not exist.")
    if project.user.id != request.user.id:
        raise FlextoolException("Project does not exist.")
    return project


def get_object_classes(project):
    with model_database_map(project) as db_map:
        classes = [row._asdict() for row in db_map.query(db_map.object_class_sq)]
        return JsonResponse({"classes": classes})


def get_objects(project, class_id=None):
    with model_database_map(project) as db_map:
        if class_id is None:
            objects = [row._asdict() for row in db_map.query(db_map.object_sq)]
        else:
            objects = [row._asdict() for row in db_map.query(db_map.object_sq).filter(db_map.object_sq.c.class_id == class_id)]
        return JsonResponse({"objects": objects})


def get_object_parameter_values(project, class_id = None):
    with model_database_map(project) as db_map:
        if class_id is None:
            values = [row._asdict() for row in db_map.query(db_map.object_parameter_value_sq)]
        else:
            values = [row._asdict() for row in db_map.query(db_map.object_parameter_value_sq).filter(db_map.object_parameter_value_sq.c.object_class_id == class_id)]
        for value in values:
            value["value"] = str(value["value"], encoding="utf-8")
        return JsonResponse({"values": values})


def update_parameter_values(project, updates):
    sterilized_updates = []
    for update in updates:
        sterilized = {}
        try:
            sterilized["id"] = update["id"]
            sterilized["value"], sterilized["type"] = to_database(update["value"])
        except KeyError as missing:
            return HttpResponseBadRequest(f"Missing'{missing}'.")
        sterilized_updates.append(sterilized)
    del updates  # Don't use updates from this point onwards.
    with model_database_map(project) as db_map:
        try:
            status, errors = db_map.update_parameter_values(*sterilized_updates, strict=True)
            if errors:
                return HttpResponseBadRequest("Errors while updating values.")
        except SpineIntegrityError as e:
            return HttpResponseBadRequest(f"Database integrity error: {e}")
        db_map.commit_session("Update parameter values.")
        return JsonResponse({"status": "ok"})


@contextmanager
def model_database_map(project):
    """Opens a database connection to project's model database."""
    db_map = DatabaseMapping("sqlite:///" + str(project.model_database_path()))
    try:
        yield db_map
    finally:
        db_map.connection.close()


@login_required
def executions(request):
    if request.method != "POST":
        raise Http404()
    body = json.loads(request.body)
    try:
        question = body["type"]
    except KeyError as missing:
        return HttpResponseBadRequest(f"Missing '{missing}'.")
    if question == "execution list?":
        return execution_list(request, body)
    if question == "create execution?":
        return create_execution(request, body)
    if question == "destroy execution?":
        return destroy_execution(request, body)
    if question == "execute?":
        return execute(request, body)
    if question == "abort?":
        return abort_execution(request, body)
    if question == "updates?":
        return execution_updates(request, body)
    if question == "log?":
        return execution_log(request, body)
    if question == "status?":
        return execution_status(request, body)
    return HttpResponseBadRequest("Unknown 'type'.")


def execution_list(request, request_body):
    try:
        project = _resolve_project(request, request_body)
    except FlextoolException as error:
        return HttpResponseBadRequest(str(error))
    response = {"executions": [e.execution_list_data() for e in Execution.objects.filter(project_id=project.id)]}
    return JsonResponse(response)


def create_execution(request, request_body):
    try:
        project = _resolve_project(request, request_body)
    except FlextoolException as error:
        return HttpResponseBadRequest(str(error))
    try:
        new_execution = Execution(project=project)
    except FlextoolException as error:
        return HttpResponseBadRequest(str(error))
    new_execution.save()
    return JsonResponse({"execution": new_execution.execution_list_data()})


def _resolve_execution(request, request_body):
    try:
        execution_id = request_body["id"]
    except KeyError as missing:
        raise FlextoolException(f"missing '{missing}")
    try:
        execution = Execution.objects.get(pk=execution_id)
    except Execution.DoesNotExist:
        raise FlextoolException("Execution does not exist.")
    if execution.project.user.id != request.user.id:
        raise FlextoolException("Execution does not exist.")
    return execution


def abort_execution(request, request_body):
    try:
        execution = _resolve_execution(request, request_body)
    except FlextoolException as error:
        return HttpResponseBadRequest(str(error))
    execution_id = execution.id
    executor.abort(execution_id)
    return JsonResponse({"id": execution_id})


def destroy_execution(request, request_body):
    try:
        execution = _resolve_execution(request, request_body)
    except FlextoolException as error:
        return HttpResponseBadRequest(str(error))
    execution_id = execution.id
    execution.delete()
    return JsonResponse({"id": execution_id})


def execute(request, request_body):
    try:
        execution = _resolve_execution(request, request_body)
    except FlextoolException as error:
        return HttpResponseBadRequest(str(error))
    execution.start(site.SPINE_TOOLBOX_PYTHON, execution.arguments())
    return JsonResponse({"id": execution.id})


def execution_updates(request, request_body):
    try:
        execution = _resolve_execution(request, request_body)
    except FlextoolException as error:
        return HttpResponseBadRequest(str(error))
    updates = execution.updates()
    return JsonResponse({"updates": updates})


def execution_log(request, request_body):
    try:
        execution = _resolve_execution(request, request_body)
    except FlextoolException as error:
        return HttpResponseBadRequest(str(error))
    log = execution.log.split("\n")
    return JsonResponse({"log": log})


def execution_status(request, request_body):
    try:
        execution = _resolve_execution(request, request_body)
    except FlextoolException as error:
        return HttpResponseBadRequest(str(error))
    return JsonResponse({"status": execution.status})
