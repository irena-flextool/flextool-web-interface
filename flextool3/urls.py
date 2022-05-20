from django.urls import include, path
from . import views


app_name = "flextool3"
urlpatterns = [
    path("accounts/", include("django.contrib.auth.urls")),
    path("", views.IndexView.as_view(), name="index"),
    path("<int:pk>/", views.detail, name="detail"),
    path("<int:pk>/edit/", views.edit, name="edit"),
    path("<int:pk>/edit/class/<int:class_id>", views.entities, name="entities"),
    path("<int:pk>/edit/scenarios/", views.scenarios, name="scenarios"),
    path("<int:pk>/run/", views.run, name="run"),
    path("<int:pk>/results/", views.results, name="view"),
    path("projects/", views.projects, name="projects"),
    path("model/", views.model, name="model"),
    path("executions/", views.executions, name="executions"),
    path("summary/", views.summary, name="summary"),
    path("analysis/", views.analysis, name="analysis"),
]
