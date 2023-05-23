"""FlexTool3 app URL configuration."""
from django.urls import include, path
from . import views


app_name = "flextool3"  # pylint: disable=invalid-name
urlpatterns = [
    path("accounts/", include("django.contrib.auth.urls")),
    path("", views.IndexView.as_view(), name="index"),
    path("<int:project_id>/", views.detail, name="detail"),
    path("<int:project_id>/edit/", views.edit, name="edit"),
    path("<int:project_id>/edit/class/<int:class_id>", views.entities, name="entities"),
    path("<int:project_id>/edit/scenarios/", views.scenarios, name="scenarios"),
    path("<int:project_id>/run/", views.run, name="run"),
    path("<int:project_id>/results/", views.results, name="view"),
    path("projects/", views.projects, name="projects"),
    path("model/", views.model, name="model"),
    path("executions/", views.executions, name="executions"),
    path("summary/", views.summary, name="summary"),
    path("analysis/", views.analysis, name="analysis"),
    path("examples/", views.examples, name="examples"),
    path(
        "<int:project_id>/results_database/",
        views.export_model_database,
        name="model_export",
    ),
    path(
        "<int:project_id>/upload/",
        views.import_file,
        name="upload",
    ),
]
