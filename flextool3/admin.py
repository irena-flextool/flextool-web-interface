"""Contains settings for the Admin Django app."""
from django.contrib import admin
from .models import Project, Scenario, ScenarioExecution


admin.site.register(Scenario)
admin.site.register(Project)
admin.site.register(ScenarioExecution)
