import csv
from datetime import datetime
from io import StringIO
import json
from contextlib import contextmanager
from pathlib import Path
from shutil import copyfile
import sys
from tempfile import TemporaryDirectory
import unittest
from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from spinedb_api import (
    DatabaseMapping,
    from_database,
    import_alternatives,
    import_object_classes,
    import_object_parameter_values,
    import_object_parameters,
    import_objects,
    import_parameter_value_lists,
    import_relationship_classes,
    import_relationships,
    import_relationship_parameters,
    Map,
    Array,
    import_scenarios,
    import_scenario_alternatives,
)

from .exception import FlexToolException
from . import executor, task_loop, views
from .models import Project, Scenario, ScenarioExecution, SUMMARY_FILE_NAME
from .summary_view import number_to_float
from . import executions_view


PATH_TO_MODEL_DATABASE = Path("Input_data.sqlite")
PATH_TO_RESULT_DATABASE = Path(".spinetoolbox", "items", "results", "Results_F3.sqlite")
PATH_TO_INITIALIZATION_DATABASE = Path("Init.sqlite")


def build_fake_project_template(root_dir):
    """Builds project template directory with empty model and result database files but naught else.

    Args:
        root_dir (Path): path to template's parent directory

    Returns:
        Path: path to project template directory
    """
    project_dir = root_dir / "flextool3"
    project_dir.mkdir()
    model_database_file = project_dir / PATH_TO_MODEL_DATABASE
    model_database_file.touch()
    result_database_dir = project_dir / PATH_TO_RESULT_DATABASE.parent
    result_database_dir.mkdir(parents=True)
    result_database_file = result_database_dir / PATH_TO_RESULT_DATABASE.name
    result_database_file.touch()
    return project_dir


@contextmanager
def fake_project(user):
    with TemporaryDirectory() as temp_dir:
        template_root_dir = Path(temp_dir, "template")
        template_root_dir.mkdir()
        template_dir = build_fake_project_template(template_root_dir)
        projects_root = Path(temp_dir, "projects")
        project = Project.create(user, "my_test_project", projects_root, template_dir)
        project.save()
        yield project


@contextmanager
def login_as_baron(client):
    try:
        yield client.login(username="baron", password="secretbaron")
    finally:
        client.logout()


class ProjectModelTests(TestCase):
    def test_template_directory_cloning(self):
        """create() clones the template project directory to target directory."""
        with TemporaryDirectory() as temp_dir:
            template_root_dir = Path(temp_dir, "template")
            template_root_dir.mkdir()
            template_dir = build_fake_project_template(template_root_dir)
            projects_root = Path(temp_dir, "projects")
            user = User(username="baron", password="it's a secret")
            project = Project.create(
                user, "my_test_project", projects_root, template_dir
            )
            self.assertEqual(project.user, user)
            self.assertEqual(
                project.path, str(projects_root / "baron" / "my_test_project")
            )
            model_database_file = (
                projects_root / "baron" / "my_test_project" / PATH_TO_MODEL_DATABASE
            )
            self.assertTrue(model_database_file.exists())
            result_database_file = (
                projects_root / "baron" / "my_test_project" / PATH_TO_RESULT_DATABASE
            )
            self.assertTrue(result_database_file.exists())

    def test_create_refuses_to_create_duplicate_project_names(self):
        """create() raises an exception if user already has a project under the same name."""
        user = User(username="baron", password="it's a secret")
        user.save()
        with fake_project(user) as project:
            projects_root_dir = Path(project.path).parent.parent
            template_dir = projects_root_dir.parent / "template"
            self.assertTrue(template_dir.exists())
            self.assertRaises(
                FlexToolException,
                Project.create,
                user,
                "my_test_project",
                projects_root_dir,
                template_dir,
            )

    def test_remove_project_dir(self):
        """remove_project_dir() removes project directory."""
        user = User(username="baron", password="it's a secret")
        user.save()
        with fake_project(user) as project:
            project = Project.objects.get(name="my_test_project")
            project.remove_project_dir()
            self.assertFalse(Path(project.path).exists())


class ScenarioExecutionModelTests(TestCase):
    baron = None

    @classmethod
    def setUpTestData(cls):
        cls.baron = User(username="baron", password="")
        cls.baron.set_password("secretbaron")
        cls.baron.save()

    def test_summary_path(self):
        with fake_project(self.baron) as project:
            scenario = Scenario(project=project, name="my_scenario")
            scenario.save()
            scenario_execution = ScenarioExecution(
                scenario=scenario,
                execution_time=datetime.fromisoformat("2023-05-23T15:23:00+03:00"),
                execution_time_offset=3 * 3600,
                log="",
            )
            scenario_execution.save()
            output_dir = (
                Path(project.path) / ".spinetoolbox" / "items" / "flextool3" / "output"
            )
            failed_dir = output_dir / "failed"
            failed_dir.mkdir(parents=True)
            run_dir = output_dir / "dc03f1ea3aebbee9146b9cf380472f6045c0927d"
            run_dir.mkdir(parents=True)
            with open(run_dir / ".filter_id", "w", encoding="utf-8") as filter_id_file:
                filter_id_file.writelines(["my_scenario, FlexTool3 - Input_data\n"])
            runs = ["2023-05-23T14.05.23", "2023-05-23T15.23.05"]
            for run in runs:
                run_output_dir = run_dir / run / "output"
                run_output_dir.mkdir(parents=True)
                (run_output_dir / SUMMARY_FILE_NAME).touch()
            summary_path = scenario_execution.summary_path()
            self.assertEqual(
                summary_path,
                run_dir / "2023-05-23T15.23.05" / "output" / SUMMARY_FILE_NAME,
            )

    def test_deleting_scenario_execution_removes_leftover_files_and_data(self):
        with fake_project(self.baron) as project:
            scenario = Scenario(project=project, name="my_scenario")
            scenario.save()
            scenario_execution = ScenarioExecution(
                scenario=scenario,
                execution_time=datetime.fromisoformat("2023-05-23T15:23:00+03:00"),
                execution_time_offset=3 * 3600,
                log="",
            )
            scenario_execution.save()
            output_dir = (
                Path(project.path) / ".spinetoolbox" / "items" / "flextool3" / "output"
            )
            failed_dir = output_dir / "failed"
            failed_dir.mkdir(parents=True)
            run_dir = output_dir / "dc03f1ea3aebbee9146b9cf380472f6045c0927d"
            run_dir.mkdir(parents=True)
            with open(run_dir / ".filter_id", "w", encoding="utf-8") as filter_id_file:
                filter_id_file.writelines(["my_scenario, FlexTool3 - Input_data\n"])
            runs = ["2023-05-23T14.05.23", "2023-05-23T15.23.05"]
            for run in runs:
                run_output_dir = run_dir / run / "output"
                run_output_dir.mkdir(parents=True)
                (run_output_dir / SUMMARY_FILE_NAME).touch()
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_RESULT_DATABASE),
                create=True,
            )
            import_object_classes(db_map, ("my_object_class",))
            import_objects(db_map, (("my_object_class", "my_object"),))
            import_object_parameters(db_map, (("my_object_class", "my_parameter"),))
            import_alternatives(
                db_map,
                (
                    "my_scenario__Import_results@2023-05-23T14:05:30",
                    "my_scenario__Import_results@2023-05-23T15:23:11",
                ),
            )
            import_object_parameter_values(
                db_map,
                (
                    (
                        "my_object_class",
                        "my_object",
                        "my_parameter",
                        2.3,
                        "my_scenario__Import_results@2023-05-23T14:05:30",
                    ),
                    (
                        "my_object_class",
                        "my_object",
                        "my_parameter",
                        5.5,
                        "my_scenario__Import_results@2023-05-23T15:23:11",
                    ),
                ),
            )
            db_map.commit_session("Add test data.")
            deleted = scenario_execution.delete()
            self.assertEqual(deleted[0], 1)
            alternative_names = {
                row.name for row in db_map.query(db_map.alternative_sq)
            }
            self.assertEqual(
                alternative_names,
                {"Base", "my_scenario__Import_results@2023-05-23T14:05:30"},
            )
            parameter_values = [
                from_database(row.value)
                for row in db_map.query(db_map.parameter_value_sq)
            ]
            self.assertEqual(parameter_values, [2.3])
            db_map.connection.close()
            self.assertTrue((run_dir / "2023-05-23T14.05.23").exists())
            self.assertFalse((run_dir / "2023-05-23T15.23.05").exists())


class ProjectsInterfaceTests(TestCase):
    baron = None
    projects_url = reverse("flextool3:projects")

    @classmethod
    def setUpTestData(cls):
        cls.baron = User(username="baron", password="")
        cls.baron.set_password("secretbaron")
        cls.baron.save()

    def test_get_empty_project_list(self):
        """'ama' view responds to 'project list?' post properly even when there are no projects in the database."""
        with login_as_baron(self.client) as login_successful:
            self.assertTrue(login_successful)
            response = self.client.post(
                self.projects_url,
                {"type": "project list?"},
                content_type="application/json",
            )
            self.assertEqual(response.status_code, 200)
            project_list_dict = json.loads(response.content)
            self.assertEqual(project_list_dict, {"projects": []})

    def test_get_populated_project_list(self):
        """'ama' view responds to 'project list?' post properly with a list of user's projects."""
        with fake_project(self.baron):
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.projects_url,
                    {"type": "project list?"},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                project_list_dict = json.loads(response.content)
                self.assertEqual(
                    project_list_dict,
                    {
                        "projects": [
                            {"id": 1, "name": "my_test_project", "url": "/flextool3/1/"}
                        ]
                    },
                )

    def test_delete_project(self):
        """'ama' view deletes the requested project."""
        with fake_project(self.baron) as project:
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.projects_url,
                    {"type": "destroy project?", "id": 1},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                destroy_project_dict = json.loads(response.content)
                self.assertEqual(destroy_project_dict, {"id": 1})
                self.assertFalse(Project.objects.all())
                self.assertFalse(Path(project.path).exists())


class ModelInterfaceTests(TestCase):
    baron = None
    model_url = reverse("flextool3:model")

    @classmethod
    def setUpTestData(cls):
        cls.baron = User(username="baron", password="")
        cls.baron.set_password("secretbaron")
        cls.baron.save()

    def test_get_alternatives(self):
        """'model' view responds correctly when requesting alternatives."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {"type": "alternatives?", "projectId": 1},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(
                    content,
                    {
                        "alternatives": [
                            {
                                "name": "Base",
                                "id": 1,
                                "description": "Base alternative",
                                "commit_id": 1,
                            }
                        ]
                    },
                )

    def test_get_scenarios(self):
        """'model' view responds correctly when requesting scenarios."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_alternatives(db_map, ("my_alternative",))
            import_scenarios(db_map, ("my_scenario",))
            import_scenario_alternatives(db_map, (("my_scenario", "my_alternative"),))
            import_scenario_alternatives(db_map, (("my_scenario", "Base"),))
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {"type": "scenarios?", "projectId": 1},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(
                    content,
                    {
                        "scenarios": [
                            {
                                "scenario_name": "my_scenario",
                                "scenario_id": 1,
                                "scenario_alternatives": ["my_alternative", "Base"],
                            }
                        ]
                    },
                )

    def test_get_scenarios_without_alternatives(self):
        """'model' view responds with empty alternative list when scenarios doesn't have any."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_scenarios(db_map, ("my_scenario",))
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {"type": "scenarios?", "projectId": 1},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(
                    content,
                    {
                        "scenarios": [
                            {
                                "scenario_name": "my_scenario",
                                "scenario_id": 1,
                                "scenario_alternatives": [],
                            }
                        ]
                    },
                )

    def test_get_emtpy_object_classes(self):
        """'model' view responds correctly even when there are not object classes in the database."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {"type": "object classes?", "projectId": 1},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(content, {"classes": []})

    def test_get_single_object_class(self):
        """'model' view responds with a dict containing a single object class in a list."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_object_classes(db_map, ("my_class",))
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {"type": "object classes?", "projectId": 1},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(
                    content,
                    {
                        "classes": [
                            {
                                "commit_id": 2,
                                "description": None,
                                "display_icon": None,
                                "display_order": 99,
                                "hidden": 0,
                                "id": 1,
                                "name": "my_class",
                            }
                        ]
                    },
                )

    def test_get_all_objects(self):
        """'model' view responds with a dict containing all objects in the database."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_object_classes(db_map, ("class_1", "class_2"))
            import_objects(db_map, (("class_1", "object_11"), ("class_2", "object_21")))
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {"type": "objects?", "projectId": 1},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(
                    content,
                    {
                        "objects": [
                            {
                                "id": 1,
                                "class_id": 1,
                                "name": "object_11",
                                "description": None,
                                "commit_id": 2,
                            },
                            {
                                "id": 2,
                                "class_id": 2,
                                "name": "object_21",
                                "description": None,
                                "commit_id": 2,
                            },
                        ]
                    },
                )

    def test_get_objects_of_given_class(self):
        """'model' view responds with a dict containing the objects of the object class with given id."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_object_classes(db_map, ("class_1", "class_2"))
            import_objects(db_map, (("class_1", "object_11"), ("class_2", "object_21")))
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {"type": "objects?", "projectId": 1, "object_class_id": 2},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                object_dicts = json.loads(response.content)
                self.assertEqual(
                    object_dicts,
                    {
                        "objects": [
                            {
                                "id": 2,
                                "class_id": 2,
                                "name": "object_21",
                                "description": None,
                                "commit_id": 2,
                            }
                        ]
                    },
                )

    def test_get_objects_of_non_existing_class_returns_empty_results(self):
        """'model' view responds with empty objects list when queried for objects of a non-existing class."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {"type": "objects?", "projectId": 1, "object_class_id": 1},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(content, {"objects": []})

    def test_get_all_object_parameter_definitions(self):
        """without filtering, 'model' view responds with all parameter definitions."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_object_classes(db_map, ("class_1", "class_2"))
            import_object_parameters(
                db_map, (("class_1", "parameter_1"), ("class_2", "parameter_2"))
            )
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {"type": "parameter definitions?", "projectId": 1},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                definition_dicts = json.loads(response.content)
                self.assertEqual(
                    definition_dicts,
                    {
                        "definitions": [
                            {
                                "id": 1,
                                "entity_class_id": 1,
                                "object_class_id": 1,
                                "relationship_class_id": None,
                                "name": "parameter_1",
                                "parameter_value_list_id": None,
                                "list_value_id": None,
                                "default_value": None,
                                "default_type": None,
                                "description": None,
                                "commit_id": 2,
                            },
                            {
                                "id": 2,
                                "entity_class_id": 2,
                                "object_class_id": 2,
                                "relationship_class_id": None,
                                "name": "parameter_2",
                                "parameter_value_list_id": None,
                                "list_value_id": None,
                                "default_value": None,
                                "default_type": None,
                                "description": None,
                                "commit_id": 2,
                            },
                        ]
                    },
                )

    def test_get_parameter_definitions_for_given_class_id(self):
        """'model' view responds with correct parameter definitions when filtering by object class id."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_object_classes(db_map, ("class_1", "class_2"))
            import_object_parameters(
                db_map, (("class_1", "parameter_1"), ("class_2", "parameter_2"))
            )
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "parameter definitions?",
                        "projectId": 1,
                        "class_id": 2,
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                definition_dicts = json.loads(response.content)
                self.assertEqual(
                    definition_dicts,
                    {
                        "definitions": [
                            {
                                "id": 2,
                                "entity_class_id": 2,
                                "object_class_id": 2,
                                "relationship_class_id": None,
                                "name": "parameter_2",
                                "parameter_value_list_id": None,
                                "list_value_id": None,
                                "default_value": None,
                                "default_type": None,
                                "description": None,
                                "commit_id": 2,
                            },
                        ]
                    },
                )

    def test_get_all_parameter_values(self):
        """without filtering, 'model' view responds with all parameter values."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_alternatives(db_map, ("alternative",))
            import_object_classes(db_map, ("class_1", "class_2"))
            import_object_parameters(
                db_map, (("class_1", "parameter_1"), ("class_2", "parameter_2"))
            )
            import_objects(db_map, (("class_1", "object_11"), ("class_2", "object_21")))
            import_object_parameter_values(
                db_map,
                (
                    ("class_1", "object_11", "parameter_1", 5.0, "Base"),
                    ("class_1", "object_11", "parameter_1", -5.0, "alternative"),
                    ("class_2", "object_21", "parameter_2", 23.0, "Base"),
                    ("class_2", "object_21", "parameter_2", -23.0, "alternative"),
                ),
            )
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {"type": "parameter values?", "projectId": 1},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                value_dicts = json.loads(response.content)
                self.assertEqual(
                    value_dicts,
                    {
                        "values": [
                            {
                                "id": 1,
                                "entity_class_id": 1,
                                "object_class_id": 1,
                                "relationship_class_id": None,
                                "entity_id": 1,
                                "object_id": 1,
                                "relationship_id": None,
                                "parameter_definition_id": 1,
                                "alternative_id": 1,
                                "value": "5.0",
                                "type": None,
                                "list_value_id": None,
                                "commit_id": 2,
                            },
                            {
                                "id": 2,
                                "entity_class_id": 1,
                                "object_class_id": 1,
                                "relationship_class_id": None,
                                "entity_id": 1,
                                "object_id": 1,
                                "relationship_id": None,
                                "parameter_definition_id": 1,
                                "alternative_id": 2,
                                "value": "-5.0",
                                "type": None,
                                "list_value_id": None,
                                "commit_id": 2,
                            },
                            {
                                "id": 3,
                                "entity_class_id": 2,
                                "object_class_id": 2,
                                "relationship_class_id": None,
                                "entity_id": 2,
                                "object_id": 2,
                                "relationship_id": None,
                                "parameter_definition_id": 2,
                                "alternative_id": 1,
                                "value": "23.0",
                                "type": None,
                                "list_value_id": None,
                                "commit_id": 2,
                            },
                            {
                                "id": 4,
                                "entity_class_id": 2,
                                "object_class_id": 2,
                                "relationship_class_id": None,
                                "entity_id": 2,
                                "object_id": 2,
                                "relationship_id": None,
                                "parameter_definition_id": 2,
                                "alternative_id": 2,
                                "value": "-23.0",
                                "type": None,
                                "list_value_id": None,
                                "commit_id": 2,
                            },
                        ]
                    },
                )

    def test_get_parameter_values_for_given_class(self):
        """'model' view responds with parameter values filtered by object class id."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_alternatives(db_map, ("alternative",))
            import_object_classes(db_map, ("class_1", "class_2"))
            import_object_parameters(
                db_map, (("class_1", "parameter_1"), ("class_2", "parameter_2"))
            )
            import_objects(db_map, (("class_1", "object_11"), ("class_2", "object_21")))
            import_object_parameter_values(
                db_map,
                (
                    ("class_1", "object_11", "parameter_1", 5.0, "Base"),
                    ("class_1", "object_11", "parameter_1", -5.0, "alternative"),
                    ("class_2", "object_21", "parameter_2", 23.0, "Base"),
                    ("class_2", "object_21", "parameter_2", -23.0, "alternative"),
                ),
            )
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "parameter values?",
                        "projectId": 1,
                        "class_id": 2,
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                value_dicts = json.loads(response.content)
                self.assertEqual(
                    value_dicts,
                    {
                        "values": [
                            {
                                "id": 3,
                                "entity_class_id": 2,
                                "object_class_id": 2,
                                "relationship_class_id": None,
                                "entity_id": 2,
                                "object_id": 2,
                                "relationship_id": None,
                                "parameter_definition_id": 2,
                                "alternative_id": 1,
                                "value": "23.0",
                                "type": None,
                                "list_value_id": None,
                                "commit_id": 2,
                            },
                            {
                                "id": 4,
                                "entity_class_id": 2,
                                "object_class_id": 2,
                                "relationship_class_id": None,
                                "entity_id": 2,
                                "object_id": 2,
                                "relationship_id": None,
                                "parameter_definition_id": 2,
                                "alternative_id": 2,
                                "value": "-23.0",
                                "type": None,
                                "list_value_id": None,
                                "commit_id": 2,
                            },
                        ]
                    },
                )

    def test_get_parameter_values_for_given_object(self):
        """'model' view responds with parameter values filtered by object id."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_alternatives(db_map, ("alternative",))
            import_object_classes(db_map, ("class_1",))
            import_object_parameters(db_map, (("class_1", "parameter_1"),))
            import_objects(db_map, (("class_1", "object_11"), ("class_1", "object_12")))
            import_object_parameter_values(
                db_map,
                (
                    ("class_1", "object_11", "parameter_1", 5.0, "Base"),
                    ("class_1", "object_11", "parameter_1", -5.0, "alternative"),
                    ("class_1", "object_12", "parameter_1", 23.0, "Base"),
                    ("class_1", "object_12", "parameter_1", -23.0, "alternative"),
                ),
            )
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "parameter values?",
                        "projectId": 1,
                        "entity_id": 2,
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                value_dicts = json.loads(response.content)
                self.assertEqual(
                    value_dicts,
                    {
                        "values": [
                            {
                                "id": 3,
                                "entity_class_id": 1,
                                "object_class_id": 1,
                                "relationship_class_id": None,
                                "entity_id": 2,
                                "object_id": 2,
                                "relationship_id": None,
                                "parameter_definition_id": 1,
                                "alternative_id": 1,
                                "value": "23.0",
                                "type": None,
                                "list_value_id": None,
                                "commit_id": 2,
                            },
                            {
                                "id": 4,
                                "entity_class_id": 1,
                                "object_class_id": 1,
                                "relationship_class_id": None,
                                "entity_id": 2,
                                "object_id": 2,
                                "relationship_id": None,
                                "parameter_definition_id": 1,
                                "alternative_id": 2,
                                "value": "-23.0",
                                "type": None,
                                "list_value_id": None,
                                "commit_id": 2,
                            },
                        ]
                    },
                )

    def test_get_parameter_values_for_given_alternative(self):
        """'model' view responds with parameter values filtered by alternative id."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_alternatives(db_map, ("alternative",))
            import_object_classes(db_map, ("class_1", "class_2"))
            import_object_parameters(
                db_map, (("class_1", "parameter_1"), ("class_2", "parameter_2"))
            )
            import_objects(db_map, (("class_1", "object_11"), ("class_2", "object_21")))
            import_object_parameter_values(
                db_map,
                (
                    ("class_1", "object_11", "parameter_1", 5.0, "Base"),
                    ("class_1", "object_11", "parameter_1", -5.0, "alternative"),
                    ("class_2", "object_21", "parameter_2", 23.0, "Base"),
                    ("class_2", "object_21", "parameter_2", -23.0, "alternative"),
                ),
            )
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "parameter values?",
                        "projectId": 1,
                        "alternative_id": 2,
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                value_dicts = json.loads(response.content)
                self.assertEqual(
                    value_dicts,
                    {
                        "values": [
                            {
                                "id": 2,
                                "entity_class_id": 1,
                                "object_class_id": 1,
                                "relationship_class_id": None,
                                "entity_id": 1,
                                "object_id": 1,
                                "relationship_id": None,
                                "parameter_definition_id": 1,
                                "alternative_id": 2,
                                "value": "-5.0",
                                "type": None,
                                "list_value_id": None,
                                "commit_id": 2,
                            },
                            {
                                "id": 4,
                                "entity_class_id": 2,
                                "object_class_id": 2,
                                "relationship_class_id": None,
                                "entity_id": 2,
                                "object_id": 2,
                                "relationship_id": None,
                                "parameter_definition_id": 2,
                                "alternative_id": 2,
                                "value": "-23.0",
                                "type": None,
                                "list_value_id": None,
                                "commit_id": 2,
                            },
                        ]
                    },
                )

    def test_get_emtpy_relationship_classes(self):
        """'model' view responds correctly even when there are not relationship classes in the database."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {"type": "relationship classes?", "projectId": 1},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(content, {"classes": []})

    def test_get_single_relationship_class(self):
        """'model' view responds with a dict containing single relationship class in a list."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_object_classes(db_map, ("my_class_1", "my_class_2"))
            import_relationship_classes(
                db_map, (("my_relationship_class", ("my_class_1", "my_class_2")),)
            )
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {"type": "relationship classes?", "projectId": 1},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(
                    content,
                    {
                        "classes": [
                            {
                                "commit_id": 2,
                                "description": None,
                                "display_icon": None,
                                "id": 3,
                                "name": "my_relationship_class",
                                "dimension": 0,
                                "object_class_id": 1,
                                "object_class_name": "my_class_1",
                            },
                            {
                                "commit_id": 2,
                                "description": None,
                                "display_icon": None,
                                "id": 3,
                                "name": "my_relationship_class",
                                "dimension": 1,
                                "object_class_id": 2,
                                "object_class_name": "my_class_2",
                            },
                        ]
                    },
                )

    def test_get_relationships_of_given_class(self):
        """'model' view responds with a dict containing the relationships of the relationship class with given id."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_object_classes(db_map, ("class_1", "class_2"))
            import_objects(db_map, (("class_1", "object_11"), ("class_2", "object_21")))
            import_relationship_classes(
                db_map,
                (
                    ("relationship_class_1", ("class_1", "class_2")),
                    ("relationship_class_2", ("class_2", "class_1")),
                ),
            )
            import_relationships(
                db_map,
                (
                    (
                        ("relationship_class_1", ("object_11", "object_21")),
                        ("relationship_class_2", ("object_21", "object_22")),
                    )
                ),
            )
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "relationships?",
                        "projectId": 1,
                        "relationship_class_id": 3,
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                relationship_dicts = json.loads(response.content)
                self.assertEqual(
                    relationship_dicts,
                    {
                        "relationships": [
                            {
                                "id": 3,
                                "class_id": 3,
                                "name": "relationship_class_1_object_11__object_21",
                                "commit_id": 2,
                                "dimension": 0,
                                "class_name": "relationship_class_1",
                                "object_id": 1,
                                "object_name": "object_11",
                                "object_class_id": 1,
                                "object_class_name": "class_1",
                            },
                            {
                                "id": 3,
                                "class_id": 3,
                                "name": "relationship_class_1_object_11__object_21",
                                "commit_id": 2,
                                "dimension": 1,
                                "class_name": "relationship_class_1",
                                "object_id": 2,
                                "object_name": "object_21",
                                "object_class_id": 2,
                                "object_class_name": "class_2",
                            },
                        ]
                    },
                )

    def test_get_available_relationship_objects(self):
        """'model' view responds with a list containing available relationship's objects."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_object_classes(db_map, ("class_1", "class_2"))
            import_objects(
                db_map,
                (
                    ("class_1", "object_12"),
                    ("class_1", "object_11"),
                    ("class_2", "object_22"),
                    ("class_2", "object_21"),
                ),
            )
            import_relationship_classes(
                db_map,
                (("my_class", ("class_1", "class_2")),),
            )
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "available relationship objects?",
                        "projectId": 1,
                        "relationship_class_id": 3,
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                relationship_dicts = json.loads(response.content)
                self.assertEqual(
                    relationship_dicts,
                    {
                        "available_objects": [
                            ["object_11", "object_12"],
                            ["object_21", "object_22"],
                        ]
                    },
                )

    def test_get_all_parameter_value_lists(self):
        """'model' view responds with all parameter value lists and the lists are concatenated correctly."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_parameter_value_lists(
                db_map,
                (
                    ("list_1", "value_11"),
                    ("list_1", "value_12"),
                    ("list_2", "value_21"),
                    ("list_2", "value_22"),
                ),
            )
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {"type": "parameter value lists?", "projectId": 1},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                value_lists = json.loads(response.content)
                self.assertEqual(
                    value_lists,
                    {
                        "lists": [
                            {
                                "id": 1,
                                "value_list": ['"value_11"', '"value_12"'],
                                "type_list": [None, None],
                            },
                            {
                                "id": 2,
                                "value_list": ['"value_21"', '"value_22"'],
                                "type_list": [None, None],
                            },
                        ]
                    },
                )

    def test_get_parameter_value_lists_for_specific_ids(self):
        """'model' view responds with parameter value lists filtered by ids."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_parameter_value_lists(
                db_map,
                (
                    ("list_1", "value_1"),
                    ("list_2", "value_2"),
                    ("list_3", "value_3"),
                    ("list_4", "value_4"),
                ),
            )
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "parameter value lists?",
                        "projectId": 1,
                        "value_list_ids": [2, 4],
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                value_lists = json.loads(response.content)
                self.assertEqual(
                    value_lists,
                    {
                        "lists": [
                            {
                                "id": 2,
                                "value_list": ['"value_2"'],
                                "type_list": [None],
                            },
                            {
                                "id": 4,
                                "value_list": ['"value_4"'],
                                "type_list": [None],
                            },
                        ]
                    },
                )

    def test_get_commits(self):
        """'model' view responds with all commits."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_object_classes(db_map, ("class_1",))  # Must have some data to commit
            db_map.commit_session("My commit message.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {"type": "commits?", "projectId": 1},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                commit_dicts = json.loads(response.content)
                self.assertIn("commits", commit_dicts)
                for commit in commit_dicts["commits"]:
                    self.assertIn("date", commit)
                    del commit["date"]
                self.assertEqual(
                    commit_dicts,
                    {
                        "commits": [
                            {
                                "id": 1,
                                "comment": "Create the database",
                                "user": "spinedb_api",
                            },
                            {
                                "id": 2,
                                "comment": "My commit message.",
                                "user": "anon",
                            },
                        ]
                    },
                )

    def test_commit_parameter_value_deletion(self):
        """'model' view deletes given parameter value and responds with OK status."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_object_classes(db_map, ("my_class",))
            import_objects(db_map, (("my_class", "my_object"),))
            import_object_parameters(db_map, (("my_class", "parameter"),))
            import_object_parameter_values(
                db_map, (("my_class", "my_object", "parameter", 23.0),)
            )
            db_map.commit_session("Add test data.")
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": 1,
                        "deletions": {"parameter_value": [1]},
                        "message": "Delete parameter value.",
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(content, {})
            values = db_map.query(db_map.object_parameter_value_sq).all()
            self.assertEqual(len(values), 0)
            commits = db_map.query(db_map.commit_sq).all()
            self.assertEqual(commits[-1].comment, "Delete parameter value.")
            db_map.connection.close()

    def test_commit_object_parameter_value_insertion(self):
        """'model' view inserts an object parameter value and responds with OK status."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_object_classes(db_map, ("my_class",))
            import_object_parameters(db_map, (("my_class", "my_parameter"),))
            import_objects(db_map, (("my_class", "my_object"),))
            db_map.commit_session("Add test data.")
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": 1,
                        "class_id": 1,
                        "insertions": {
                            "parameter_value": [
                                {
                                    "entity_name": "my_object",
                                    "definition_id": 1,
                                    "alternative_id": 1,
                                    "value": -5.5,
                                },
                            ],
                        },
                        "message": "Insert new parameter value.",
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(content, {})
            parameter_values = db_map.query(db_map.object_parameter_value_sq).all()
            self.assertEqual(len(parameter_values), 1)
            self.assertEqual(from_database(parameter_values[0].value), -5.5)
            commits = db_map.query(db_map.commit_sq).all()
            self.assertEqual(commits[-1].comment, "Insert new parameter value.")
            db_map.connection.close()

    def test_commit_relationship_parameter_value_insertion(self):
        """'model' view inserts a relationship parameter value and responds with OK status."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_object_classes(db_map, ("my_object_class",))
            import_objects(db_map, (("my_object_class", "my_object"),))
            import_relationship_classes(db_map, (("my_class", ("my_object_class",)),))
            import_relationships(db_map, (("my_class", ("my_object",)),))
            import_relationship_parameters(db_map, (("my_class", "my_parameter"),))
            db_map.commit_session("Add test data.")
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": 1,
                        "class_id": 2,
                        "insertions": {
                            "parameter_value": [
                                {
                                    "entity_name": "my_class_my_object",
                                    "definition_id": 1,
                                    "alternative_id": 1,
                                    "value": -5.5,
                                }
                            ],
                        },
                        "message": "Insert new parameter value.",
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(content, {})
            parameter_values = db_map.query(
                db_map.relationship_parameter_value_sq
            ).all()
            self.assertEqual(len(parameter_values), 1)
            self.assertEqual(from_database(parameter_values[0].value), -5.5)
            commits = db_map.query(db_map.commit_sq).all()
            self.assertEqual(commits[-1].comment, "Insert new parameter value.")
            db_map.connection.close()

    def test_commit_parameter_value_insertion_converts_ints_to_floats(self):
        """inserting indexed parameter value converts ints to floats."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_object_classes(db_map, ("my_class",))
            import_object_parameters(
                db_map, (("my_class", "map_parameter"), ("my_class", "array_parameter"))
            )
            import_objects(db_map, (("my_class", "my_object"),))
            db_map.commit_session("Add test data.")
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": 1,
                        "class_id": 1,
                        "insertions": {
                            "parameter_value": [
                                {
                                    "entity_name": "my_object",
                                    "definition_id": 1,
                                    "alternative_id": 1,
                                    "value": {
                                        "type": "map",
                                        "index_type": "str",
                                        "data": [["a", 99]],
                                    },
                                },
                                {
                                    "entity_name": "my_object",
                                    "definition_id": 2,
                                    "alternative_id": 1,
                                    "value": {
                                        "type": "array",
                                        "value_type": "float",
                                        "data": [99],
                                    },
                                },
                            ],
                        },
                        "message": "Insert new parameter values.",
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(content, {})
            parameter_values = db_map.query(db_map.object_parameter_value_sq).all()
            self.assertEqual(len(parameter_values), 2)
            self.assertEqual(parameter_values[0].type, "map")
            self.assertEqual(
                from_database(parameter_values[0].value, parameter_values[0].type),
                Map(["a"], [99.0]),
            )
            self.assertEqual(parameter_values[1].type, "array")
            self.assertEqual(
                from_database(parameter_values[1].value, parameter_values[1].type),
                Array([99.0]),
            )
            commits = db_map.query(db_map.commit_sq).all()
            self.assertEqual(commits[-1].comment, "Insert new parameter values.")
            db_map.connection.close()

    def test_commit_parameter_value_update(self):
        """'model' view updates a parameter value and responds with OK status."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_object_classes(db_map, ("my_class",))
            import_object_parameters(db_map, (("my_class", "my_parameter"),))
            import_objects(db_map, (("my_class", "my_object"),))
            import_object_parameter_values(
                db_map, (("my_class", "my_object", "my_parameter", 2.3),)
            )
            db_map.commit_session("Add test data.")
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": 1,
                        "updates": {"parameter_value": [{"id": 1, "value": -5.5}]},
                        "message": "Update value.",
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(content, {})
            parameter_values = db_map.query(db_map.object_parameter_value_sq).all()
            self.assertEqual(len(parameter_values), 1)
            self.assertEqual(from_database(parameter_values[0].value), -5.5)
            commits = db_map.query(db_map.commit_sq).all()
            self.assertEqual(commits[-1].comment, "Update value.")
            db_map.connection.close()

    def test_commit_parameter_value_update_converts_int_to_floats(self):
        """int type values in indexes values get converted to floats upon update commit."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_object_classes(db_map, ("my_class",))
            import_object_parameters(
                db_map, (("my_class", "map_parameter"), ("my_class", "array_parameter"))
            )
            import_objects(db_map, (("my_class", "my_object"),))
            import_object_parameter_values(
                db_map,
                (
                    ("my_class", "my_object", "map_parameter", Map(["??"], [-99.0])),
                    ("my_class", "my_object", "array_parameter", Array([-99.0])),
                ),
            )
            db_map.commit_session("Add test data.")
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": 1,
                        "updates": {
                            "parameter_value": [
                                {
                                    "id": 1,
                                    "value": {
                                        "type": "map",
                                        "index_type": "str",
                                        "data": [["a", 99]],
                                    },
                                },
                                {
                                    "id": 2,
                                    "value": {
                                        "type": "array",
                                        "value_type": "float",
                                        "data": [99],
                                    },
                                },
                            ]
                        },
                        "message": "Update value.",
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(content, {})
            parameter_values = db_map.query(db_map.object_parameter_value_sq).all()
            self.assertEqual(len(parameter_values), 2)
            self.assertEqual(parameter_values[0].type, "map")
            self.assertEqual(
                from_database(parameter_values[0].value, parameter_values[0].type),
                Map(["a"], [99.0]),
            )
            self.assertEqual(parameter_values[1].type, "array")
            self.assertEqual(
                from_database(parameter_values[1].value, parameter_values[1].type),
                Array([99.0]),
            )
            commits = db_map.query(db_map.commit_sq).all()
            self.assertEqual(commits[-1].comment, "Update value.")
            db_map.connection.close()

    def test_commit_alternative_insertion(self):
        """'model' view inserts an alternative and responds with OK status."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": 1,
                        "insertions": {
                            "alternative": [{"name": "my_alternative"}],
                        },
                        "message": "Insert alternative.",
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(
                    content, {"inserted": {"alternative": {"my_alternative": 2}}}
                )
            alternatives = db_map.query(db_map.alternative_sq).all()
            self.assertEqual(len(alternatives), 2)
            self.assertEqual(alternatives[1].name, "my_alternative")
            commits = db_map.query(db_map.commit_sq).all()
            self.assertEqual(commits[-1].comment, "Insert alternative.")
            db_map.connection.close()

    def test_commit_scenario_insertion(self):
        """'model' view inserts a scenario and responds with OK status."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": 1,
                        "insertions": {
                            "scenario": [{"name": "my_scenario"}],
                        },
                        "message": "Insert scenario.",
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(
                    content, {"inserted": {"scenario": {"my_scenario": 1}}}
                )
            scenarios = db_map.query(db_map.scenario_sq).all()
            self.assertEqual(len(scenarios), 1)
            self.assertEqual(scenarios[0].name, "my_scenario")
            commits = db_map.query(db_map.commit_sq).all()
            self.assertEqual(commits[-1].comment, "Insert scenario.")
            db_map.connection.close()

    def test_commit_scenario_alternatives_insertion(self):
        """'model' view inserts a scenario and responds with OK status."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                import_alternatives(db_map, ("alternative_1", "alternative_2"))
                import_scenarios(db_map, ("my_scenario",))
                db_map.commit_session("Add test data.")
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": 1,
                        "insertions": {
                            "scenario_alternative": [
                                {
                                    "scenario_name": "my_scenario",
                                    "alternative_name": "alternative_1",
                                    "rank": 0,
                                },
                                {
                                    "scenario_name": "my_scenario",
                                    "alternative_name": "Base",
                                    "rank": 1,
                                },
                                {
                                    "scenario_name": "my_scenario",
                                    "alternative_name": "alternative_2",
                                    "rank": 2,
                                },
                            ],
                        },
                        "message": "Insert scenario alternatives.",
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(
                    content,
                    {
                        "inserted": {
                            "scenario_alternative": {
                                "my_scenario": {"0": 1, "1": 2, "2": 3}
                            }
                        }
                    },
                )
            scenario_alternatives = db_map.query(db_map.scenario_alternative_sq).all()
            self.assertEqual(len(scenario_alternatives), 3)
            self.assertEqual(
                scenario_alternatives[0]._asdict(),
                {
                    "id": 1,
                    "scenario_id": 1,
                    "alternative_id": 2,
                    "rank": 0,
                    "commit_id": 3,
                },
            )
            self.assertEqual(
                scenario_alternatives[1]._asdict(),
                {
                    "id": 2,
                    "scenario_id": 1,
                    "alternative_id": 1,
                    "rank": 1,
                    "commit_id": 3,
                },
            )
            self.assertEqual(
                scenario_alternatives[2]._asdict(),
                {
                    "id": 3,
                    "scenario_id": 1,
                    "alternative_id": 3,
                    "rank": 2,
                    "commit_id": 3,
                },
            )
            commits = db_map.query(db_map.commit_sq).all()
            self.assertEqual(commits[-1].comment, "Insert scenario alternatives.")
            db_map.connection.close()

    def test_commit_object_insertion(self):
        """'model' view inserts an object and responds with OK status."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_object_classes(db_map, ("my_class",))
            db_map.commit_session("Add test data.")
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": 1,
                        "class_id": 1,
                        "insertions": {
                            "object": [{"name": "my_object"}],
                        },
                        "message": "Insert object.",
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(content, {"inserted": {"object": {"my_object": 1}}})
            objects = db_map.query(db_map.object_sq).all()
            self.assertEqual(len(objects), 1)
            self.assertEqual(objects[0].name, "my_object")
            commits = db_map.query(db_map.commit_sq).all()
            self.assertEqual(commits[-1].comment, "Insert object.")
            db_map.connection.close()

    def test_commit_relationship_insertion(self):
        """'model' view inserts a relationship and responds with OK status."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_object_classes(db_map, ("my_object_class",))
            import_objects(db_map, (("my_object_class", "my_object"),))
            import_relationship_classes(db_map, (("my_class", ("my_object_class",)),))
            db_map.commit_session("Add test data.")
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": 1,
                        "class_id": 2,
                        "insertions": {
                            "relationship": [
                                {
                                    "name": "my_object_class_my_object",
                                    "object_name_list": ["my_object"],
                                }
                            ],
                        },
                        "message": "Insert relationship.",
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(
                    content,
                    {"inserted": {"relationship": {"my_object_class_my_object": 2}}},
                )
            relationships = db_map.query(db_map.wide_relationship_sq).all()
            self.assertEqual(len(relationships), 1)
            self.assertEqual(relationships[0].name, "my_object_class_my_object")
            commits = db_map.query(db_map.commit_sq).all()
            self.assertEqual(commits[-1].comment, "Insert relationship.")
            db_map.connection.close()

    def test_get_physical_classes(self):
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_object_classes(
                db_map, ("non_physical",) + tuple(views.PHYSICAL_OBJECT_CLASS_NAMES)
            )
            import_relationship_classes(
                db_map,
                (
                    ("commodity__node", ("commodity", "node")),
                    ("connection__node__node", ("connection", "node", "node")),
                    ("group_connection", ("group", "connection")),
                    ("group_connection__node", ("group", "connection", "node")),
                ),
            )
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "physical classes?",
                        "projectId": 1,
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
        self.assertEqual(len(content), 2)
        object_classes = content["objectClasses"]
        self.assertEqual(len(object_classes), len(views.PHYSICAL_OBJECT_CLASS_NAMES))
        for object_class_row in object_classes:
            self.assertIn(object_class_row["name"], views.PHYSICAL_OBJECT_CLASS_NAMES)
            self.assertEqual(
                object_class_row["entitiesUrl"],
                reverse(
                    "flextool3:entities",
                    kwargs=({"project_id": 1, "class_id": object_class_row["id"]}),
                ),
            )
        relationship_classes = content["relationshipClasses"]
        self.assertEqual(
            len(relationship_classes), len(views.PHYSICAL_OBJECT_CLASS_NAMES)
        )
        for object_class_id, relationship_class_list in relationship_classes.items():
            object_class = next(
                (oc for oc in object_classes if oc["id"] == int(object_class_id)), None
            )
            self.assertIsNotNone(object_class)
            for relationship_class in relationship_class_list:
                self.assertTrue(
                    relationship_class["object_class_name_list"].partition("__")[0],
                    object_class["name"],
                )
                self.assertEqual(
                    relationship_class["entitiesUrl"],
                    reverse(
                        "flextool3:entities",
                        kwargs=(
                            {"project_id": 1, "class_id": relationship_class["id"]}
                        ),
                    ),
                )

    def test_commit_alternative_deletion(self):
        """'model' view deletes given alternative and responds with OK status."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_alternatives(db_map, ("my_alternative",))
            db_map.commit_session("Add test data.")
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": 1,
                        "deletions": {"alternative": [2]},
                        "message": "Delete alternative.",
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(content, {})
            alternatives = db_map.query(db_map.alternative_sq).all()
            self.assertEqual(len(alternatives), 1)
            self.assertEqual(alternatives[0].name, "Base")
            commits = db_map.query(db_map.commit_sq).all()
            self.assertEqual(commits[-1].comment, "Delete alternative.")
            db_map.connection.close()

    def test_commit_scenario_deletion(self):
        """'model' view deletes given scenario and responds with OK status."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_scenarios(db_map, ("my_scenario",))
            db_map.commit_session("Add test data.")
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": 1,
                        "deletions": {"scenario": [1]},
                        "message": "Delete scenario.",
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(content, {})
            scenarios = db_map.query(db_map.scenario_sq).all()
            self.assertEqual(len(scenarios), 0)
            commits = db_map.query(db_map.commit_sq).all()
            self.assertEqual(commits[-1].comment, "Delete scenario.")
            db_map.connection.close()

    def test_commit_scenario_alternative_deletion(self):
        """'model' view deletes given scenario alternative and responds with OK status."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_scenarios(db_map, ("my_scenario",))
            import_scenario_alternatives(db_map, (("my_scenario", "Base"),))
            db_map.commit_session("Add test data.")
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": 1,
                        "deletions": {"scenario_alternative": [1]},
                        "message": "Delete scenario alternative.",
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(content, {})
            scenario_alternatives = db_map.query(db_map.scenario_alternative_sq).all()
            self.assertEqual(len(scenario_alternatives), 0)
            commits = db_map.query(db_map.commit_sq).all()
            self.assertEqual(commits[-1].comment, "Delete scenario alternative.")
            db_map.connection.close()

    def test_commit_object_deletion(self):
        """'model' view deletes given object and responds with OK status."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_object_classes(db_map, ("my_class",))
            import_objects(db_map, (("my_class", "my_object"),))
            db_map.commit_session("Add test data.")
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": 1,
                        "deletions": {"object": [1]},
                        "message": "Delete object.",
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(content, {})
            objects = db_map.query(db_map.object_sq).all()
            self.assertEqual(len(objects), 0)
            commits = db_map.query(db_map.commit_sq).all()
            self.assertEqual(commits[-1].comment, "Delete object.")
            db_map.connection.close()

    def test_commit_relationship_deletion(self):
        """'model' view deletes given relationship and responds with OK status."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_object_classes(db_map, ("my_object_class",))
            import_objects(db_map, (("my_object_class", "my_object"),))
            import_relationship_classes(db_map, (("my_class", ("my_object_class",)),))
            import_relationships(db_map, (("my_class", ("my_object",)),))
            db_map.commit_session("Add test data.")
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": 1,
                        "deletions": {"relationship": [2]},
                        "message": "Delete relationship.",
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(content, {})
            relationships = db_map.query(db_map.relationship_sq).all()
            self.assertEqual(len(relationships), 0)
            commits = db_map.query(db_map.commit_sq).all()
            self.assertEqual(commits[-1].comment, "Delete relationship.")
            db_map.connection.close()

    def test_commit_alternative_update(self):
        """'model' view updates alternative in model and responds with OK status."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_alternatives(db_map, ("my_alternative",))
            db_map.commit_session("Add test data.")
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": 1,
                        "updates": {"alternative": [{"id": 2, "name": "renamed"}]},
                        "message": "Rename alternative.",
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(content, {})
            alternatives = db_map.query(db_map.alternative_sq).all()
            self.assertEqual(len(alternatives), 2)
            self.assertEqual(alternatives[0].name, "Base")
            self.assertEqual(alternatives[1].name, "renamed")
            commits = db_map.query(db_map.commit_sq).all()
            self.assertEqual(commits[-1].comment, "Rename alternative.")
            db_map.connection.close()

    def test_commit_scenario_update(self):
        """'model' view updates scenario in model and responds with OK status."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_scenarios(db_map, ("my_scenario",))
            db_map.commit_session("Add test data.")
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": 1,
                        "updates": {"scenario": [{"id": 1, "name": "renamed"}]},
                        "message": "Rename scenario.",
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(content, {})
            scenarios = db_map.query(db_map.scenario_sq).all()
            self.assertEqual(len(scenarios), 1)
            self.assertEqual(scenarios[0].name, "renamed")
            commits = db_map.query(db_map.commit_sq).all()
            self.assertEqual(commits[-1].comment, "Rename scenario.")
            db_map.connection.close()

    def test_commit_scenario_alternative_update(self):
        """'model' view updates scenario alternative in model and responds with OK status."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_scenarios(db_map, ("my_scenario",))
            import_alternatives(db_map, ("alternative_1", "alternative_2"))
            import_scenario_alternatives(db_map, (("my_scenario", "alternative_2"),))
            db_map.commit_session("Add test data.")
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": 1,
                        "updates": {
                            "scenario_alternative": [
                                {"id": 1, "alternative_name": "alternative_1"}
                            ]
                        },
                        "message": "Change scenario alternative.",
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(content, {})
            scenario_alternatives = db_map.query(db_map.scenario_alternative_sq).all()
            self.assertEqual(len(scenario_alternatives), 1)
            self.assertEqual(
                scenario_alternatives[0]._asdict(),
                {
                    "id": 1,
                    "scenario_id": 1,
                    "alternative_id": 2,
                    "rank": 1,
                    "commit_id": 3,
                },
            )
            commits = db_map.query(db_map.commit_sq).all()
            self.assertEqual(commits[-1].comment, "Change scenario alternative.")
            db_map.connection.close()

    def test_commit_object_update(self):
        """'model' view updates object in model and responds with OK status."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_object_classes(db_map, ("my_class",))
            import_objects(db_map, (("my_class", "my_object"),))
            db_map.commit_session("Add test data.")
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": 1,
                        "updates": {"object": [{"id": 1, "name": "renamed"}]},
                        "message": "Rename object.",
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(content, {})
            objects = db_map.query(db_map.object_sq).all()
            self.assertEqual(len(objects), 1)
            self.assertEqual(objects[0].name, "renamed")
            self.assertEqual(objects[0].class_id, 1)
            commits = db_map.query(db_map.commit_sq).all()
            self.assertEqual(commits[-1].comment, "Rename object.")
            db_map.connection.close()

    def test_commit_relationship_update(self):
        """'model' view updates relationship in model and responds with OK status."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE),
                create=True,
            )
            import_object_classes(db_map, ("object_class_1", "object_class_2"))
            import_objects(
                db_map,
                (
                    ("object_class_1", "object_11"),
                    ("object_class_1", "object_12"),
                    ("object_class_2", "object_21"),
                    ("object_class_2", "object_22"),
                ),
            )
            import_relationship_classes(
                db_map, (("my_class", ("object_class_2", "object_class_1")),)
            )
            import_relationships(db_map, (("my_class", ("object_22", "object_12")),))
            db_map.commit_session("Add test data.")
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": 1,
                        "class_id": 3,
                        "updates": {
                            "relationship": [
                                {
                                    "id": 5,
                                    "name": "renamed",
                                    "object_name_list": ["object_21", "object_11"],
                                }
                            ]
                        },
                        "message": "Change relationship's objects.",
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(content, {})
            relationships = db_map.query(db_map.relationship_sq).all()
            self.assertEqual(len(relationships), 2)
            self.assertEqual(relationships[0].name, "renamed")
            self.assertEqual(relationships[0].object_id, 3)
            self.assertEqual(relationships[0].id, 5)
            self.assertEqual(relationships[1].name, "renamed")
            self.assertEqual(relationships[1].object_id, 1)
            self.assertEqual(relationships[1].id, 5)
            commits = db_map.query(db_map.commit_sq).all()
            self.assertEqual(commits[-1].comment, "Change relationship's objects.")
            db_map.connection.close()


class ExecutorTests(unittest.TestCase):
    def setUp(self):
        self._id = 0

    def tearDown(self):
        executor.remove(self._id)

    def test_start_and_read_logs(self):
        executor.start(self._id, sys.executable, ["-c", "print('my output')"])
        while executor.execution_status(self._id) == task_loop.Status.RUNNING:
            pass
        self.assertEqual(executor.execution_return_code(self._id), 0)
        output = executor.read_lines(self._id)
        self.assertEqual(len(output), 1)
        self.assertEqual(output[0], "my output\n")

    def test_get_return_code(self):
        executor.start(self._id, sys.executable, ["-c", "exit(23)"])
        while executor.execution_status(self._id) == task_loop.Status.RUNNING:
            pass
        self.assertEqual(executor.execution_return_code(self._id), 23)

    def test_abort_process(self):
        executor.start(
            self._id, sys.executable, ["-c", "import time; time.sleep(1000); exit(0)"]
        )
        executor.abort(self._id)
        self.assertNotEqual(executor.execution_return_code(self._id), 0)
        self.assertEqual(executor.execution_status(self._id), task_loop.Status.ABORTED)

    def test_process_count(self):
        self.assertEqual(executor.execution_count(), 0)
        executor.start(self._id, sys.executable, ["--version"])
        self.assertEqual(executor.execution_count(), 1)


class ExecutionsViewTests(unittest.TestCase):
    def test_arguments(self):
        project_path = Path("path", "to", "project")
        arguments = executions_view.arguments(project_path)
        expected = [
            "-mspinetoolbox",
            "--execute-only",
            str(project_path),
            "--select",
            "Input_data",
            "Export_to_CSV",
            "FlexTool3",
            "Import_results",
            "Results",
        ]
        self.assertEqual(arguments, expected)


class ExecutionsInterfaceTests(TestCase):
    baron = None
    executions_url = reverse("flextool3:executions")

    @classmethod
    def setUpTestData(cls):
        cls.baron = User(username="baron", password="")
        cls.baron.set_password("secretbaron")
        cls.baron.save()

    def test_current_execution_creates_yet_to_run_execution_when_needed(self):
        with fake_project(self.baron) as project:
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.executions_url,
                    {"type": "current execution?", "projectId": 1},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(content, {"status": "YS", "scenarios": []})


class SummaryInterfaceTests(TestCase):
    baron = None
    summary_url = reverse("flextool3:summary")

    _SUMMARY = """"Diagnostic results from all solves. Output at (UTC): 2022-05-04T11:00:25Z"

"Solve",y2020
"Total cost obj. function (M CUR)",59546.4047356,"Minimized total system cost as given by the solver (includes all penalty costs)"
"Total cost calculated full horizon (M CUR)",59546.4047356,"Annualized operational, penalty and investment costs"
"Total cost calculated realized periods (M CUR)",29773.5447224
"Time in use in years",0.00547945205479,"The amount of time the solve includes - calculated in years"

Emissions
"CO2 (Mt)",0.59568,"System-wide annualized CO2 emissions for all periods"
"CO2 (Mt)",0.29784,"System-wide annualized CO2 emissions for realized periods"

"Possible issues (creating or removing energy/matter, creating inertia, changing non-synchronous generation to synchronous)"
Created, NodeA, p2020, 6259.3
Created, NodeA, p2025, 6259.3
Created, NodeB, p2020, 79.569
Created, NodeB, p2025, 79.569
NonSync, JustA, p2020, 3298.2
NonSync, JustA, p2025, 3298.2
"""

    @classmethod
    def summary_rows(cls):
        with StringIO(cls._SUMMARY) as summary:
            reader = csv.reader(summary)
            return [[number_to_float(x) for x in row] for row in reader]

    @classmethod
    def setUpTestData(cls):
        cls.baron = User(username="baron", password="")
        cls.baron.set_password("secretbaron")
        cls.baron.save()

    def test_get_scenario_list(self):
        with fake_project(self.baron) as project:
            scenario1 = Scenario(project=project, name="scenario_1")
            scenario1.save()
            scenario2 = Scenario(project=project, name="scenario_2")
            scenario2.save()
            scenario_execution1 = ScenarioExecution(
                scenario=scenario1,
                execution_time=datetime.fromisoformat("2022-05-05T12:00:00+03:00"),
                execution_time_offset=3 * 3600,
                log="",
            )
            scenario_execution1.save()
            scenario_execution2 = ScenarioExecution(
                scenario=scenario2,
                execution_time=datetime.fromisoformat("2022-05-25T16:00:00+03:00"),
                execution_time_offset=3 * 3600,
                log="",
            )
            scenario_execution2.save()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.summary_url,
                    {
                        "type": "scenario list?",
                        "projectId": 1,
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(
                    content,
                    {
                        "scenarios": {
                            "scenario_1": [
                                {
                                    "scenario_execution_id": 1,
                                    "time_stamp": "2022-05-05T09:00:00+00:00",
                                }
                            ],
                            "scenario_2": [
                                {
                                    "scenario_execution_id": 2,
                                    "time_stamp": "2022-05-25T13:00:00+00:00",
                                }
                            ],
                        }
                    },
                )

    def test_get_summary(self):
        with fake_project(self.baron) as project:
            scenario = Scenario(project=project, name="my_scenario")
            scenario.save()
            scenario_execution = ScenarioExecution(
                scenario=scenario,
                execution_time=datetime.fromisoformat("2022-05-05T12:59:50+03:00"),
                execution_time_offset=3 * 3600,
                log="",
            )
            scenario_execution.save()
            filter_id_path = (
                Path(project.path)
                / ".spinetoolbox"
                / "items"
                / "flextool3"
                / "output"
                / "dc03f1ea3aebbee9146b9cf380472f6045c0927d"
                / ".filter_id"
            )
            filter_id_path.parent.mkdir(parents=True)
            with open(filter_id_path, "w", encoding="utf-8") as filter_id_file:
                filter_id_file.writelines(["my_scenario, FlexTool3 - Input_data"])
            summary_path = (
                Path(project.path)
                / ".spinetoolbox"
                / "items"
                / "flextool3"
                / "output"
                / "dc03f1ea3aebbee9146b9cf380472f6045c0927d"
                / "2022-05-05T13.00.00"
                / "output"
                / SUMMARY_FILE_NAME
            )
            summary_path.parent.mkdir(parents=True)
            with open(summary_path, "w", encoding="utf-8") as summary_file:
                summary_file.write(self._SUMMARY)
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.summary_url,
                    {
                        "type": "summary?",
                        "projectId": 1,
                        "scenarioExecutionId": 1,
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                expected = {"summary": self.summary_rows()}
                self.assertEqual(content, expected)

    def test_get_summary_when_filter_id_names_are_inverted(self):
        with fake_project(self.baron) as project:
            scenario = Scenario(project=project, name="my_scenario")
            scenario.save()
            scenario_execution = ScenarioExecution(
                scenario=scenario,
                execution_time=datetime.fromisoformat("2022-05-05T12:59:50+03:00"),
                execution_time_offset=3 * 3600,
                log="",
            )
            scenario_execution.save()
            filter_id_path = (
                Path(project.path)
                / ".spinetoolbox"
                / "items"
                / "flextool3"
                / "output"
                / "dc03f1ea3aebbee9146b9cf380472f6045c0927d"
                / ".filter_id"
            )
            filter_id_path.parent.mkdir(parents=True)
            with open(filter_id_path, "w", encoding="utf-8") as filter_id_file:
                filter_id_file.writelines(["FlexTool3, my_scenario - Input_data"])
            summary_path = (
                Path(project.path)
                / ".spinetoolbox"
                / "items"
                / "flextool3"
                / "output"
                / "dc03f1ea3aebbee9146b9cf380472f6045c0927d"
                / "2022-05-05T13.00.00"
                / "output"
                / SUMMARY_FILE_NAME
            )
            summary_path.parent.mkdir(parents=True)
            with open(summary_path, "w", encoding="utf-8") as summary_file:
                summary_file.write(self._SUMMARY)
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.summary_url,
                    {
                        "type": "summary?",
                        "projectId": 1,
                        "scenarioExecutionId": 1,
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                expected = {"summary": self.summary_rows()}
                self.assertEqual(content, expected)

    def test_get_result_alternative(self):
        with fake_project(self.baron) as project:
            scenario = Scenario(project=project, name="Base")
            scenario.save()
            scenario_execution = ScenarioExecution(
                scenario=scenario,
                execution_time=datetime.fromisoformat("2022-06-01T14:14:00+03:00"),
                execution_time_offset=3 * 3600,
                log="",
            )
            scenario_execution.save()
            scenario_execution = ScenarioExecution(
                scenario=scenario,
                execution_time=datetime.fromisoformat("2022-06-01T15:34:00+03:00"),
                execution_time_offset=3 * 3600,
                log="",
            )
            scenario_execution.save()
            scenario = Scenario(project=project, name="high_price")
            scenario.save()
            scenario_execution = ScenarioExecution(
                scenario=scenario,
                execution_time=datetime.fromisoformat("2022-06-01T14:34:00+03:00"),
                execution_time_offset=3 * 3600,
                log="",
            )
            scenario_execution.save()
            scenario_execution = ScenarioExecution(
                scenario=scenario,
                execution_time=datetime.fromisoformat("2022-06-01T16:34:00+03:00"),
                execution_time_offset=3 * 3600,
                log="",
            )
            scenario_execution.save()
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_RESULT_DATABASE),
                create=True,
            )
            import_alternatives(
                db_map,
                (
                    "Base__Import_Flex3@2022-06-01T14:15:00",
                    "high_price__Import_Flex3@2022-06-01T14:35:00",
                    "Base__Import_Flex3@2022-06-01T15:35:00",
                    "high_price__Import_Flex3@2022-06-01T16:35:00",
                ),
            )
            db_map.commit_session("Add test data.")
            alternative_id = (
                db_map.query(db_map.alternative_sq)
                .filter(
                    db_map.alternative_sq.c.name
                    == "Base__Import_Flex3@2022-06-01T15:35:00"
                )
                .one()
                .id
            )
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.summary_url,
                    {
                        "type": "result alternative?",
                        "projectId": 1,
                        "scenarioExecutionId": 2,
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(content, {"alternative_id": alternative_id})


class AnalysisInterfaceTests(TestCase):
    baron = None
    model_url = reverse("flextool3:analysis")

    @classmethod
    def setUpTestData(cls):
        cls.baron = User(username="baron", password="")
        cls.baron.set_password("secretbaron")
        cls.baron.save()

    def test_get_relationship_classes(self):
        """'analysis' view responds with relationship class information."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_RESULT_DATABASE),
                create=True,
            )
            import_object_classes(db_map, ("object_class",))
            import_relationship_classes(
                db_map, (("relationship_class", ("object_class",)),)
            )
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {"type": "relationship classes?", "projectId": 1},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(
                    content,
                    {
                        "classes": [
                            {
                                "commit_id": 2,
                                "description": None,
                                "dimension": 0,
                                "display_icon": None,
                                "id": 2,
                                "name": "relationship_class",
                                "object_class_id": 1,
                                "object_class_name": "object_class",
                            },
                        ]
                    },
                )


class ExamplesInterfaceTests(TestCase):
    baron = None
    examples_url = reverse("flextool3:examples")

    @classmethod
    def setUpTestData(cls):
        cls.baron = User(username="baron", password="")
        cls.baron.set_password("secretbaron")
        cls.baron.save()

    def test_get_example_list(self):
        """'examples' view responds with a list of available examples."""
        with fake_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///"
                + str(Path(project.path) / PATH_TO_INITIALIZATION_DATABASE),
                create=True,
            )
            import_alternatives(db_map, ("example_1", "example_2"))
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.examples_url,
                    {"type": "example list?", "projectId": 1},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(
                    content, {"examples": ["Base", "example_1", "example_2"]}
                )

    def test_add(self):
        """'examples' view adds requested example to the model database."""
        with fake_project(self.baron) as project:
            _copy_initialization_database(Path(project.path))
            _copy_model_database(Path(project.path))
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.examples_url,
                    {"type": "add to model", "projectId": 1, "name": "coal"},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(content, {"status": "ok"})
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            commit_row = (
                db_map.query(db_map.commit_sq)
                .order_by(db_map.commit_sq.c.date.desc())
                .first()
            )
            self.assertEqual(commit_row.comment, "Initialized 'coal'.")
            alternative_row = (
                db_map.query(db_map.alternative_sq)
                .filter(db_map.alternative_sq.c.name == "coal")
                .first()
            )
            self.assertIsNotNone(alternative_row)
            objects = (
                db_map.query(db_map.ext_object_sq)
                .filter(db_map.ext_object_sq.c.class_name == "unit")
                .all()
            )
            self.assertEqual(len(objects), 1)
            self.assertEqual(objects[0].name, "coal_plant")
            db_map.connection.close()


def _copy_model_database(project_path):
    """Copies model database from master project to test project.

    Args:
        project_path (Path): path to test project
    """
    source_path = Path(__file__).parent / "master_project" / PATH_TO_MODEL_DATABASE
    target_path = project_path / PATH_TO_MODEL_DATABASE
    copyfile(source_path, target_path)


def _copy_initialization_database(project_path):
    """Copies initialization database from master project to test project.

    Args:
        project_path (Path): path to test project
    """
    source_path = (
        Path(__file__).parent / "master_project" / PATH_TO_INITIALIZATION_DATABASE
    )
    target_path = project_path / PATH_TO_INITIALIZATION_DATABASE
    copyfile(source_path, target_path)
