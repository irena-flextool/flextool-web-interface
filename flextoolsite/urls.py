from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path("flextool3/", include("flextool3.urls")),
    path("admin/", admin.site.urls),
]
