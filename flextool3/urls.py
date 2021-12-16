from django.urls import include, path
from . import views


app_name = "flextool3"
urlpatterns = [
    path("accounts/", include("django.contrib.auth.urls")),
    path("", views.IndexView.as_view(), name="index"),
    path("<int:pk>/", views.DetailView.as_view(), name="detail"),
    path("<int:pk>/edit/", views.EditView.as_view(), name="edit"),
    path("<int:pk>/solve/", views.SolveView.as_view(), name="solve"),
    path("<int:pk>/results/", views.ResultsView.as_view(), name="view"),
    path("ama/", views.ama, name="ama"),
    path("model/", views.model, name="model"),
]
