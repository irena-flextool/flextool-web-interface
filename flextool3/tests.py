import csv
from datetime import datetime
from io import StringIO
import json
from contextlib import contextmanager
from operator import itemgetter
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
    import_relationship_classes,
    import_relationships,
    import_relationship_parameters,
    Map,
    Array,
    import_scenarios,
    import_scenario_alternatives,
    import_relationship_parameter_values,
)

from .exception import FlexToolException
from . import executor, task_loop, views
from .models import Project, Scenario, ScenarioExecution, SUMMARY_FILE_NAME
from .summary_view import number_to_float
from .utils import FLEXTOOL_PROJECT_TEMPLATE
from . import executions_view


PATH_TO_MODEL_DATABASE = Path("Input_data.sqlite")
PATH_TO_RESULT_DATABASE = Path("Results.sqlite")
PATH_TO_INITIALIZATION_DATABASE = Path("Init.sqlite")


@contextmanager
def new_project(user):
    with TemporaryDirectory() as temp_dir:
        projects_root = Path(temp_dir, "projects")
        project = Project.create(
            user, "my_test_project", projects_root, FLEXTOOL_PROJECT_TEMPLATE
        )
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
            projects_root = Path(temp_dir, "projects")
            user = User(username="baron", password="it's a secret")
            project = Project.create(
                user, "my_test_project", projects_root, FLEXTOOL_PROJECT_TEMPLATE
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
        with new_project(user) as project:
            projects_root_dir = Path(project.path).parent.parent
            self.assertRaises(
                FlexToolException,
                Project.create,
                user,
                "my_test_project",
                projects_root_dir,
                FLEXTOOL_PROJECT_TEMPLATE,
            )

    def test_remove_project_dir(self):
        """remove_project_dir() removes project directory."""
        user = User(username="baron", password="it's a secret")
        user.save()
        with new_project(user) as project:
            project.remove_project_dir()
            self.assertFalse(Path(project.path).exists())

    def test_model_database_path_is_correct(self):
        spine_project_file_path = (
            FLEXTOOL_PROJECT_TEMPLATE / ".spinetoolbox" / "project.json"
        )
        with open(spine_project_file_path, encoding="utf-8") as project_file:
            spine_project = json.load(project_file)
        database_relative_path = spine_project["items"]["Input_data"]["url"][
            "database"
        ]["path"]
        user = User(username="baron", password="it's a secret")
        user.save()
        with new_project(user) as project:
            expected_path = Path(project.path) / database_relative_path
            self.assertEqual(project.model_database_path(), expected_path)

    def test_result_database_path_is_correct(self):
        spine_project_file_path = (
            FLEXTOOL_PROJECT_TEMPLATE / ".spinetoolbox" / "project.json"
        )
        with open(spine_project_file_path, encoding="utf-8") as project_file:
            spine_project = json.load(project_file)
        database_relative_path = spine_project["items"]["Results"]["url"]["database"][
            "path"
        ]
        user = User(username="baron", password="it's a secret")
        user.save()
        with new_project(user) as project:
            expected_path = Path(project.path) / database_relative_path
            self.assertEqual(project.results_database_path(), expected_path)

    def test_initialization_database_path_is_correct(self):
        spine_project_file_path = (
            FLEXTOOL_PROJECT_TEMPLATE / ".spinetoolbox" / "project.json"
        )
        with open(spine_project_file_path, encoding="utf-8") as project_file:
            spine_project = json.load(project_file)
        database_relative_path = spine_project["items"]["Init"]["url"]["database"][
            "path"
        ]
        user = User(username="baron", password="it's a secret")
        user.save()
        with new_project(user) as project:
            expected_path = Path(project.path) / database_relative_path
            self.assertEqual(project.initialization_database_path(), expected_path)


class ScenarioExecutionModelTests(TestCase):
    baron = None

    @classmethod
    def setUpTestData(cls):
        cls.baron = User(username="baron", password="")
        cls.baron.set_password("secretbaron")
        cls.baron.save()

    def test_summary_path(self):
        with new_project(self.baron) as project:
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
        with new_project(self.baron) as project:
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
                "sqlite:///" + str(Path(project.path) / PATH_TO_RESULT_DATABASE)
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
                alternative_names, {"my_scenario__Import_results@2023-05-23T14:05:30"}
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
        with new_project(self.baron):
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
        with new_project(self.baron) as project:
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
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            import_alternatives(db_map, (("my_alternative", "My lovely alternative"),))
            db_map.commit_session("Add test data.")
            alternative_id = db_map.query(db_map.alternative_sq).one().id
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {"type": "alternatives?", "projectId": project.id},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                commit_id = content["alternatives"][0]["commit_id"]
                self.assertEqual(
                    content,
                    {
                        "alternatives": [
                            {
                                "name": "my_alternative",
                                "id": alternative_id,
                                "description": "My lovely alternative",
                                "commit_id": commit_id,
                            }
                        ]
                    },
                )

    def test_get_scenarios(self):
        """'model' view responds correctly when requesting scenarios."""
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            import_alternatives(db_map, ("my_alternative",))
            import_scenarios(db_map, ("my_scenario",))
            import_scenario_alternatives(db_map, (("my_scenario", "my_alternative"),))
            import_scenario_alternatives(db_map, (("my_scenario", "Base"),))
            db_map.commit_session("Add test data.")
            scenario_id = db_map.query(db_map.scenario_sq).one().id
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {"type": "scenarios?", "projectId": project.id},
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
                                "scenario_id": scenario_id,
                                "scenario_alternatives": ["my_alternative", "Base"],
                            }
                        ]
                    },
                )

    def test_get_scenarios_without_alternatives(self):
        """'model' view responds with empty alternative list when scenarios doesn't have any."""
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            import_scenarios(db_map, ("my_scenario",))
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {"type": "scenarios?", "projectId": project.id},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                scenario_id = content["scenarios"][0]["scenario_id"]
                self.assertEqual(
                    content,
                    {
                        "scenarios": [
                            {
                                "scenario_name": "my_scenario",
                                "scenario_id": scenario_id,
                                "scenario_alternatives": [],
                            }
                        ]
                    },
                )

    def test_get_object_classes(self):
        """'model' view responds with a dict containing model's object classes in a list."""
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            classes = {row.name: row for row in db_map.query(db_map.object_class_sq)}
            self.assertGreater(len(classes), 0)
            db_map.connection.close()
            ids = {row.id for row in classes.values()}
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {"type": "object classes?", "projectId": project.id},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                for object_class in content["classes"]:
                    expected = classes[object_class["name"]]
                    self.assertEqual(object_class["name"], expected.name)
                    self.assertEqual(object_class["id"], expected.id)
                    self.assertEqual(object_class["commit_id"], expected.commit_id)
                    self.assertEqual(object_class["description"], expected.description)
                    self.assertEqual(
                        object_class["display_icon"], expected.display_icon
                    )
                    self.assertEqual(
                        object_class["display_order"], expected.display_order
                    )
                    self.assertEqual(object_class["hidden"], expected.hidden)
                    ids.remove(object_class["id"])
                self.assertEqual(ids, set())

    def test_get_all_objects(self):
        """'model' view responds with a dict containing all objects in the database."""
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            import_objects(db_map, (("node", "node_1"), ("commodity", "commodity_1")))
            db_map.commit_session("Add test data.")
            objects = {row.name: row for row in db_map.query(db_map.entity_sq)}
            ids = {r.id for r in objects.values()}
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {"type": "objects?", "projectId": project.id},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(len(content["objects"]), 2)
                commit_id = content["objects"][0]["commit_id"]
                for object_item in content["objects"]:
                    expected = objects[object_item["name"]]
                    self.assertEqual(
                        object_item,
                        {
                            "id": expected.id,
                            "class_id": expected.class_id,
                            "name": expected.name,
                            "description": expected.description,
                            "commit_id": commit_id,
                        },
                    )
                    ids.remove(object_item["id"])
                self.assertEqual(ids, set())

    def test_get_objects_of_given_class(self):
        """'model' view responds with a dict containing the objects of the object class with given id."""
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            _, errors = import_objects(
                db_map, (("node", "object_11"), ("connection", "object_21"))
            )
            self.assertEqual(errors, [])
            db_map.commit_session("Add test data.")
            class_id = (
                db_map.query(db_map.entity_class_sq)
                .filter(db_map.entity_class_sq.c.name == "connection")
                .one()
                .id
            )
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "objects?",
                        "projectId": project.id,
                        "object_class_id": class_id,
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                object_dicts = json.loads(response.content)
                commit_id = object_dicts["objects"][0]["commit_id"]
                object_id = object_dicts["objects"][0]["id"]
                self.assertEqual(
                    object_dicts,
                    {
                        "objects": [
                            {
                                "id": object_id,
                                "class_id": class_id,
                                "name": "object_21",
                                "description": None,
                                "commit_id": commit_id,
                            }
                        ]
                    },
                )

    def test_get_objects_of_non_existing_class_returns_empty_results(self):
        """'model' view responds with empty objects list when queried for objects of a non-existing class."""
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
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

    def test_get_parameter_definitions_for_given_class_id(self):
        """'model' view responds with correct parameter definitions when filtering by object class id."""
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            class_id = (
                db_map.query(db_map.entity_class_sq)
                .filter(db_map.entity_class_sq.c.name == "commodity")
                .one()
                .id
            )
            definitions = {
                row.name: row
                for row in db_map.query(db_map.parameter_definition_sq).filter(
                    db_map.parameter_definition_sq.c.entity_class_id == class_id
                )
            }
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "parameter definitions?",
                        "projectId": project.id,
                        "class_id": class_id,
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
                                "id": definitions["co2_content"].id,
                                "entity_class_id": class_id,
                                "object_class_id": class_id,
                                "relationship_class_id": None,
                                "name": "co2_content",
                                "parameter_value_list_id": None,
                                "list_value_id": None,
                                "default_value": None,
                                "default_type": None,
                                "description": definitions["co2_content"].description,
                                "commit_id": definitions["co2_content"].commit_id,
                            },
                            {
                                "id": definitions["price"].id,
                                "entity_class_id": class_id,
                                "object_class_id": class_id,
                                "relationship_class_id": None,
                                "name": "price",
                                "parameter_value_list_id": None,
                                "list_value_id": None,
                                "default_value": None,
                                "default_type": None,
                                "description": definitions["price"].description,
                                "commit_id": definitions["co2_content"].commit_id,
                            },
                        ]
                    },
                )

    def test_get_all_parameter_values(self):
        """without filtering, 'model' view responds with all parameter values."""
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            import_alternatives(db_map, ("Base", "alternative"))
            import_objects(db_map, (("node", "node_1"), ("commodity", "commodity_1")))
            import_object_parameter_values(
                db_map,
                (
                    ("node", "node_1", "inflow", 5.0, "Base"),
                    ("node", "node_1", "inflow", -5.0, "alternative"),
                    ("commodity", "commodity_1", "price", 23.0, "Base"),
                    ("commodity", "commodity_1", "price", -23.0, "alternative"),
                ),
            )
            db_map.commit_session("Add test data.")
            node_class_id = (
                db_map.query(db_map.entity_class_sq)
                .filter(db_map.entity_class_sq.c.name == "node")
                .one()
                .id
            )
            commodity_class_id = (
                db_map.query(db_map.entity_class_sq)
                .filter(db_map.entity_class_sq.c.name == "commodity")
                .one()
                .id
            )
            inflow_id = (
                db_map.query(db_map.parameter_definition_sq)
                .filter(db_map.parameter_definition_sq.c.name == "inflow")
                .one()
                .id
            )
            price_id = (
                db_map.query(db_map.parameter_definition_sq)
                .filter(db_map.parameter_definition_sq.c.name == "price")
                .one()
                .id
            )
            base_id = (
                db_map.query(db_map.alternative_sq)
                .filter(db_map.alternative_sq.c.name == "Base")
                .one()
                .id
            )
            alternative_id = (
                db_map.query(db_map.alternative_sq)
                .filter(db_map.alternative_sq.c.name == "alternative")
                .one()
                .id
            )
            node_1_id = (
                db_map.query(db_map.entity_sq)
                .filter(db_map.entity_sq.c.name == "node_1")
                .one()
                .id
            )
            commodity_1_id = (
                db_map.query(db_map.entity_sq)
                .filter(db_map.entity_sq.c.name == "commodity_1")
                .one()
                .id
            )
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {"type": "parameter values?", "projectId": project.id},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                value_dicts = json.loads(response.content)
                commit_id = value_dicts["values"][0]["commit_id"]
                value_1_id = value_dicts["values"][0]["id"]
                value_2_id = value_dicts["values"][1]["id"]
                value_3_id = value_dicts["values"][2]["id"]
                value_4_id = value_dicts["values"][3]["id"]
                self.assertEqual(
                    value_dicts,
                    {
                        "values": [
                            {
                                "id": value_1_id,
                                "entity_class_id": node_class_id,
                                "object_class_id": node_class_id,
                                "relationship_class_id": None,
                                "entity_id": node_1_id,
                                "object_id": node_1_id,
                                "relationship_id": None,
                                "parameter_definition_id": inflow_id,
                                "alternative_id": base_id,
                                "value": "5.0",
                                "type": None,
                                "list_value_id": None,
                                "commit_id": commit_id,
                            },
                            {
                                "id": value_2_id,
                                "entity_class_id": node_class_id,
                                "object_class_id": node_class_id,
                                "relationship_class_id": None,
                                "entity_id": node_1_id,
                                "object_id": node_1_id,
                                "relationship_id": None,
                                "parameter_definition_id": inflow_id,
                                "alternative_id": alternative_id,
                                "value": "-5.0",
                                "type": None,
                                "list_value_id": None,
                                "commit_id": commit_id,
                            },
                            {
                                "id": value_3_id,
                                "entity_class_id": commodity_class_id,
                                "object_class_id": commodity_class_id,
                                "relationship_class_id": None,
                                "entity_id": commodity_1_id,
                                "object_id": commodity_1_id,
                                "relationship_id": None,
                                "parameter_definition_id": price_id,
                                "alternative_id": base_id,
                                "value": "23.0",
                                "type": None,
                                "list_value_id": None,
                                "commit_id": commit_id,
                            },
                            {
                                "id": value_4_id,
                                "entity_class_id": commodity_class_id,
                                "object_class_id": commodity_class_id,
                                "relationship_class_id": None,
                                "entity_id": commodity_1_id,
                                "object_id": commodity_1_id,
                                "relationship_id": None,
                                "parameter_definition_id": price_id,
                                "alternative_id": alternative_id,
                                "value": "-23.0",
                                "type": None,
                                "list_value_id": None,
                                "commit_id": commit_id,
                            },
                        ]
                    },
                )

    def test_get_parameter_values_for_given_class(self):
        """'model' view responds with parameter values filtered by object class id."""
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            import_alternatives(db_map, ("alternative_1", "alternative_2"))
            import_objects(db_map, (("commodity", "commodity_1"), ("node", "node_1")))
            import_object_parameter_values(
                db_map,
                (
                    ("commodity", "commodity_1", "price", 5.0, "alternative_1"),
                    ("commodity", "commodity_2", "price", -5.0, "alternative_2"),
                    ("node", "node_1", "inflow", 23.0, "alternative_1"),
                    ("node", "node_1", "inflow", -23.0, "alternative_2"),
                ),
            )
            db_map.commit_session("Add test data.")
            class_id = (
                db_map.query(db_map.entity_class_sq)
                .filter(db_map.entity_class_sq.c.name == "node")
                .one()
                .id
            )
            values = {
                row.id: row
                for row in db_map.query(db_map.parameter_value_sq).filter(
                    db_map.parameter_value_sq.c.entity_class_id == class_id
                )
            }
            ids = set(values)
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "parameter values?",
                        "projectId": project.id,
                        "class_id": class_id,
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                value_dicts = json.loads(response.content)
                self.assertEqual(len(value_dicts["values"]), 2)
                for value in value_dicts["values"]:
                    expected = values[value["id"]]
                    self.assertEqual(
                        value,
                        {
                            "id": expected.id,
                            "entity_class_id": class_id,
                            "object_class_id": class_id,
                            "relationship_class_id": None,
                            "entity_id": expected.entity_id,
                            "object_id": expected.entity_id,
                            "relationship_id": None,
                            "parameter_definition_id": expected.parameter_definition_id,
                            "alternative_id": expected.alternative_id,
                            "value": str(expected.value, encoding="utf-8"),
                            "type": None,
                            "list_value_id": None,
                            "commit_id": expected.commit_id,
                        },
                    )
                    ids.remove(value["id"])
                self.assertEqual(ids, set())

    def test_get_parameter_values_for_given_object(self):
        """'model' view responds with parameter values filtered by object id."""
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            a = import_alternatives(db_map, ("Base", "alternative"))
            a = import_objects(db_map, (("node", "node_1"), ("node", "node_2")))
            a = import_object_parameter_values(
                db_map,
                (
                    ("node", "node_1", "inflow", 5.0, "Base"),
                    ("node", "node_1", "inflow", -5.0, "alternative"),
                    ("node", "node_2", "inflow", 23.0, "Base"),
                    ("node", "node_2", "inflow", -23.0, "alternative"),
                ),
            )
            db_map.commit_session("Add test data.")
            class_id = (
                db_map.query(db_map.entity_class_sq)
                .filter(db_map.entity_class_sq.c.name == "node")
                .one()
                .id
            )
            entity_id = (
                db_map.query(db_map.entity_sq)
                .filter(db_map.entity_sq.c.name == "node_2")
                .one()
                .id
            )
            definition_id = (
                db_map.query(db_map.parameter_definition_sq)
                .filter(db_map.parameter_definition_sq.c.name == "inflow")
                .one()
                .id
            )
            base_id = (
                db_map.query(db_map.alternative_sq)
                .filter(db_map.alternative_sq.c.name == "Base")
                .one()
                .id
            )
            alternative_id = (
                db_map.query(db_map.alternative_sq)
                .filter(db_map.alternative_sq.c.name == "alternative")
                .one()
                .id
            )
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "parameter values?",
                        "projectId": project.id,
                        "entity_id": entity_id,
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                value_dicts = json.loads(response.content)
                commit_id = value_dicts["values"][0]["commit_id"]
                value_1_id = value_dicts["values"][0]["id"]
                value_2_id = value_dicts["values"][1]["id"]
                self.assertEqual(
                    value_dicts,
                    {
                        "values": [
                            {
                                "id": value_1_id,
                                "entity_class_id": class_id,
                                "object_class_id": class_id,
                                "relationship_class_id": None,
                                "entity_id": entity_id,
                                "object_id": entity_id,
                                "relationship_id": None,
                                "parameter_definition_id": definition_id,
                                "alternative_id": base_id,
                                "value": "23.0",
                                "type": None,
                                "list_value_id": None,
                                "commit_id": commit_id,
                            },
                            {
                                "id": value_2_id,
                                "entity_class_id": class_id,
                                "object_class_id": class_id,
                                "relationship_class_id": None,
                                "entity_id": entity_id,
                                "object_id": entity_id,
                                "relationship_id": None,
                                "parameter_definition_id": definition_id,
                                "alternative_id": alternative_id,
                                "value": "-23.0",
                                "type": None,
                                "list_value_id": None,
                                "commit_id": commit_id,
                            },
                        ]
                    },
                )

    def test_get_parameter_values_for_given_alternative(self):
        """'model' view responds with parameter values filtered by alternative id."""
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            import_alternatives(db_map, ("Base", "alternative"))
            import_objects(db_map, (("commodity", "object_11"), ("node", "object_21")))
            import_object_parameter_values(
                db_map,
                (
                    ("commodity", "object_11", "price", 5.0, "Base"),
                    ("commodity", "object_11", "price", -5.0, "alternative"),
                    ("node", "object_21", "inflow", 23.0, "Base"),
                    ("node", "object_21", "inflow", -23.0, "alternative"),
                ),
            )
            db_map.commit_session("Add test data.")
            alternative_id = (
                db_map.query(db_map.alternative_sq)
                .filter(db_map.alternative_sq.c.name == "alternative")
                .one()
                .id
            )
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "parameter values?",
                        "projectId": project.id,
                        "alternative_id": alternative_id,
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                value_dicts = json.loads(response.content)
                commit_id = value_dicts["values"][0]["commit_id"]
                class_1_id = value_dicts["values"][0]["entity_class_id"]
                class_2_id = value_dicts["values"][1]["entity_class_id"]
                definition_1_id = value_dicts["values"][0]["parameter_definition_id"]
                definition_2_id = value_dicts["values"][1]["parameter_definition_id"]
                entity_1_id = value_dicts["values"][0]["entity_id"]
                entity_2_id = value_dicts["values"][1]["entity_id"]
                value_1_id = value_dicts["values"][0]["id"]
                value_2_id = value_dicts["values"][1]["id"]
                self.assertEqual(
                    value_dicts,
                    {
                        "values": [
                            {
                                "id": value_1_id,
                                "entity_class_id": class_1_id,
                                "object_class_id": class_1_id,
                                "relationship_class_id": None,
                                "entity_id": entity_1_id,
                                "object_id": entity_1_id,
                                "relationship_id": None,
                                "parameter_definition_id": definition_1_id,
                                "alternative_id": alternative_id,
                                "value": "-5.0",
                                "type": None,
                                "list_value_id": None,
                                "commit_id": commit_id,
                            },
                            {
                                "id": value_2_id,
                                "entity_class_id": class_2_id,
                                "object_class_id": class_2_id,
                                "relationship_class_id": None,
                                "entity_id": entity_2_id,
                                "object_id": entity_2_id,
                                "relationship_id": None,
                                "parameter_definition_id": definition_2_id,
                                "alternative_id": alternative_id,
                                "value": "-23.0",
                                "type": None,
                                "list_value_id": None,
                                "commit_id": commit_id,
                            },
                        ]
                    },
                )

    def test_get_relationships_of_given_class(self):
        """'model' view responds with a dict containing the relationships of the relationship class with given id."""
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            import_objects(db_map, (("commodity", "object_11"), ("node", "object_21")))
            import_relationships(
                db_map, ((("commodity__node", ("object_11", "object_21")),))
            )
            db_map.commit_session("Add test data")
            relationship_class_id = (
                db_map.query(db_map.entity_class_sq)
                .filter(db_map.entity_class_sq.c.name == "commodity__node")
                .one()
                .id
            )
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "relationships?",
                        "projectId": project.id,
                        "relationship_class_id": relationship_class_id,
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                relationship_dicts = json.loads(response.content)
                commit_id = relationship_dicts["relationships"][0]["commit_id"]
                relationship_id = relationship_dicts["relationships"][0]["id"]
                object_class_1_id = relationship_dicts["relationships"][0][
                    "object_class_id"
                ]
                object_class_2_id = relationship_dicts["relationships"][1][
                    "object_class_id"
                ]
                object_1_id = relationship_dicts["relationships"][0]["object_id"]
                object_2_id = relationship_dicts["relationships"][1]["object_id"]
                self.assertEqual(
                    relationship_dicts,
                    {
                        "relationships": [
                            {
                                "id": relationship_id,
                                "class_id": relationship_class_id,
                                "name": "commodity__node_object_11__object_21",
                                "commit_id": commit_id,
                                "dimension": 0,
                                "class_name": "commodity__node",
                                "object_id": object_1_id,
                                "object_name": "object_11",
                                "object_class_id": object_class_1_id,
                                "object_class_name": "commodity",
                            },
                            {
                                "id": relationship_id,
                                "class_id": relationship_class_id,
                                "name": "commodity__node_object_11__object_21",
                                "commit_id": commit_id,
                                "dimension": 1,
                                "class_name": "commodity__node",
                                "object_id": object_2_id,
                                "object_name": "object_21",
                                "object_class_id": object_class_2_id,
                                "object_class_name": "node",
                            },
                        ]
                    },
                )

    def test_get_available_relationship_objects(self):
        """'model' view responds with a list containing available relationship's objects."""
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            import_objects(
                db_map,
                (
                    ("node", "node_1"),
                    ("node", "node_2"),
                    ("commodity", "commodity_1"),
                    ("commodity", "commodity_2"),
                ),
            )
            db_map.commit_session("Add test data.")
            relationship_class_id = (
                db_map.query(db_map.entity_class_sq)
                .filter(db_map.entity_class_sq.c.name == "commodity__node")
                .one()
                .id
            )
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "available relationship objects?",
                        "projectId": project.id,
                        "relationship_class_id": relationship_class_id,
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                relationship_dicts = json.loads(response.content)
                self.assertEqual(
                    relationship_dicts,
                    {
                        "available_objects": [
                            ["commodity_1", "commodity_2"],
                            ["node_1", "node_2"],
                        ]
                    },
                )

    def test_get_parameter_value_lists_for_specific_id(self):
        """'model' view responds with parameter value lists filtered by ids."""
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            list_id = (
                db_map.query(db_map.parameter_value_list_sq)
                .filter(db_map.parameter_value_list_sq.c.name == "solver")
                .one()
                .id
            )
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "parameter value lists?",
                        "projectId": project.id,
                        "value_list_ids": [list_id],
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
                                "id": list_id,
                                "value_list": ['"glpsol"', '"highs"'],
                                "type_list": [None, None],
                            }
                        ]
                    },
                )

    def test_get_commits(self):
        """'model' view responds with all commits."""
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            import_object_classes(db_map, ("class_1",))  # Must have some data to commit
            db_map.commit_session("My commit message.")
            commit_id = db_map.query(db_map.commit_sq).all()[-1].id
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {"type": "commits?", "projectId": project.id},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                commit_dicts = json.loads(response.content)
                self.assertIn("commits", commit_dicts)
                for commit in commit_dicts["commits"]:
                    self.assertIn("date", commit)
                    del commit["date"]
                self.assertEqual(
                    commit_dicts["commits"][-1],
                    {"id": commit_id, "comment": "My commit message.", "user": "anon"},
                )

    def test_commit_parameter_value_deletion(self):
        """'model' view deletes given parameter value and responds with OK status."""
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            import_objects(db_map, (("node", "my_object"),))
            import_object_parameter_values(
                db_map, (("node", "my_object", "inflow", 23.0),)
            )
            db_map.commit_session("Add test data.")
            value_id = db_map.query(db_map.parameter_value_sq).one_or_none().id
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": project.id,
                        "deletions": {"parameter_value": [value_id]},
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
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            import_alternatives(db_map, ("my_alternative",))
            import_objects(db_map, (("node", "my_object"),))
            db_map.commit_session("Add test data.")
            class_id = (
                db_map.query(db_map.entity_class_sq)
                .filter(db_map.entity_class_sq.c.name == "node")
                .one()
                .id
            )
            definition_id = (
                db_map.query(db_map.parameter_definition_sq)
                .filter(db_map.parameter_definition_sq.c.name == "inflow")
                .one()
                .id
            )
            alternative_id = (
                db_map.query(db_map.alternative_sq)
                .filter(db_map.alternative_sq.c.name == "my_alternative")
                .one()
                .id
            )
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": project.id,
                        "class_id": class_id,
                        "insertions": {
                            "parameter_value": [
                                {
                                    "entity_name": "my_object",
                                    "definition_id": definition_id,
                                    "alternative_id": alternative_id,
                                    "value": -5.5,
                                }
                            ]
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
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            import_alternatives(db_map, ("my_alternative",))
            import_objects(db_map, (("unit", "unit_1"), ("node", "input_1")))
            import_relationships(db_map, (("unit__inputNode", ("unit_1", "input_1")),))
            db_map.commit_session("Add test data.")
            class_id = (
                db_map.query(db_map.entity_class_sq)
                .filter(db_map.entity_class_sq.c.name == "unit__inputNode")
                .one()
                .id
            )
            parameter_id = (
                db_map.query(db_map.parameter_definition_sq)
                .filter(
                    db_map.parameter_definition_sq.c.name == "ramp_cost",
                    db_map.parameter_definition_sq.c.entity_class_id == class_id,
                )
                .one()
                .id
            )
            alternative_id = db_map.query(db_map.alternative_sq).one().id
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": project.id,
                        "class_id": class_id,
                        "insertions": {
                            "parameter_value": [
                                {
                                    "entity_name": "unit__inputNode_unit_1__input_1",
                                    "definition_id": parameter_id,
                                    "alternative_id": alternative_id,
                                    "value": -5.5,
                                }
                            ]
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
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            import_alternatives(db_map, ("map_alternative", "array_alternative"))
            import_objects(db_map, (("node", "my_object"),))
            db_map.commit_session("Add test data.")
            class_id = (
                db_map.query(db_map.entity_class_sq)
                .filter(db_map.entity_class_sq.c.name == "node")
                .one()
                .id
            )
            parameter_id = (
                db_map.query(db_map.parameter_definition_sq)
                .filter(db_map.parameter_definition_sq.c.name == "inflow")
                .one()
                .id
            )
            alternative_ids = {
                row.name: row.id for row in db_map.query(db_map.alternative_sq)
            }
            map_alternative_id = alternative_ids["map_alternative"]
            array_alternative_id = alternative_ids["array_alternative"]
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": project.id,
                        "class_id": class_id,
                        "insertions": {
                            "parameter_value": [
                                {
                                    "entity_name": "my_object",
                                    "definition_id": parameter_id,
                                    "alternative_id": map_alternative_id,
                                    "value": {
                                        "type": "map",
                                        "index_type": "str",
                                        "data": [["a", 99]],
                                    },
                                },
                                {
                                    "entity_name": "my_object",
                                    "definition_id": parameter_id,
                                    "alternative_id": array_alternative_id,
                                    "value": {
                                        "type": "array",
                                        "value_type": "float",
                                        "data": [99],
                                    },
                                },
                            ]
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
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            import_objects(db_map, (("node", "my_object"),))
            import_object_parameter_values(
                db_map, (("node", "my_object", "inflow", 2.3),)
            )
            db_map.commit_session("Add test data.")
            value_id = db_map.query(db_map.parameter_value_sq).one().id
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": project.id,
                        "updates": {
                            "parameter_value": [{"id": value_id, "value": -5.5}]
                        },
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
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            import_alternatives(db_map, ("map_alternative", "array_alternative"))
            import_objects(db_map, (("node", "my_object"),))
            import_object_parameter_values(
                db_map,
                (
                    (
                        "node",
                        "my_object",
                        "inflow",
                        Map(["??"], [-99.0]),
                        "map_alternative",
                    ),
                    (
                        "node",
                        "my_object",
                        "inflow",
                        Array([-99.0]),
                        "array_alternative",
                    ),
                ),
            )
            db_map.commit_session("Add test data.")
            alternative_ids = {
                row.name: row.id for row in db_map.query(db_map.alternative_sq)
            }
            values_by_alternative_id = {
                row.alternative_id: row.id
                for row in db_map.query(db_map.parameter_value_sq)
            }
            map_value_id = values_by_alternative_id[alternative_ids["map_alternative"]]
            array_value_id = values_by_alternative_id[
                alternative_ids["array_alternative"]
            ]
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": project.id,
                        "updates": {
                            "parameter_value": [
                                {
                                    "id": map_value_id,
                                    "value": {
                                        "type": "map",
                                        "index_type": "str",
                                        "data": [["a", 99]],
                                    },
                                },
                                {
                                    "id": array_value_id,
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
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": project.id,
                        "insertions": {"alternative": [{"name": "my_alternative"}]},
                        "message": "Insert alternative.",
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                alternative_id = content["inserted"]["alternative"]["my_alternative"]
                self.assertTrue(isinstance(alternative_id, int))
                self.assertEqual(
                    content,
                    {"inserted": {"alternative": {"my_alternative": alternative_id}}},
                )
            alternatives = db_map.query(db_map.alternative_sq).all()
            self.assertEqual(len(alternatives), 1)
            self.assertEqual(alternatives[0].name, "my_alternative")
            commits = db_map.query(db_map.commit_sq).all()
            self.assertEqual(commits[-1].comment, "Insert alternative.")
            db_map.connection.close()

    def test_commit_scenario_insertion(self):
        """'model' view inserts a scenario and responds with OK status."""
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": project.id,
                        "insertions": {"scenario": [{"name": "my_scenario"}]},
                        "message": "Insert scenario.",
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                scenario = db_map.query(db_map.scenario_sq).one()
                self.assertEqual(
                    content, {"inserted": {"scenario": {"my_scenario": scenario.id}}}
                )
            self.assertEqual(scenario.name, "my_scenario")
            commits = db_map.query(db_map.commit_sq).all()
            self.assertEqual(commits[-1].comment, "Insert scenario.")
            db_map.connection.close()

    def test_commit_scenario_alternatives_insertion(self):
        """'model' view inserts a scenario and responds with OK status."""
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                import_alternatives(db_map, ("alternative_1", "alternative_2"))
                import_scenarios(db_map, ("my_scenario",))
                db_map.commit_session("Add test data.")
                scenario_id = db_map.query(db_map.scenario_sq).one().id
                alternative_ids = {
                    row.name: row.id for row in db_map.query(db_map.alternative_sq)
                }
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": project.id,
                        "insertions": {
                            "scenario_alternative": [
                                {
                                    "scenario_name": "my_scenario",
                                    "alternative_name": "alternative_1",
                                    "rank": 0,
                                },
                                {
                                    "scenario_name": "my_scenario",
                                    "alternative_name": "alternative_2",
                                    "rank": 1,
                                },
                            ]
                        },
                        "message": "Insert scenario alternatives.",
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                scenario_alternatives = db_map.query(
                    db_map.scenario_alternative_sq
                ).all()
                self.assertEqual(len(scenario_alternatives), 2)
                self.assertEqual(
                    content,
                    {
                        "inserted": {
                            "scenario_alternative": {
                                "my_scenario": {
                                    "0": scenario_alternatives[0].id,
                                    "1": scenario_alternatives[1].id,
                                }
                            }
                        }
                    },
                )
            scenario_alternatives = db_map.query(db_map.scenario_alternative_sq).all()
            self.assertEqual(len(scenario_alternatives), 2)
            commit_id = db_map.query(db_map.commit_sq).all()[-1].id
            self.assertEqual(
                scenario_alternatives[0]._asdict(),
                {
                    "id": scenario_alternatives[0].id,
                    "scenario_id": scenario_id,
                    "alternative_id": alternative_ids["alternative_1"],
                    "rank": 0,
                    "commit_id": commit_id,
                },
            )
            self.assertEqual(
                scenario_alternatives[1]._asdict(),
                {
                    "id": scenario_alternatives[1].id,
                    "scenario_id": scenario_id,
                    "alternative_id": alternative_ids["alternative_2"],
                    "rank": 1,
                    "commit_id": commit_id,
                },
            )
            commits = db_map.query(db_map.commit_sq).all()
            self.assertEqual(commits[-1].comment, "Insert scenario alternatives.")
            db_map.connection.close()

    def test_commit_object_insertion(self):
        """'model' view inserts an object and responds with OK status."""
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            import_object_classes(db_map, ("my_class",))
            db_map.commit_session("Add test data.")
            class_id = (
                db_map.query(db_map.entity_class_sq)
                .filter(db_map.entity_class_sq.c.name == "my_class")
                .one()
                .id
            )
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": project.id,
                        "class_id": class_id,
                        "insertions": {"object": [{"name": "my_object"}]},
                        "message": "Insert object.",
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                object_id = content["inserted"]["object"]["my_object"]
                self.assertEqual(
                    content, {"inserted": {"object": {"my_object": object_id}}}
                )
            objects = db_map.query(db_map.object_sq).all()
            self.assertEqual(len(objects), 1)
            self.assertEqual(objects[0].name, "my_object")
            commits = db_map.query(db_map.commit_sq).all()
            self.assertEqual(commits[-1].comment, "Insert object.")
            db_map.connection.close()

    def test_commit_relationship_insertion(self):
        """'model' view inserts a relationship and responds with OK status."""
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            import_object_classes(db_map, ("my_object_class",))
            import_objects(db_map, (("my_object_class", "my_object"),))
            import_relationship_classes(db_map, (("my_class", ("my_object_class",)),))
            db_map.commit_session("Add test data.")
            class_id = (
                db_map.query(db_map.entity_class_sq)
                .filter(db_map.entity_class_sq.c.name == "my_class")
                .one()
                .id
            )
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": project.id,
                        "class_id": class_id,
                        "insertions": {
                            "relationship": [
                                {
                                    "name": "my_object_class_my_object",
                                    "object_name_list": ["my_object"],
                                }
                            ]
                        },
                        "message": "Insert relationship.",
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                relationship_id = content["inserted"]["relationship"][
                    "my_object_class_my_object"
                ]
                self.assertEqual(
                    content,
                    {
                        "inserted": {
                            "relationship": {
                                "my_object_class_my_object": relationship_id
                            }
                        }
                    },
                )
            relationships = db_map.query(db_map.wide_relationship_sq).all()
            self.assertEqual(len(relationships), 1)
            self.assertEqual(relationships[0].name, "my_object_class_my_object")
            commits = db_map.query(db_map.commit_sq).all()
            self.assertEqual(commits[-1].comment, "Insert relationship.")
            db_map.connection.close()

    def test_get_physical_classes(self):
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
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
                    {"type": "physical classes?", "projectId": project.id},
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
                    kwargs=(
                        {"project_id": project.id, "class_id": object_class_row["id"]}
                    ),
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
                            {
                                "project_id": project.id,
                                "class_id": relationship_class["id"],
                            }
                        ),
                    ),
                )

    def test_commit_alternative_deletion(self):
        """'model' view deletes given alternative and responds with OK status."""
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            import_alternatives(db_map, ("my_alternative",))
            db_map.commit_session("Add test data.")
            alternative_id = (
                db_map.query(db_map.alternative_sq)
                .filter(db_map.alternative_sq.c.name == "my_alternative")
                .one()
                .id
            )
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": project.id,
                        "deletions": {"alternative": [alternative_id]},
                        "message": "Delete alternative.",
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(content, {})
            alternatives = db_map.query(db_map.alternative_sq).all()
            self.assertEqual(len(alternatives), 0)
            commits = db_map.query(db_map.commit_sq).all()
            self.assertEqual(commits[-1].comment, "Delete alternative.")
            db_map.connection.close()

    def test_commit_scenario_deletion(self):
        """'model' view deletes given scenario and responds with OK status."""
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            import_scenarios(db_map, ("my_scenario",))
            db_map.commit_session("Add test data.")
            scenario_id = db_map.query(db_map.scenario_sq).one().id
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": project.id,
                        "deletions": {"scenario": [scenario_id]},
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
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            import_alternatives(db_map, ("my_alternative",))
            import_scenarios(db_map, ("my_scenario",))
            import_scenario_alternatives(db_map, (("my_scenario", "my_alternative"),))
            db_map.commit_session("Add test data.")
            scenario_alternative_id = (
                db_map.query(db_map.scenario_alternative_sq).one().id
            )
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": project.id,
                        "deletions": {
                            "scenario_alternative": [scenario_alternative_id]
                        },
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
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            import_object_classes(db_map, ("my_class",))
            import_objects(db_map, (("my_class", "my_object"),))
            db_map.commit_session("Add test data.")
            object_id = (
                db_map.query(db_map.object_sq)
                .filter(db_map.object_sq.c.name == "my_object")
                .one()
                .id
            )
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": project.id,
                        "deletions": {"object": [object_id]},
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
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            import_objects(db_map, (("node", "node_1"),))
            import_objects(db_map, (("commodity", "commodity_1"),))
            import_relationships(
                db_map, (("commodity__node", ("commodity_1", "node_1")),)
            )
            db_map.commit_session("Add test data.")
            relationship_id = db_map.query(db_map.wide_relationship_sq).one().id
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": project.id,
                        "deletions": {"relationship": [relationship_id]},
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
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            import_alternatives(db_map, ("my_alternative",))
            db_map.commit_session("Add test data.")
            alternative_id = (
                db_map.query(db_map.alternative_sq)
                .filter(db_map.alternative_sq.c.name == "my_alternative")
                .one()
                .id
            )
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": project.id,
                        "updates": {
                            "alternative": [{"id": alternative_id, "name": "renamed"}]
                        },
                        "message": "Rename alternative.",
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(content, {})
            alternatives = db_map.query(db_map.alternative_sq).all()
            self.assertEqual(len(alternatives), 1)
            self.assertEqual(alternatives[0].name, "renamed")
            commits = db_map.query(db_map.commit_sq).all()
            self.assertEqual(commits[-1].comment, "Rename alternative.")
            db_map.connection.close()

    def test_commit_scenario_update(self):
        """'model' view updates scenario in model and responds with OK status."""
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            import_scenarios(db_map, ("my_scenario",))
            db_map.commit_session("Add test data.")
            scenario_id = (
                db_map.query(db_map.scenario_sq)
                .filter(db_map.scenario_sq.c.name == "my_scenario")
                .one()
                .id
            )
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": project.id,
                        "updates": {
                            "scenario": [{"id": scenario_id, "name": "renamed"}]
                        },
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
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            import_scenarios(db_map, ("my_scenario",))
            import_alternatives(db_map, ("alternative_1", "alternative_2"))
            import_scenario_alternatives(db_map, (("my_scenario", "alternative_2"),))
            db_map.commit_session("Add test data.")
            scenario_alternative_id = (
                db_map.query(db_map.scenario_alternative_sq).one().id
            )
            scenario_id = db_map.query(db_map.scenario_sq).one().id
            alternative_id = (
                db_map.query(db_map.alternative_sq)
                .filter(db_map.alternative_sq.c.name == "alternative_1")
                .one()
                .id
            )
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": project.id,
                        "updates": {
                            "scenario_alternative": [
                                {
                                    "id": scenario_alternative_id,
                                    "alternative_name": "alternative_1",
                                }
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
                    "id": scenario_alternative_id,
                    "scenario_id": scenario_id,
                    "alternative_id": alternative_id,
                    "rank": 1,
                    "commit_id": db_map.query(db_map.commit_sq).all()[-1].id,
                },
            )
            commits = db_map.query(db_map.commit_sq).all()
            self.assertEqual(commits[-1].comment, "Change scenario alternative.")
            db_map.connection.close()

    def test_commit_object_update(self):
        """'model' view updates object in model and responds with OK status."""
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            import_objects(db_map, (("node", "my_object"),))
            db_map.commit_session("Add test data.")
            object_id = db_map.query(db_map.object_sq).one_or_none().id
            class_id = (
                db_map.query(db_map.entity_class_sq)
                .filter(db_map.entity_class_sq.c.name == "node")
                .one_or_none()
                .id
            )
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": project.id,
                        "updates": {"object": [{"id": object_id, "name": "renamed"}]},
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
            self.assertEqual(objects[0].class_id, class_id)
            commits = db_map.query(db_map.commit_sq).all()
            self.assertEqual(commits[-1].comment, "Rename object.")
            db_map.connection.close()

    def test_commit_relationship_update(self):
        """'model' view updates relationship in model and responds with OK status."""
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_MODEL_DATABASE)
            )
            import_objects(
                db_map,
                (
                    ("commodity", "commodity_1"),
                    ("commodity", "commodity_2"),
                    ("node", "node_1"),
                    ("node", "node_2"),
                ),
            )
            import_relationships(
                db_map, (("commodity__node", ("commodity_2", "node_2")),)
            )
            db_map.commit_session("Add test data.")
            class_id = (
                db_map.query(db_map.entity_class_sq)
                .filter(db_map.entity_class_sq.c.name == "commodity__node")
                .one()
                .id
            )
            relationship_id = db_map.query(db_map.wide_relationship_sq).one().id
            commodity_1 = (
                db_map.query(db_map.entity_sq)
                .filter(db_map.entity_sq.c.name == "commodity_1")
                .one()
            )
            node_1 = (
                db_map.query(db_map.entity_sq)
                .filter(db_map.entity_sq.c.name == "node_1")
                .one()
            )
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.model_url,
                    {
                        "type": "commit",
                        "projectId": project.id,
                        "class_id": class_id,
                        "updates": {
                            "relationship": [
                                {
                                    "id": relationship_id,
                                    "name": "renamed",
                                    "object_name_list": ["commodity_1", "node_1"],
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
            self.assertEqual(relationships[0].object_id, commodity_1.id)
            self.assertEqual(relationships[0].id, relationship_id)
            self.assertEqual(relationships[1].name, "renamed")
            self.assertEqual(relationships[1].object_id, node_1.id)
            self.assertEqual(relationships[1].id, relationship_id)
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
        mod_script_path = Path("path", "to", "mod script")
        arguments = executions_view.solve_model_interpreter_arguments(
            project_path, mod_script_path
        )
        expected = [
            "-mspinetoolbox",
            "--mod-script",
            str(mod_script_path),
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
        with new_project(self.baron) as project:
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
        with new_project(self.baron) as project:
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
                    {"type": "scenario list?", "projectId": 1},
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
        with new_project(self.baron) as project:
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
                    {"type": "summary?", "projectId": 1, "scenarioExecutionId": 1},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                expected = {"summary": self.summary_rows()}
                self.assertEqual(content, expected)

    def test_get_summary_when_filter_id_names_are_inverted(self):
        with new_project(self.baron) as project:
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
                    {"type": "summary?", "projectId": 1, "scenarioExecutionId": 1},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                expected = {"summary": self.summary_rows()}
                self.assertEqual(content, expected)

    def test_get_result_alternative(self):
        with new_project(self.baron) as project:
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
    analysis_url = reverse("flextool3:analysis")

    @classmethod
    def setUpTestData(cls):
        cls.baron = User(username="baron", password="")
        cls.baron.set_password("secretbaron")
        cls.baron.save()

    def test_get_object_values(self):
        with new_project(self.baron) as project:
            scenario = Scenario(project=project, name="Base")
            scenario.save()
            scenario_execution = ScenarioExecution(
                scenario=scenario,
                execution_time=datetime.fromisoformat("2022-06-01T14:14:00+03:00"),
                execution_time_offset=3 * 3600,
                log="",
            )
            scenario_execution.save()
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_RESULT_DATABASE),
                create=True,
            )
            _, errors = import_alternatives(
                db_map, ("Base__Import_Flex3@2022-06-01T14:15:00",)
            )
            self.assertEqual(errors, [])
            _, errors = import_object_classes(db_map, ("my_class", "other_class"))
            self.assertEqual(errors, [])
            _, errors = import_object_parameters(
                db_map,
                (
                    ("my_class", "object_parameter"),
                    ("my_class", "uninteresting_parameter"),
                    ("other_class", "other_parameter"),
                ),
            )
            self.assertEqual(errors, [])
            _, errors = import_objects(
                db_map,
                (
                    ("my_class", "my_object"),
                    ("my_class", "discarded_object"),
                    ("other_class", "other_object"),
                ),
            )
            self.assertEqual(errors, [])
            import_object_parameter_values(
                db_map,
                (
                    (
                        "my_class",
                        "my_object",
                        "object_parameter",
                        99.0,
                        "Base__Import_Flex3@2022-06-01T14:15:00",
                    ),
                    (
                        "my_class",
                        "my_object",
                        "uninteresting_parameter",
                        98.0,
                        "Base__Import_Flex3@2022-06-01T14:15:00",
                    ),
                    (
                        "my_class",
                        "discarded_object",
                        "object_parameter",
                        97.0,
                        "Base__Import_Flex3@2022-06-01T14:15:00",
                    ),
                    (
                        "other_class",
                        "other_object",
                        "other_parameter",
                        96.0,
                        "Base__Import_Flex3@2022-06-01T14:15:00",
                    ),
                ),
            )
            self.assertEqual(errors, [])
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.analysis_url,
                    {
                        "type": "values?",
                        "projectId": 1,
                        "classes": ["my_class"],
                        "parameters": ["object_parameter"],
                        "objects": [["my_object"]],
                        "scenarioExecutionIds": [scenario_execution.id],
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(
                    content,
                    {
                        "values": [
                            {
                                "class": "my_class",
                                "object_classes": ["my_class"],
                                "objects": ["my_object"],
                                "parameter": "object_parameter",
                                "scenario": "Base",
                                "time_stamp": "2022-06-01T11:14:00+00:00",
                                "type": None,
                                "value": "99.0",
                            }
                        ]
                    },
                )

    def test_get_multidimensional_relationship_values(self):
        with new_project(self.baron) as project:
            scenario = Scenario(project=project, name="Base")
            scenario.save()
            scenario_execution = ScenarioExecution(
                scenario=scenario,
                execution_time=datetime.fromisoformat("2022-06-01T14:14:00+03:00"),
                execution_time_offset=3 * 3600,
                log="",
            )
            scenario_execution.save()
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_RESULT_DATABASE),
                create=True,
            )
            _, errors = import_alternatives(
                db_map, ("Base__Import_Flex3@2022-06-01T14:15:00",)
            )
            self.assertEqual(errors, [])
            _, errors = import_object_classes(db_map, ("my_class", "other_class"))
            self.assertEqual(errors, [])
            _, errors = import_objects(
                db_map,
                (
                    ("my_class", "my_object"),
                    ("other_class", "other_object"),
                    ("other_class", "still_another_object"),
                ),
            )
            self.assertEqual(errors, [])
            _, errors = import_relationship_classes(
                db_map, (("my_relation_class", ("my_class", "other_class")),)
            )
            self.assertEqual(errors, [])
            _, errors = import_relationships(
                db_map,
                (
                    ("my_relation_class", ("my_object", "other_object")),
                    ("my_relation_class", ("my_object", "still_another_object")),
                ),
            )
            self.assertEqual(errors, [])
            _, errors = import_relationship_parameters(
                db_map, (("my_relation_class", "relation_parameter"),)
            )
            self.assertEqual(errors, [])
            _, errors = import_relationship_parameter_values(
                db_map,
                (
                    (
                        "my_relation_class",
                        ["my_object", "other_object"],
                        "relation_parameter",
                        99.0,
                        "Base__Import_Flex3@2022-06-01T14:15:00",
                    ),
                    (
                        "my_relation_class",
                        ["my_object", "still_another_object"],
                        "relation_parameter",
                        98.0,
                        "Base__Import_Flex3@2022-06-01T14:15:00",
                    ),
                ),
            )
            self.assertEqual(errors, [])
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.analysis_url,
                    {
                        "type": "values?",
                        "projectId": 1,
                        "classes": ["my_relation_class"],
                        "parameters": ["relation_parameter"],
                        "objects": [["my_object"], ["still_another_object"]],
                        "scenarioExecutionIds": [scenario_execution.id],
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(
                    content,
                    {
                        "values": [
                            {
                                "class": "my_relation_class",
                                "object_classes": ["my_class", "other_class"],
                                "objects": ["my_object", "still_another_object"],
                                "parameter": "relation_parameter",
                                "scenario": "Base",
                                "time_stamp": "2022-06-01T11:14:00+00:00",
                                "type": None,
                                "value": "98.0",
                            }
                        ]
                    },
                )

    def test_get_entity_classes(self):
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_RESULT_DATABASE)
            )
            classes = sorted(
                ({"name": e.name} for e in db_map.query(db_map.entity_class_sq)),
                key=itemgetter("name"),
            )
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.analysis_url,
                    {"type": "entity classes?", "projectId": project.id},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(content, {"entity_classes": classes})

    def test_get_parameters(self):
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_RESULT_DATABASE),
                create=True,
            )
            import_object_classes(db_map, ("my_class",))
            import_object_parameters(db_map, (("my_class", "object_parameter"),))
            import_relationship_classes(db_map, (("my_relation_class", ("my_class",)),))
            _, errors = import_relationship_parameters(
                db_map, (("my_relation_class", "relation_parameter"),)
            )
            self.assertEqual(errors, [])
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.analysis_url,
                    {
                        "type": "parameters?",
                        "projectId": project.id,
                        "classes": ["my_class", "my_relation_class"],
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(
                    content,
                    {
                        "parameters": [
                            {"name": "object_parameter", "class_name": "my_class"},
                            {
                                "name": "relation_parameter",
                                "class_name": "my_relation_class",
                            },
                        ]
                    },
                )

    def test_get_entities(self):
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_RESULT_DATABASE),
                create=True,
            )
            import_object_classes(db_map, ("my_class",))
            import_objects(db_map, (("my_class", "object_1"),))
            import_relationship_classes(db_map, (("my_relation_class", ("my_class",)),))
            import_relationships(db_map, (("my_relation_class", ("object_1",)),))
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.analysis_url,
                    {
                        "type": "entities?",
                        "projectId": project.id,
                        "classes": ["my_class", "my_relation_class"],
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(
                    content,
                    {
                        "entities": [
                            {"names": ["object_1"], "class_name": "my_class"},
                            {"names": ["object_1"], "class_name": "my_relation_class"},
                        ]
                    },
                )

    def test_get_parameter_value_indexes(self):
        with new_project(self.baron) as project:
            scenario = Scenario(project=project, name="Base")
            scenario.save()
            scenario_execution = ScenarioExecution(
                scenario=scenario,
                execution_time=datetime.fromisoformat("2022-06-01T14:14:00+03:00"),
                execution_time_offset=3 * 3600,
                log="",
            )
            scenario_execution.save()
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_RESULT_DATABASE),
                create=True,
            )
            _, errors = import_alternatives(
                db_map, ("Base__Import_Flex3@2022-06-01T14:15:00",)
            )
            self.assertEqual(errors, [])
            _, errors = import_object_classes(db_map, ("my_class",))
            self.assertEqual(errors, [])
            _, errors = import_object_parameters(
                db_map, (("my_class", "object_parameter"),)
            )
            self.assertEqual(errors, [])
            _, errors = import_objects(db_map, (("my_class", "my_object"),))
            self.assertEqual(errors, [])
            _, errors = import_object_parameter_values(
                db_map,
                (
                    (
                        "my_class",
                        "my_object",
                        "object_parameter",
                        Map(
                            ["A", "B"],
                            [
                                Map(["a", "b"], [2.3, -2.3], index_name="index 2"),
                                Map(["a", "b"], [5.5, -5.5], index_name="index 2"),
                            ],
                            index_name="index 1",
                        ),
                        "Base__Import_Flex3@2022-06-01T14:15:00",
                    ),
                ),
            )
            self.assertEqual(errors, [])
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.analysis_url,
                    {
                        "type": "value indexes?",
                        "projectId": project.id,
                        "scenarioExecutionIds": [scenario_execution.id],
                        "classes": ["my_class"],
                        "parameters": ["object_parameter"],
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                expected = {
                    "indexes": [
                        {
                            "index_name": "index 1",
                            "indexes": ["A", "B"],
                            "depth": 0,
                            "class_names": ["my_class"],
                            "parameter_names": ["object_parameter"],
                        },
                        {
                            "index_name": "index 2",
                            "indexes": ["a", "b"],
                            "depth": 1,
                            "class_names": ["my_class"],
                            "parameter_names": ["object_parameter"],
                        },
                    ]
                }
                self.assertEqual(content, expected)

    def test_get_parameter_value_indexes_works_without_scenario_execution_ids(self):
        with new_project(self.baron) as project:
            scenario = Scenario(project=project, name="Base")
            scenario.save()
            scenario_execution = ScenarioExecution(
                scenario=scenario,
                execution_time=datetime.fromisoformat("2022-06-01T14:14:00+03:00"),
                execution_time_offset=3 * 3600,
                log="",
            )
            scenario_execution.save()
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_RESULT_DATABASE),
                create=True,
            )
            _, errors = import_alternatives(
                db_map, ("Base__Import_Flex3@2022-06-01T14:15:00",)
            )
            self.assertEqual(errors, [])
            _, errors = import_object_classes(db_map, ("my_class",))
            self.assertEqual(errors, [])
            _, errors = import_object_parameters(
                db_map, (("my_class", "object_parameter"),)
            )
            self.assertEqual(errors, [])
            _, errors = import_objects(db_map, (("my_class", "my_object"),))
            self.assertEqual(errors, [])
            _, errors = import_object_parameter_values(
                db_map,
                (
                    (
                        "my_class",
                        "my_object",
                        "object_parameter",
                        Map(
                            ["A", "B"],
                            [
                                Map(["a", "b"], [2.3, -2.3], index_name="index 2"),
                                Map(["a", "b"], [5.5, -5.5], index_name="index 2"),
                            ],
                            index_name="index 1",
                        ),
                        "Base__Import_Flex3@2022-06-01T14:15:00",
                    ),
                ),
            )
            self.assertEqual(errors, [])
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.analysis_url,
                    {
                        "type": "value indexes?",
                        "projectId": 1,
                        "scenarioExecutionIds": [],
                        "classes": ["my_class"],
                        "parameters": ["object_parameter"],
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                expected = {
                    "indexes": [
                        {
                            "index_name": "index 1",
                            "indexes": ["A", "B"],
                            "depth": 0,
                            "class_names": ["my_class"],
                            "parameter_names": ["object_parameter"],
                        },
                        {
                            "index_name": "index 2",
                            "indexes": ["a", "b"],
                            "depth": 1,
                            "class_names": ["my_class"],
                            "parameter_names": ["object_parameter"],
                        },
                    ]
                }
                self.assertEqual(content, expected)

    def test_get_parameter_value_indexes_gathers_all_nested_indexes_from_diffent_alternatives(
        self,
    ):
        with new_project(self.baron) as project:
            scenario_1 = Scenario(project=project, name="Base+Coal")
            scenario_1.save()
            scenario_execution_1 = ScenarioExecution(
                scenario=scenario_1,
                execution_time=datetime.fromisoformat("2022-06-01T14:14:00+03:00"),
                execution_time_offset=3 * 3600,
                log="",
            )
            scenario_execution_1.save()
            scenario_2 = Scenario(project=project, name="Base+Wind")
            scenario_2.save()
            scenario_execution_2 = ScenarioExecution(
                scenario=scenario_2,
                execution_time=datetime.fromisoformat("2023-01-09T09:00:00+02:00"),
                execution_time_offset=2 * 3600,
                log="",
            )
            scenario_execution_2.save()
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_RESULT_DATABASE),
                create=True,
            )
            _, errors = import_alternatives(
                db_map,
                (
                    "Base+Coal__Import_Flex3@2022-06-01T14:15:00",
                    "Base+Wind__Import_Flex3@2023-01-09T09:01:00",
                ),
            )
            self.assertEqual(errors, [])
            _, errors = import_object_classes(db_map, ("my_class",))
            self.assertEqual(errors, [])
            _, errors = import_object_parameters(
                db_map, (("my_class", "object_parameter"),)
            )
            self.assertEqual(errors, [])
            _, errors = import_objects(
                db_map, (("my_class", "my_object"), ("my_class", "your_object"))
            )
            self.assertEqual(errors, [])
            _, errors = import_object_parameter_values(
                db_map,
                (
                    (
                        "my_class",
                        "my_object",
                        "object_parameter",
                        Map(
                            ["A"],
                            [Map(["a", "b"], [2.3, -2.3], index_name="index 2")],
                            index_name="index 1",
                        ),
                        "Base+Coal__Import_Flex3@2022-06-01T14:15:00",
                    ),
                    (
                        "my_class",
                        "your_object",
                        "object_parameter",
                        Map(
                            ["A"],
                            [Map(["c", "d"], [2.3, -2.3], index_name="index 2")],
                            index_name="index 1",
                        ),
                        "Base+Wind__Import_Flex3@2023-01-09T09:01:00",
                    ),
                ),
            )
            self.assertEqual(errors, [])
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.analysis_url,
                    {
                        "type": "value indexes?",
                        "projectId": project.id,
                        "scenarioExecutionIds": [
                            scenario_execution_1.id,
                            scenario_execution_2.id,
                        ],
                        "classes": ["my_class"],
                        "parameters": ["object_parameter"],
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                expected = {
                    "indexes": [
                        {
                            "index_name": "index 1",
                            "indexes": ["A"],
                            "depth": 0,
                            "class_names": ["my_class"],
                            "parameter_names": ["object_parameter"],
                        },
                        {
                            "index_name": "index 2",
                            "indexes": ["a", "b", "c", "d"],
                            "depth": 1,
                            "class_names": ["my_class"],
                            "parameter_names": ["object_parameter"],
                        },
                    ]
                }
                self.assertEqual(content, expected)

    def test_get_parameter_value_indexes_returns_single_record_for_multiple_objects(
        self,
    ):
        with new_project(self.baron) as project:
            scenario = Scenario(project=project, name="Base")
            scenario.save()
            scenario_execution = ScenarioExecution(
                scenario=scenario,
                execution_time=datetime.fromisoformat("2022-06-01T14:14:00+03:00"),
                execution_time_offset=3 * 3600,
                log="",
            )
            scenario_execution.save()
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_RESULT_DATABASE),
                create=True,
            )
            _, errors = import_alternatives(
                db_map, ("Base__Import_Flex3@2022-06-01T14:15:00",)
            )
            self.assertEqual(errors, [])
            _, errors = import_object_classes(db_map, ("my_class",))
            self.assertEqual(errors, [])
            _, errors = import_object_parameters(
                db_map, (("my_class", "object_parameter"),)
            )
            self.assertEqual(errors, [])
            _, errors = import_objects(
                db_map, (("my_class", "my_object"), ("my_class", "another_object"))
            )
            self.assertEqual(errors, [])
            _, errors = import_object_parameter_values(
                db_map,
                (
                    (
                        "my_class",
                        "my_object",
                        "object_parameter",
                        Map(
                            ["A", "B"],
                            [
                                Map(["a", "b"], [2.3, -2.3], index_name="index 2"),
                                Map(["a", "b"], [5.5, -5.5], index_name="index 2"),
                            ],
                            index_name="index 1",
                        ),
                        "Base__Import_Flex3@2022-06-01T14:15:00",
                    ),
                    (
                        "my_class",
                        "another_object",
                        "object_parameter",
                        Map(
                            ["A", "B"],
                            [
                                Map(["a", "b"], [-2.3, 2.3], index_name="index 2"),
                                Map(["a", "b"], [-5.5, 5.5], index_name="index 2"),
                            ],
                            index_name="index 1",
                        ),
                        "Base__Import_Flex3@2022-06-01T14:15:00",
                    ),
                ),
            )
            self.assertEqual(errors, [])
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.analysis_url,
                    {
                        "type": "value indexes?",
                        "projectId": project.id,
                        "scenarioExecutionIds": [scenario_execution.id],
                        "classes": ["my_class"],
                        "parameters": ["object_parameter"],
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                expected = {
                    "indexes": [
                        {
                            "index_name": "index 1",
                            "indexes": ["A", "B"],
                            "depth": 0,
                            "class_names": ["my_class"],
                            "parameter_names": ["object_parameter"],
                        },
                        {
                            "index_name": "index 2",
                            "indexes": ["a", "b"],
                            "depth": 1,
                            "class_names": ["my_class"],
                            "parameter_names": ["object_parameter"],
                        },
                    ]
                }
                self.assertEqual(content, expected)

    def test_get_parameter_value_indexes_returns_single_record_for_multiple_alternatives(
        self,
    ):
        with new_project(self.baron) as project:
            scenario = Scenario(project=project, name="Base")
            scenario.save()
            scenario_execution = ScenarioExecution(
                scenario=scenario,
                execution_time=datetime.fromisoformat("2022-06-01T14:14:00+03:00"),
                execution_time_offset=3 * 3600,
                log="",
            )
            scenario_execution.save()
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_RESULT_DATABASE),
                create=True,
            )
            _, errors = import_alternatives(
                db_map,
                (
                    "Base__Import_Flex3@2022-06-01T14:15:00",
                    "coal__Import_Flex3@2022-06-01T14:15:0s0",
                ),
            )
            self.assertEqual(errors, [])
            _, errors = import_object_classes(db_map, ("my_class",))
            self.assertEqual(errors, [])
            _, errors = import_object_parameters(
                db_map, (("my_class", "object_parameter"),)
            )
            self.assertEqual(errors, [])
            _, errors = import_objects(db_map, (("my_class", "my_object"),))
            self.assertEqual(errors, [])
            _, errors = import_object_parameter_values(
                db_map,
                (
                    (
                        "my_class",
                        "my_object",
                        "object_parameter",
                        Map(
                            ["A", "B"],
                            [
                                Map(["a", "b"], [2.3, -2.3], index_name="index 2"),
                                Map(["a", "b"], [5.5, -5.5], index_name="index 2"),
                            ],
                            index_name="index 1",
                        ),
                        "Base__Import_Flex3@2022-06-01T14:15:00",
                    ),
                    (
                        "my_class",
                        "my_object",
                        "object_parameter",
                        Map(
                            ["A", "B"],
                            [
                                Map(["a", "b"], [-2.3, 2.3], index_name="index 2"),
                                Map(["a", "b"], [-5.5, 5.5], index_name="index 2"),
                            ],
                            index_name="index 1",
                        ),
                        "coal__Import_Flex3@2022-06-01T14:15:0s0",
                    ),
                ),
            )
            self.assertEqual(errors, [])
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.analysis_url,
                    {
                        "type": "value indexes?",
                        "projectId": project.id,
                        "scenarioExecutionIds": [scenario_execution.id],
                        "classes": ["my_class"],
                        "parameters": ["object_parameter"],
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                expected = {
                    "indexes": [
                        {
                            "index_name": "index 1",
                            "indexes": ["A", "B"],
                            "depth": 0,
                            "class_names": ["my_class"],
                            "parameter_names": ["object_parameter"],
                        },
                        {
                            "index_name": "index 2",
                            "indexes": ["a", "b"],
                            "depth": 1,
                            "class_names": ["my_class"],
                            "parameter_names": ["object_parameter"],
                        },
                    ]
                }
                self.assertEqual(content, expected)

    def test_get_parameter_value_indexes_returns_single_record_for_multiple_object_classes(
        self,
    ):
        with new_project(self.baron) as project:
            scenario = Scenario(project=project, name="Base")
            scenario.save()
            scenario_execution = ScenarioExecution(
                scenario=scenario,
                execution_time=datetime.fromisoformat("2022-06-01T14:14:00+03:00"),
                execution_time_offset=3 * 3600,
                log="",
            )
            scenario_execution.save()
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_RESULT_DATABASE),
                create=True,
            )
            _, errors = import_alternatives(
                db_map, ("Base__Import_Flex3@2022-06-01T14:15:00",)
            )
            self.assertEqual(errors, [])
            _, errors = import_object_classes(db_map, ("my_class", "another_class"))
            self.assertEqual(errors, [])
            _, errors = import_object_parameters(
                db_map,
                (
                    ("my_class", "object_parameter"),
                    ("another_class", "object_parameter"),
                ),
            )
            self.assertEqual(errors, [])
            _, errors = import_objects(
                db_map, (("my_class", "my_object"), ("another_class", "my_object"))
            )
            self.assertEqual(errors, [])
            _, errors = import_object_parameter_values(
                db_map,
                (
                    (
                        "my_class",
                        "my_object",
                        "object_parameter",
                        Map(
                            ["A", "B"],
                            [
                                Map(["a", "b"], [2.3, -2.3], index_name="index 2"),
                                Map(["a", "b"], [5.5, -5.5], index_name="index 2"),
                            ],
                            index_name="index 1",
                        ),
                        "Base__Import_Flex3@2022-06-01T14:15:00",
                    ),
                    (
                        "another_class",
                        "my_object",
                        "object_parameter",
                        Map(
                            ["A", "B"],
                            [
                                Map(["a", "b"], [-2.3, 2.3], index_name="index 2"),
                                Map(["a", "b"], [-5.5, 5.5], index_name="index 2"),
                            ],
                            index_name="index 1",
                        ),
                        "Base__Import_Flex3@2022-06-01T14:15:00",
                    ),
                ),
            )
            self.assertEqual(errors, [])
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.analysis_url,
                    {
                        "type": "value indexes?",
                        "projectId": 1,
                        "scenarioExecutionIds": [scenario_execution.id],
                        "classes": ["my_class", "another_class"],
                        "parameters": ["object_parameter"],
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                expected = {
                    "indexes": [
                        {
                            "index_name": "index 1",
                            "indexes": ["A", "B"],
                            "depth": 0,
                            "class_names": ["my_class", "another_class"],
                            "parameter_names": ["object_parameter", "object_parameter"],
                        },
                        {
                            "index_name": "index 2",
                            "indexes": ["a", "b"],
                            "depth": 1,
                            "class_names": ["my_class", "another_class"],
                            "parameter_names": ["object_parameter", "object_parameter"],
                        },
                    ]
                }
                self.assertEqual(content, expected)

    def test_get_parameter_value_indexes_returns_single_record_for_multiple_parameters(
        self,
    ):
        with new_project(self.baron) as project:
            scenario = Scenario(project=project, name="Base")
            scenario.save()
            scenario_execution = ScenarioExecution(
                scenario=scenario,
                execution_time=datetime.fromisoformat("2022-06-01T14:14:00+03:00"),
                execution_time_offset=3 * 3600,
                log="",
            )
            scenario_execution.save()
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_RESULT_DATABASE),
                create=True,
            )
            _, errors = import_alternatives(
                db_map, ("Base__Import_Flex3@2022-06-01T14:15:00",)
            )
            self.assertEqual(errors, [])
            _, errors = import_object_classes(db_map, ("my_class",))
            self.assertEqual(errors, [])
            _, errors = import_object_parameters(
                db_map,
                (("my_class", "object_parameter"), ("my_class", "other_parameter")),
            )
            self.assertEqual(errors, [])
            _, errors = import_objects(db_map, (("my_class", "my_object"),))
            self.assertEqual(errors, [])
            _, errors = import_object_parameter_values(
                db_map,
                (
                    (
                        "my_class",
                        "my_object",
                        "object_parameter",
                        Map(
                            ["A", "B"],
                            [
                                Map(["a", "b"], [2.3, -2.3], index_name="index 2"),
                                Map(["a", "b"], [5.5, -5.5], index_name="index 2"),
                            ],
                            index_name="index 1",
                        ),
                        "Base__Import_Flex3@2022-06-01T14:15:00",
                    ),
                    (
                        "my_class",
                        "my_object",
                        "other_parameter",
                        Map(
                            ["A", "B"],
                            [
                                Map(["a", "b"], [-2.3, 2.3], index_name="index 2"),
                                Map(["a", "b"], [-5.5, 5.5], index_name="index 2"),
                            ],
                            index_name="index 1",
                        ),
                        "Base__Import_Flex3@2022-06-01T14:15:00",
                    ),
                ),
            )
            self.assertEqual(errors, [])
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.analysis_url,
                    {
                        "type": "value indexes?",
                        "projectId": project.id,
                        "scenarioExecutionIds": [scenario_execution.id],
                        "classes": ["my_class"],
                        "parameters": ["object_parameter", "other_parameter"],
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                expected = {
                    "indexes": [
                        {
                            "index_name": "index 1",
                            "indexes": ["A", "B"],
                            "depth": 0,
                            "class_names": ["my_class", "my_class"],
                            "parameter_names": ["object_parameter", "other_parameter"],
                        },
                        {
                            "index_name": "index 2",
                            "indexes": ["a", "b"],
                            "depth": 1,
                            "class_names": ["my_class", "my_class"],
                            "parameter_names": ["object_parameter", "other_parameter"],
                        },
                    ]
                }
                self.assertEqual(content, expected)

    def test_get_parameter_value_indexes_numbers_unknown_index_names(self):
        with new_project(self.baron) as project:
            scenario = Scenario(project=project, name="Base")
            scenario.save()
            scenario_execution = ScenarioExecution(
                scenario=scenario,
                execution_time=datetime.fromisoformat("2022-06-01T14:14:00+03:00"),
                execution_time_offset=3 * 3600,
                log="",
            )
            scenario_execution.save()
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_RESULT_DATABASE),
                create=True,
            )
            _, errors = import_alternatives(
                db_map, ("Base__Import_Flex3@2022-06-01T14:15:00",)
            )
            self.assertEqual(errors, [])
            _, errors = import_object_classes(db_map, ("my_class",))
            self.assertEqual(errors, [])
            _, errors = import_object_parameters(
                db_map, (("my_class", "object_parameter"),)
            )
            self.assertEqual(errors, [])
            _, errors = import_objects(db_map, (("my_class", "my_object"),))
            self.assertEqual(errors, [])
            _, errors = import_object_parameter_values(
                db_map,
                (
                    (
                        "my_class",
                        "my_object",
                        "object_parameter",
                        Map(["A"], [Map(["a"], [2.3])]),
                        "Base__Import_Flex3@2022-06-01T14:15:00",
                    ),
                ),
            )
            self.assertEqual(errors, [])
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.analysis_url,
                    {
                        "type": "value indexes?",
                        "projectId": 1,
                        "scenarioExecutionIds": [scenario_execution.id],
                        "classes": ["my_class"],
                        "parameters": ["object_parameter"],
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                expected = {
                    "indexes": [
                        {
                            "index_name": "x_0",
                            "indexes": ["A"],
                            "depth": 0,
                            "class_names": ["my_class"],
                            "parameter_names": ["object_parameter"],
                        },
                        {
                            "index_name": "x_1",
                            "indexes": ["a"],
                            "depth": 1,
                            "class_names": ["my_class"],
                            "parameter_names": ["object_parameter"],
                        },
                    ]
                }
                self.assertEqual(content, expected)

    def test_get_plot_specification(self):
        test_specification = {"hello": "world"}
        with new_project(self.baron) as project:
            project.plot_specification_path().write_text(
                json.dumps(test_specification), encoding="utf-8"
            )
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.analysis_url,
                    {"type": "plot specification?", "projectId": 1},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(len(content), 1)
                self.assertIn("plot_specification", content)
                self.assertEqual(
                    json.loads(content["plot_specification"]), test_specification
                )

    def test_get_default_plot_specification(self):
        test_specification = {"hello": "world"}
        with new_project(self.baron) as project:
            project.default_plot_specification_path().write_text(
                json.dumps(test_specification), encoding="utf-8"
            )
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.analysis_url,
                    {"type": "plot specification?", "projectId": 1},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(len(content), 1)
                self.assertIn("plot_specification", content)
                self.assertEqual(
                    json.loads(content["plot_specification"]), test_specification
                )

    def test_set_plot_specification(self):
        with new_project(self.baron) as project:
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.analysis_url,
                    {
                        "type": "store plot specification",
                        "projectId": project.id,
                        "specification": {"hello": "world"},
                    },
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(content, {"status": "ok"})
            specification = json.loads(
                project.plot_specification_path().read_text(encoding="utf-8")
            )
            self.assertEqual(specification, {"hello": "world"})


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
        with new_project(self.baron) as project:
            db_map = DatabaseMapping(
                "sqlite:///" + str(Path(project.path) / PATH_TO_INITIALIZATION_DATABASE)
            )
            scenario_names = sorted(s.name for s in db_map.query(db_map.scenario_sq))
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(
                    self.examples_url,
                    {"type": "example list?", "projectId": project.id},
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 200)
                content = json.loads(response.content)
                self.assertEqual(content, {"examples": scenario_names})

    def test_add(self):
        """'examples' view adds requested example to the model database."""
        with new_project(self.baron) as project:
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
            self._assert_values_exist("unit", "is_active", {"coal_plant"}, db_map)
            self._assert_values_exist(
                "node", "is_active", {"coal_market", "west"}, db_map
            )
            self._assert_values_exist(
                "group", "output_results", {"electricity", "to_west_node"}, db_map
            )
            db_map.connection.close()

    def _assert_values_exist(self, object_class, parameter, object_names, db_map):
        subquery = db_map.object_parameter_value_sq
        values = (
            db_map.query(subquery)
            .filter(subquery.c.object_class_name == object_class)
            .filter(subquery.c.parameter_name == parameter)
            .all()
        )
        objects_in_values = {v.object_name for v in values}
        self.assertEqual(objects_in_values, object_names)


def _copy_model_database(project_path):
    """Copies model database from master project to test project.

    Args:
        project_path (Path): path to test project
    """
    source_path = FLEXTOOL_PROJECT_TEMPLATE / PATH_TO_MODEL_DATABASE
    target_path = project_path / PATH_TO_MODEL_DATABASE
    copyfile(source_path, target_path)


def _copy_initialization_database(project_path):
    """Copies initialization database from master project to test project.

    Args:
        project_path (Path): path to test project
    """
    source_path = FLEXTOOL_PROJECT_TEMPLATE / PATH_TO_INITIALIZATION_DATABASE
    target_path = project_path / PATH_TO_INITIALIZATION_DATABASE
    copyfile(source_path, target_path)
