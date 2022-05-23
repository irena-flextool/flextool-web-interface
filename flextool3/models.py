from datetime import datetime
import os
from pathlib import Path
import re
from shutil import copytree, rmtree
import stat
from django.contrib.auth.models import User
from django.db import models
from django.urls import reverse
from django.utils import timezone
from django.utils.translation import gettext_lazy
from .exception import FlextoolException
from . import executor, task_loop

PROJECT_NAME_LENGTH = 60


class Project(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=PROJECT_NAME_LENGTH)
    path = models.CharField(max_length=500)

    def __str__(self):
        return str(self.name)

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
        return (
            Path(self.path)
            / ".spinetoolbox"
            / "items"
            / "flextool3_test_data"
            / "FlexTool3_data.sqlite"
        )

    def results_database_path(self):
        """Returns path to results database.

        Returns:
            Path: path to model database
        """
        return (
            Path(self.path)
            / ".spinetoolbox"
            / "items"
            / "results_f3"
            / "Results_F3.sqlite"
        )

    def summary_path(self):
        """Returns paths to the latest summary files.

        Returns:
            dict: paths to summary files keyed by Spine filter id
        """
        output_directory = (
            Path(self.path) / ".spinetoolbox" / "items" / "flextool3" / "output"
        )
        if not output_directory.exists():
            return {}
        time_stamp = re.compile(
            r"^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}\.[0-9]{2}\.[0-9]{2}$"
        )
        summaries = {}
        for subdir in output_directory.iterdir():
            if not subdir.is_dir():
                continue
            filter_id_path = subdir / ".filter_id"
            if not filter_id_path.exists():
                continue
            with open(filter_id_path, encoding="utf-8") as filter_id_file:
                filter_id = filter_id_file.readline().strip()
            if not filter_id:
                continue
            summary_files = []
            for results_dir in subdir.iterdir():
                if time_stamp.match(results_dir.name) is None:
                    continue
                summary_path = results_dir / "r_summary_solve.csv"
                if not summary_path.exists() or not summary_path.is_file():
                    continue
                execution_time = datetime.fromisoformat(
                    results_dir.name.replace(".", ":")
                )
                summary_files.append((execution_time, summary_path))
            if not summary_files:
                continue
            latest_summary_path = sorted(summary_files, key=lambda x: x[0])[-1][1]
            summaries[filter_id] = latest_summary_path
        return summaries

    def project_list_data(self):
        """Creates data dict for project index page's project list.

        Returns:
            dict: project list data
        """
        return {
            "name": self.name,
            "id": self.id,
            "url": reverse("flextool3:detail", args=(self.id,)),
        }


class Execution(models.Model):
    class Status(models.TextChoices):
        YET_TO_START = "YS", gettext_lazy("Not started yet")
        FINISHED = "OK", gettext_lazy("Finished")
        RUNNING = "RU", gettext_lazy("Running")
        ERROR = "ER", gettext_lazy("Finished with errors")
        ABORTED = "AB", gettext_lazy("Aborted")

    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    execution_time = models.DateTimeField(null=True, default=None)
    status = models.CharField(
        max_length=2, choices=Status.choices, default=Status.YET_TO_START
    )
    log = models.TextField(default="")

    def briefing(self):
        """Checks execution and returns its status and log.

        Returns:
            dict: execution briefing
        """
        if self.status == self.Status.RUNNING:
            execution_status = executor.execution_status(self.id)
            if execution_status != task_loop.Error.UNKNOWN_EXECUTION_ID:
                logs = executor.read_lines(self.id)
                if logs:
                    self.log += "".join(logs)
                if execution_status == task_loop.Status.FINISHED:
                    return_code = executor.execution_return_code(self.id)
                    executor.remove(self.id)
                    self.status = (
                        self.Status.FINISHED if return_code == 0 else self.Status.ERROR
                    )
                elif execution_status == task_loop.Status.ABORTED:
                    executor.remove(self.id)
                    self.status = self.Status.ABORTED
                self.save()
            else:
                self.status = self.Status.ABORTED
                self.save()
        return {"status": self.status, "log": self.log.split("\n")}

    def start(self, command, arguments):
        """Starts executing given command.

        Args:
            command (str): command to execute
            arguments (list of str): command line arguments
        """
        if self.status == self.Status.RUNNING:
            return
        self.execution_time = timezone.now()
        self.log = ""
        self.status = self.Status.RUNNING
        executor.start(self.id, command, arguments)
        self.save()

    def execution_list_data(self):
        """Creates data dict for Run page's execution list.

        Returns:
            dict: execution list data
        """
        return {"id": self.id}

    def arguments(self):
        return [
            "-mspinetoolbox",
            "--execute-only",
            str(self.project.path),
            "--select",
            "FlexTool3_test_data",
            "ExportFlexTool3ToCSV",
            "FlexTool3",
            "Import_Flex3",
            "Results_F3",
        ]
