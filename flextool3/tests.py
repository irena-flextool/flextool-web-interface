import json
from contextlib import contextmanager
from pathlib import Path
from tempfile import TemporaryDirectory
from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from spinedb_api import DatabaseMapping, from_database, import_object_classes, import_object_parameter_values, import_object_parameters, import_objects

from .exception import FlextoolException
from .models import Execution, Project


PATH_TO_MODEL_DATABASE = Path("FlexTool3_data.sqlite")
PATH_TO_RESULT_DATABASE = Path(".spinetoolbox", "items", "results_f3", "Results_F3.sqlite")


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
        yield Path(project.path)


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
            project = Project.create(user, "my_test_project", projects_root, template_dir)
            self.assertEqual(project.user, user)
            self.assertEqual(project.path, str(projects_root / "baron" / "my_test_project"))
            model_database_file = projects_root / "baron" / "my_test_project" / PATH_TO_MODEL_DATABASE
            self.assertTrue(model_database_file.exists())
            result_database_file = projects_root / "baron" / "my_test_project" / PATH_TO_RESULT_DATABASE
            self.assertTrue(result_database_file.exists())

    def test_create_refuses_to_create_duplicate_project_names(self):
        """create() raises an exception if user already has a project under the same name."""
        user = User(username="baron", password="it's a secret")
        user.save()
        with fake_project(user) as existing_project_dir:
            projects_root_dir = existing_project_dir.parent.parent
            template_dir = projects_root_dir.parent / "template"
            self.assertTrue(template_dir.exists())
            self.assertRaises(FlextoolException, Project.create, user, "my_test_project", projects_root_dir, template_dir)

    def test_remove_project_dir(self):
        """remove_project_dir() removes project directory."""
        user = User(username="baron", password="it's a secret")
        user.save()
        with fake_project(user) as existing_project_dir:
            project = Project.objects.get(name="my_test_project")
            project.remove_project_dir()
            self.assertFalse(existing_project_dir.exists())


class ExecutionModelTests(TestCase):
    baron = None
    project = None

    @classmethod
    def setUpTestData(cls):
        cls.baron = User(username="baron", password="")
        cls.baron.set_password("secretbaron")
        cls.baron.save()
        cls.project = Project(user=cls.baron, name="my_test_project", path="/project/dir/")
        cls.project.save()

    def test_collect_logs(self):
        execution = Execution(project=self.project)
        program = "for i in range(1, 4): print(i)"
        arguments = ["-c", program]
        execution.start("python", arguments)
        while execution.append_log():
            pass
        execution.process.wait()
        # Note: This will fail when debugging in PyCharm because of PyCharm's instrumentation magic.
        self.assertEqual(execution.log, "1\n2\n3\n")
        self.assertLessEqual(execution.execution_time, timezone.now())


class AMAInterfaceTests(TestCase):
    baron = None
    ama_url = reverse("flextool3:ama")

    @classmethod
    def setUpTestData(cls):
        cls.baron = User(username="baron", password="")
        cls.baron.set_password("secretbaron")
        cls.baron.save()

    def test_ask_for_empty_project_list(self):
        """'ama' view responds to 'project list?' post properly even when there are no projects in the database."""
        with login_as_baron(self.client) as login_successful:
            self.assertTrue(login_successful)
            response = self.client.post(self.ama_url, {"type": "project list?"}, content_type="application/json")
            self.assertEqual(response.status_code, 200)
            project_list_dict = json.loads(response.content)
            self.assertEqual(project_list_dict, {"type": "project list", "projects": []})

    def test_ask_for_populated_project_list(self):
        """'ama' view responds to 'project list?' post properly with a list of user's projects."""
        with fake_project(self.baron):
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(self.ama_url, {"type": "project list?"}, content_type="application/json")
                self.assertEqual(response.status_code, 200)
                project_list_dict = json.loads(response.content)
                self.assertEqual(project_list_dict, {"type": "project list", "projects": [{"id": 1, "name": "my_test_project", "url": "/flextool3/1/"}]})

    def test_delete_project(self):
        """'ama' view deletes the requested project."""
        with fake_project(self.baron) as project_dir:
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(self.ama_url, {"type": "destroy project?", "name": "my_test_project"}, content_type="application/json")
                self.assertEqual(response.status_code, 200)
                destroy_project_dict = json.loads(response.content)
                self.assertEqual(destroy_project_dict, {"type": "destroy project", "name": "my_test_project", "id": 1})
                self.assertFalse(Project.objects.all())
                self.assertFalse(project_dir.exists())


class ModelInterfaceTests(TestCase):
    baron = None
    model_url = reverse("flextool3:model")

    @classmethod
    def setUpTestData(cls):
        cls.baron = User(username="baron", password="")
        cls.baron.set_password("secretbaron")
        cls.baron.save()

    def test_get_emtpy_object_classes(self):
        """'model' view responds correctly even when there are not object classes in the database."""
        with fake_project(self.baron) as project_dir:
            db_map = DatabaseMapping("sqlite:///" + str(project_dir / PATH_TO_MODEL_DATABASE), create=True)
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(self.model_url, {"type": "object classes?", "projectId": 1}, content_type="application/json")
                self.assertEqual(response.status_code, 200)
                destroy_project_dict = json.loads(response.content)
                self.assertEqual(destroy_project_dict, {"type": "object classes", "classes": []})

    def test_get_single_object_class(self):
        """'model' view responds with a dict containing object class name keyed by its id."""
        with fake_project(self.baron) as project_dir:
            db_map = DatabaseMapping("sqlite:///" + str(project_dir / PATH_TO_MODEL_DATABASE), create=True)
            import_object_classes(db_map, ("my_class",))
            db_map.commit_session("Add test data.")
            db_map.connection.close()
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(self.model_url, {"type": "object classes?", "projectId": 1}, content_type="application/json")
                self.assertEqual(response.status_code, 200)
                destroy_project_dict = json.loads(response.content)
                self.assertEqual(destroy_project_dict, {"type": "object classes", "classes": [{"commit_id": 2, "description": None, "display_icon": None, "display_order": 99, "hidden": 0, "id": 1, "name":"my_class"}]})

    def test_update_parameter_value(self):
        """'model' view updates a parameter value and responds with OK status."""
        with fake_project(self.baron) as project_dir:
            db_map = DatabaseMapping("sqlite:///" + str(project_dir / PATH_TO_MODEL_DATABASE), create=True)
            import_object_classes(db_map, ("my_class",))
            import_object_parameters(db_map, (("my_class", "my_parameter"),))
            import_objects(db_map, (("my_class", "my_object"),))
            import_object_parameter_values(db_map, (("my_class", "my_object", "my_parameter", 2.3),))
            db_map.commit_session("Add test data.")
            with login_as_baron(self.client) as login_successful:
                self.assertTrue(login_successful)
                response = self.client.post(self.model_url, {"type": "update values", "projectId": 1, "updates": [{"id": 1, "value": -5.5}]}, content_type="application/json")
                self.assertEqual(response.status_code, 200)
                destroy_project_dict = json.loads(response.content)
                self.assertEqual(destroy_project_dict, {"type": "values updated", "status": "ok"})
            parameter_values = db_map.query(db_map.object_parameter_value_sq).all()
            self.assertEqual(len(parameter_values), 1)
            self.assertEqual(from_database(parameter_values[0].value), -5.5)
            db_map.connection.close()
