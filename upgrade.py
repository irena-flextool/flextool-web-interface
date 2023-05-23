import os
import pathlib
import shutil
import sys

print("*** Upgrading Python environment ***")
status = os.system(sys.executable + " -mpip install --upgrade -r requirements.txt")
if status != 0:
    sys.exit(status)
print("*** Migrating server database ***")
status = os.system(sys.executable + " manage.py makemigrations flextool3")
if status != 0:
    sys.exit(status)
status = os.system(sys.executable + " manage.py migrate")
if status != 0:
    sys.exit(status)
print("*** Upgrading master project ***")
status = os.system("git submodule update")
if status != 0:
    sys.exit(status)
print("*** Collecting static files ***")
static_dir = pathlib.Path(__file__).parent / "static"
if static_dir.exists():
    shutil.rmtree(static_dir)
static_dir.mkdir(exist_ok=True)
status = os.system(sys.executable + " manage.py collectstatic")
if status != 0:
    sys.exit(status)
