import json
import re
from contextlib import contextmanager

from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import Http404, HttpResponse, HttpResponseBadRequest
from django.views import generic
from django.urls import reverse
from spinedb_api import DatabaseMapping, from_database
from .models import Project, PROJECT_NAME_LENGTH
from . import site
from .exception import FlextoolException


class IndexView(LoginRequiredMixin, generic.ListView):
    template_name = "flextool3/index.html"
    context_object_name = "projects"
    login_url = "accounts/login/"

    def get_queryset(self):
        """Returns user's projects."""
        return Project.objects.filter(user_id=self.request.user.id)

    def get_context_data(self, **kwargs):
        data = super().get_context_data(**kwargs)
        data["script_data"] = {
            "detailUrls": {project.id: reverse("flextool3:detail", kwargs={"pk": project.id}) for project in data["projects"]},
            "amaUrl": reverse("flextool3:ama")
        }
        return data


class DetailView(LoginRequiredMixin, generic.DetailView):
    model = Project
    template_name = "flextool3/detail.html"


class EditView(LoginRequiredMixin, generic.DetailView):
    model = Project
    template_name = "flextool3/edit.html"


class SolveView(LoginRequiredMixin, generic.DetailView):
    model = Project
    template_name = "flextool3/solve.html"


class ResultsView(LoginRequiredMixin, generic.DetailView):
    model = Project
    template_name = "flextool3/results.html"


@login_required
def ama(request):
    if request.method != "POST":
        raise Http404()
    body = json.loads(request.body)
    try:
        question = body["type"]
    except KeyError:
        return HttpResponseBadRequest()
    if question == "project list?":
        return project_list(request.user.id)
    if question == "create project?":
        return create_project(request.user, body)
    if question == "destroy project?":
        return destroy_project(request.user, body)
    return HttpResponseBadRequest("Unknown 'type'.")


def project_list(user_id):
    projects = Project.objects.filter(user_id=user_id)
    response = json.dumps({"type": "project list", "projects": [project.project_list_data() for project in projects]})
    return HttpResponse(response, content_type="application/json")


def create_project(user, request_body):
    try:
        project_name = request_body["name"]
    except KeyError:
        return HttpResponseBadRequest()
    project_name = project_name[:PROJECT_NAME_LENGTH].strip()
    if re.match(r"(^\w&)|(^\w(\w|\s)*\w$)", project_name) is None:
        return HttpResponseBadRequest("Invalid project name.")
    try:
        new_project = Project.create(user, project_name, site.FLEXTOOL_PROJECTS_ROOT, site.FLEXTOOL_PROJECT_TEMPLATE)
    except FlextoolException as error:
        return HttpResponseBadRequest(f"Could not create project: {error}")
    new_project.save()
    return HttpResponse(json.dumps({"type": "new project", "project": new_project.project_list_data()}), content_type="application/json")


def destroy_project(user, request_body):
    """Destroys a project by it from the database and removing the project directory.

    Args:
        user (User): project owner
        request_body (dict): destroy request body

    Returns:
        HttpResponse: response to be sent to client
    """
    try:
        project_name = request_body["name"]
    except KeyError:
        return HttpResponseBadRequest()
    try:
        project = Project.objects.get(user_id=user.id, name=project_name)
    except Project.DoesNotExist:
        return HttpResponseBadRequest("Project does not exist.")
    id_ = project.id
    project.remove_project_dir()
    project.delete()
    return HttpResponse(json.dumps({"type": "destroy project", "name": project_name, "id": id_}), content_type="application/json")


@login_required
def model(request):
    if request.method != "POST":
        raise Http404()
    body = json.loads(request.body)
    try:
        project_id = body["projectId"]
    except KeyError:
        return HttpResponseBadRequest()
    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return HttpResponseBadRequest("Project does not exist.")
    try:
        type_ = body["type"]
    except KeyError():
        return HttpResponseBadRequest()
    if type_ == "object classes?":
        return get_object_classes(project)
    if type_ == "objects?":
        return get_objects(project)
    if type_ == "object parameter values?":
        return get_object_parameter_values(project)
    return HttpResponseBadRequest("Unknown 'type'.")


def get_object_classes(project):
    with model_database_map(project) as db_map:
        classes = [row._asdict() for row in db_map.query(db_map.object_class_sq)]
        return HttpResponse(json.dumps({"type": "object classes", "classes": classes}), content_type="application/json")


def get_objects(project):
    with model_database_map(project) as db_map:
        objects = [row._asdict() for row in db_map.query(db_map.object_sq)]
        return HttpResponse(json.dumps({"type": "objects", "objects": objects}), content_type="application/json")


def get_object_parameter_values(project):
    with model_database_map(project) as db_map:
        values = [row._asdict() for row in db_map.query(db_map.object_parameter_value_sq)]
        for value in values:
            value["value"] = str(value["value"], encoding="utf-8")
        return HttpResponse(json.dumps({"type": "object parameter values", "values": values}), content_type="application/json")


@contextmanager
def model_database_map(project):
    """Opens a database connection to project's model database."""
    db_map = DatabaseMapping("sqlite:///" + str(project.model_database_path()))
    try:
        yield db_map
    finally:
        db_map.connection.close()
