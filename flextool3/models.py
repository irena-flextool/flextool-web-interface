import os
from pathlib import Path
from shutil import copytree, rmtree
import stat
from django.contrib.auth.models import User
from django.db import models
from django.urls import reverse
from django.utils import timezone
from django.utils.translation import gettext_lazy
from .exception import FlextoolException
from . import execution

PROJECT_NAME_LENGTH = 60


class Project(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=PROJECT_NAME_LENGTH)
    path = models.CharField(max_length=500)

    def __str__(self):
        return self.name

    @staticmethod
    def create(user, project_name, projects_root_dir, template_dir):
        """Copies project template to project directory and makes a project model.

        Args;
            user (User): project owner
            project_name (str): project name
            project_root_dir (Path): directory where the project directory should be copied
            template_dir (Path): directory of the template project

        Returns:
            Project: freshly created project
        """
        if Project.objects.filter(user=user, name=project_name).all():
            raise FlextoolException("project name already in use.")
        project_dir = projects_root_dir / user.username / project_name
        copytree(template_dir, project_dir)
        return Project(user=user, name=project_name, path=str(project_dir))

    def remove_project_dir(self):
        """Removes project directory including all project files."""

        def del_read_only_file(action, name, exc):
            os.chmod(name, stat.S_IWRITE)
            os.remove(name)

        rmtree(self.path, onerror=del_read_only_file)

    def model_database_path(self):
        """Returns path to model database.

        Returns:
            Path: path to model database
        """
        return Path(self.path) / "FlexTool3_data.sqlite"

    def results_database_path(self):
        """Returns path to results database.

        Returns:
            Path: path to model database
        """
        return Path(self.path) / ".spinetoolbox" / "items" / "results_f3" / "Results_F3.sqlite"

    def project_list_data(self):
        """Creates data dict for project index page's project list.

        Returns:
            dict: project list data
        """
        return {"name": self.name, "id": self.id, "url": reverse("flextool3:detail", args=(self.id,))}


class Execution(models.Model):
    class Status(models.TextChoices):
        YET_TO_START = "YS", gettext_lazy("Not started yet")
        FINISHED = "OK", gettext_lazy("Finished")
        RUNNING = "RU", gettext_lazy("Running")
        ERROR = "ER", gettext_lazy("Finished with errors")
        ABORTED = "AB", gettext_lazy("Aborted")

    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    execution_time = models.DateTimeField(null=True, default=None)
    status = models.CharField(max_length=2, choices=Status.choices, default=Status.YET_TO_START)
    log = models.TextField(default="")

    def append_log(self):
        """Reads a line from process' stdout and appends it to log.

        Returns:
            list of str: log lines or None if no log is available
        """
        if self.status != self.Status.RUNNING:
            return None
        if not execution.is_running(self.id):
            lines = execution.read_lines(self.id)
            for line in lines:
                self.log += line
            self.status = self.Status.FINISHED
            self.save()
            return lines
        line = execution.read_line(self.id)
        self.log += line
        self.save()
        return [line]

    def start(self, command, arguments):
        """Starts executing given command.

        Args:
            command (str): command to execute
            arguments (list of str): command line arguments
        """
        if self.status != self.Status.YET_TO_START:
            return
        self.execution_time = timezone.now()
        self.status = self.Status.RUNNING
        execution.start(self.id, command, arguments)
        self.save()

    def execution_list_data(self):
        """Creates data dict for solve page's execution list.

        Returns:
            dict: execution list data
        """
        return {"id": self.id}
