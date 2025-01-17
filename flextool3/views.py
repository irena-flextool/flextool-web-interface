"""Django views of the FlexTool3 app."""
import json
from shutil import copyfile

from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import (
    Http404,
    HttpResponseBadRequest,
    HttpResponseServerError,
    FileResponse,
)
from django.shortcuts import get_object_or_404, render
from django.views import generic
from spinedb_api import DatabaseMapping, SpineDBVersionError, SpineDBAPIError
from .model_view import (
    get_scenarios,
    get_available_relationship_objects,
    get_parameter_value_lists,
    get_class_set,
    get_commits,
    make_base_alternative,
    commit,
    get_object_classes,
    get_objects,
    get_relationship_classes,
    get_relationships,
    get_parameter_definitions,
    get_parameter_values,
    get_alternatives,
)
from .models import Project
from .exception import FlexToolException
from .view_utils import resolve_project
from .utils import Database, get_and_validate
from .executions_view import (
    abort_execution,
    import_excel_input,
    solve_model,
    execution_briefing,
    current_execution,
)
from .projects_view import project_list, create_project, destroy_project
from . import analysis_view
from .summary_view import (
    get_scenario_list,
    get_summary,
    get_result_alternative,
    destroy_execution,
)
from .examples_view import get_example_list, add_example_to_model
from .import_file_view import save_imported_file

PHYSICAL_OBJECT_CLASS_NAMES = {
    "commodity",
    "connection",
    "group",
    "node",
    "profile",
    "reserve",
    "unit",
}

MODEL_OBJECT_CLASS_NAMES = {"model", "timeblockSet", "timeline", "solve"}


# pylint: disable=too-many-ancestors
class IndexView(LoginRequiredMixin, generic.ListView):
    """A view to render a list of user's projects."""

    template_name = "flextool3/index.html"
    context_object_name = "projects"
    login_url = "accounts/login/"

    def get_queryset(self):
        """Returns user's projects."""
        # pylint: disable=no-member
        return Project.objects.filter(user_id=self.request.user.id)


@login_required(login_url="../accounts/login/")
def detail(request, project_id):
    """Renders the Manage project page.

    Args:
        request (HttpRequest): client's request
        project_id (int): project id

    Returns:
        HttpResponse: response to client
    """
    project = get_object_or_404(Project, pk=project_id, user=request.user.id)
    context = {"project": project}
    return render(request, "flextool3/detail.html", context)


@login_required(login_url="../accounts/login/")
def edit(request, project_id):
    """Renders the Edit model page.

    Args:
        request (HttpRequest): client's request
        project_id (int): project id

    Returns:
        HttpResponse: response to client
    """

    def render_edit(project, _):
        context = {"project": project}
        return render(request, "flextool3/edit.html", context)

    return _ensure_database_up_to_date(render_edit, Database.MODEL, request, project_id)


@login_required(login_url="../../accounts/login/")
def entities(request, project_id, class_id):
    """Renders the entity editor page.

    Args:
        request (HttpRequest): client's request
        project_id (int): project id
        class_id (int): entity class id

    Returns:
        HttpResponse: response to client
    """

    def render_entities(project, db_map):
        entity_class = (
            db_map.query(db_map.entity_class_sq)
            .filter(db_map.entity_class_sq.c.id == class_id)
            .first()
        )
        if entity_class is None:
            return HttpResponseBadRequest("Entity class does not exist.")
        context = {"project": project, "entity_class": entity_class}
        return render(request, "flextool3/entities.html", context)

    return _ensure_database_up_to_date(
        render_entities, Database.MODEL, request, project_id
    )


@login_required(login_url="../accounts/login/")
def scenarios(request, project_id):
    """Renders the alternative/scenario editor page.

    Args:
        request (HttpRequest): client's request
        project_id (int): project id

    Returns:
        HttpResponse: response to client
    """

    def render_scenarios(project, _):
        context = {"project": project}
        return render(request, "flextool3/scenarios.html", context)

    return _ensure_database_up_to_date(
        render_scenarios, Database.MODEL, request, project_id
    )


@login_required(login_url="../accounts/login/")
def run(request, project_id):
    """Renders the Run page.

    Args:
        request (HttpRequest): client's request
        project_id (int): project id

    Returns:
        HttpResponse: response to client
    """
    project = get_object_or_404(Project, pk=project_id, user=request.user.id)
    context = {"project": project}
    return render(request, "flextool3/run.html", context)


@login_required(login_url="../accounts/login/")
def results(request, project_id):
    """Renders the Results page.

    Args:
        request (HttpRequest): client's request
        project_id (int): project id

    Returns:
        HttpResponse: response to client
    """

    def render_results(project, _):
        context = {"project": project}
        return render(request, "flextool3/results.html", context)

    return _ensure_database_up_to_date(
        render_results, Database.RESULT, request, project_id
    )


@login_required
def projects(request):
    """Manages user's projects.

    Args:
        request (HttpRequest): client's request

    Returns:
        HttpResponse: response to client
    """
    if request.method != "POST":
        raise Http404()
    body = json.loads(request.body)
    try:
        question = get_and_validate(body, "type", str)
    except FlexToolException as error:
        return HttpResponseBadRequest(str(error))
    if question == "project list?":
        return project_list(request.user.id)
    if question == "create project?":
        return create_project(request.user, body)
    if question == "destroy project?":
        return destroy_project(request.user, body)
    return HttpResponseBadRequest("Unknown 'type'.")


@login_required
def model(request):
    """Performs model database queries and updates.

    Request's body should contain a JSON object that specifies the query/update to perform.

    Args:
        request (HttpRequest): request object

    Returns:
        HttpResponse: response to client
    """
    # pylint: disable=too-many-return-statements
    if request.method != "POST":
        raise Http404()
    body = json.loads(request.body)
    try:
        project = resolve_project(request, body)
    except FlexToolException as error:
        return HttpResponseBadRequest(str(error))
    try:
        type_ = body["type"]
    except KeyError as missing:
        return HttpResponseBadRequest(f"Missing '{missing}'.")
    try:
        if type_ == "object classes?":
            return get_object_classes(project, Database.MODEL)
        if type_ == "objects?":
            return get_objects(project, Database.MODEL, body)
        if type_ == "relationship classes?":
            return get_relationship_classes(project, Database.MODEL)
        if type_ == "relationships?":
            return get_relationships(project, Database.MODEL, body)
        if type_ == "parameter definitions?":
            return get_parameter_definitions(project, Database.MODEL, body)
        if type_ == "parameter values?":
            return get_parameter_values(project, Database.MODEL, body)
        if type_ == "alternatives?":
            return get_alternatives(project, Database.MODEL)
        if type_ == "scenarios?":
            return get_scenarios(project)
        if type_ == "available relationship objects?":
            return get_available_relationship_objects(project, body)
        if type_ == "parameter value lists?":
            return get_parameter_value_lists(project, body)
        if type_ == "physical classes?":
            return get_class_set(project, PHYSICAL_OBJECT_CLASS_NAMES)
        if type_ == "model classes?":
            return get_class_set(project, MODEL_OBJECT_CLASS_NAMES)
        if type_ == "commits?":
            return get_commits(project)
        if type_ == "make base alternative":
            return make_base_alternative(project)
        if type_ == "commit":
            return commit(project, body)
    except SpineDBVersionError:
        return HttpResponseBadRequest("Error: database version mismatch.")
    return HttpResponseBadRequest("Unknown 'type'.")


@login_required
def executions(request):
    """Responds to execution requests.

    Args:
        request (HTTPRequest): client's request

    Returns:
        HTTPResponse: response
    """
    if request.method != "POST":
        raise Http404()
    body = json.loads(request.body)
    try:
        question = get_and_validate(body, "type", str)
    except FlexToolException as error:
        return HttpResponseBadRequest(str(error))
    if question == "current execution?":
        return current_execution(request, body)
    if question == "solve model?":
        return solve_model(request, body)
    if question == "import excel input?":
        return import_excel_input(request, body)
    if question == "abort?":
        return abort_execution(request, body)
    if question == "briefing?":
        return execution_briefing(request, body)
    return HttpResponseBadRequest("Unknown 'type'.")


@login_required
def summary(request):
    """Serves execution summaries.

    Args:
        request(HTTPRequest): client's request

    Returns:
        HTTPResponse: execution summary
    """
    if request.method != "POST":
        raise Http404()
    body = json.loads(request.body)
    try:
        project = resolve_project(request, body)
        type_ = get_and_validate(body, "type", str)
    except FlexToolException as error:
        return HttpResponseBadRequest(str(error))
    if type_ == "scenario list?":
        return get_scenario_list(project)
    if type_ == "summary?":
        return get_summary(project, body)
    if type_ == "result alternative?":
        return get_result_alternative(project, body)
    if type_ == "destroy execution?":
        return destroy_execution(project, body)
    return HttpResponseBadRequest("Unknown 'type'.")


@login_required
def analysis(request):
    """Performs result database queries.

    Request's body should contain a JSON object that specifies the query to perform.

    Args:
        request (HttpRequest): request object

    Returns:
        HttpResponse: response to client
    """
    if request.method != "POST":
        raise Http404()
    body = json.loads(request.body)
    try:
        project = resolve_project(request, body)
        type_ = get_and_validate(body, "type", str)
        if type_ == "entity classes?":
            return analysis_view.get_entity_classes(project)
        if type_ == "entities?":
            return analysis_view.get_entities(project, body)
        if type_ == "parameters?":
            return analysis_view.get_parameters(project, body)
        if type_ == "value indexes?":
            return analysis_view.get_value_indexes(project, body)
        if type_ == "values?":
            return analysis_view.get_parameter_values(project, body)
        if type_ == "default plot specification?":
            return analysis_view.get_default_plot_specification(project, body)
        if type_ == "custom plot specification names?":
            return analysis_view.get_custom_plot_specification_names(project, body)
        if type_ == "custom plot specification?":
            return analysis_view.get_custom_plot_specification(project, body)
        if type_ == "store default plot specification":
            return analysis_view.set_default_plot_specification(project, body)
        if type_ == "store custom plot specification":
            return analysis_view.set_custom_plot_specification(project, body)
        if type_ == "remove custom plot specification":
            return analysis_view.remove_custom_plot_specification(project, body)
        if type_ == "rename custom plot specification":
            return analysis_view.rename_custom_plot_specification(project, body)
    except FlexToolException as error:
        return HttpResponseBadRequest(str(error))
    return HttpResponseBadRequest("Unknown 'type'.")


@login_required
def examples(request):
    """Performs actions connected to model database examples.

    Request's body should contain a JSON object that specifies the query to perform.

    Args:
        request (HttpRequest): request object

    Returns:
        HttpResponse: response to client
    """
    if request.method != "POST":
        raise Http404()
    body = json.loads(request.body)
    try:
        project = resolve_project(request, body)
        type_ = get_and_validate(body, "type", str)
        if type_ == "example list?":
            return get_example_list(project)
        if type_ == "add to model":
            return add_example_to_model(project, body)
    except FlexToolException as error:
        return HttpResponseBadRequest(str(error))
    return HttpResponseBadRequest("Unknown 'type'.")


@login_required
def export_model_database(request, project_id):
    """Creates a model database file download response.

    Args:
        request (HttpRequest): client's request
        project_id (int): project id

    Returns:
        HttpResponse: server response
    """
    project = get_object_or_404(Project, pk=project_id, user=request.user.id)
    return FileResponse(open(project.model_database_path(), "rb"), as_attachment=True)


@login_required
def import_file(request, project_id):
    """Saves uploaded model database file to project.

    Args:
        request (HttpRequest): client's request
        project_id (int): project id

    Returns:
        HttpResponse: server response
    """
    project = get_object_or_404(Project, pk=project_id, user=request.user.id)
    return save_imported_file(request, project)


def _ensure_database_up_to_date(func, database, request, project_id):
    """Ensures that database is up-to-date before rendering a page.

    Returns special response if a database needs an upgrade.
    Otherwise, returns response generated by ''func''.

    Args:
        func (Callable): function returning HttpResponse
        database (Database): which database is going to be used
        request (HttpRequest): request object
        project_id (int): project's primary key

    Returns:
        HttpResponse: response object
    """
    project = get_object_or_404(Project, pk=project_id, user=request.user.id)
    if database == Database.MODEL:
        db_path = project.model_database_path()
        create_database = False
    else:
        db_path = project.results_database_path()
        create_database = not db_path.exists()
        if create_database:
            db_path.parent.mkdir(parents=True, exist_ok=True)
    db_url = "sqlite:///" + str(db_path)
    try:
        db_map = DatabaseMapping(db_url, create=create_database)
    except SpineDBVersionError:
        _backup_database(db_path)
        try:
            db_map = DatabaseMapping(db_url, upgrade=True)
        except SpineDBAPIError as error:
            return HttpResponseServerError(f"Failed to upgrade database: {error}")
        else:
            db_map.close()
            context = {"database": "model" if database == Database.MODEL else "result"}
            return render(request, "flextool3/database_upgraded.html", context)
    except SpineDBAPIError as error:
        return HttpResponseServerError(f"Failed to open database mapping: {error}")
    else:
        try:
            return func(project, db_map)
        finally:
            db_map.close()


def _backup_database(database_path):
    """Backs up a file.

    Args:
        database_path (Path): path to .sqlite file
    """
    backup_path = database_path.parent / (database_path.name + ".backup")
    copyfile(database_path, backup_path)
