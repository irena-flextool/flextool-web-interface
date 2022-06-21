from bisect import bisect_left
import datetime
import os
from pathlib import Path
import re
from shutil import copytree, rmtree
import stat
from django.contrib.auth.models import User
from django.db import models
from django.urls import reverse
from .exception import FlextoolException
from .time_utils import naive_local_time

PROJECT_NAME_LENGTH = 60
SUMMARY_FILE_NAME = "summary_solve.csv"


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

        def del_read_only_file(_, name, __):
            os.chmod(name, stat.S_IWRITE)
            os.remove(name)

        rmtree(self.path, onerror=del_read_only_file)

    def model_database_path(self):
        """Returns path to model database.

        Returns:
            Path: path to model database
        """
        return Path(self.path) / "Input_data.sqlite"

    def results_database_path(self):
        """Returns path to results database.

        Returns:
            Path: path to model database
        """
        return (
            Path(self.path)
            / ".spinetoolbox"
            / "items"
            / "results"
            / "Results_F3.sqlite"
        )

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


def _find_next_summary(summary_files, time_point, timezone_offset):
    """Returns path to the summary file created right after given point in time.

    Args:
        summary_files (list of tuple): list of time stamp - summary path pairs
        time_point (datetime.datetime): execution time in UTC
        timezone_offset (int): time offset from UTC to local time in seconds

    Returns:
        Path: path to summary file or None if not found
    """
    summary_files = sorted(summary_files, key=lambda pair: pair[0])
    stamps = [pair[0] for pair in summary_files]
    local_time_point = naive_local_time(time_point, timezone_offset)
    i = bisect_left(stamps, local_time_point)
    return summary_files[i][1] if i != len(stamps) else None


class Scenario(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    name = models.CharField(max_length=255, null=False)


def _scenario_from_filter_id(filter_id):
    """Parses scenario name from filter id.

    Args:
        filter_id (str): filter id

    Returns:
        str: scenario name
    """
    front = filter_id[: -len(" - Input_data")]
    filter_1_name, filter_2_name = (name.strip() for name in front.split(","))
    return filter_1_name if filter_1_name != "FlexTool3" else filter_2_name


class ScenarioExecution(models.Model):
    scenario = models.ForeignKey(Scenario, on_delete=models.CASCADE)
    execution_time = models.DateTimeField(null=False)
    execution_time_offset = models.IntegerField(null=False)
    log = models.TextField(null=False)

    def summary_path(self):
        """Returns path to the execution's summary file.

        Returns:
            Path: path to summary file or None if no summary exists
        """
        output_directory = (
            Path(self.scenario.project.path)
            / ".spinetoolbox"
            / "items"
            / "flextool3"
            / "output"
        )
        if not output_directory.exists():
            return None
        time_stamp = re.compile(
            r"^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}\.[0-9]{2}\.[0-9]{2}$"
        )
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
            scenario = _scenario_from_filter_id(filter_id)
            if scenario != self.scenario.name:
                continue
            summary_files = []
            for results_dir in subdir.iterdir():
                if time_stamp.match(results_dir.name) is None:
                    continue
                summary_path = results_dir / "output" / SUMMARY_FILE_NAME
                if not summary_path.exists() or not summary_path.is_file():
                    continue
                execution_time = datetime.datetime.fromisoformat(
                    results_dir.name.replace(".", ":")
                )
                summary_files.append((execution_time, summary_path))
            if not summary_files:
                continue
            return _find_next_summary(
                summary_files,
                self.execution_time,
                self.execution_time_offset,
            )
        return None
