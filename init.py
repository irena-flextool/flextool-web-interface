import os
from pathlib import Path
import sys

print("Checking master project.")
master_project_git_dir = Path(__file__).parent / "flextool3" / "master_project" / ".git"
if not master_project_git_dir.exists():
    print(f"It does not look like {str(master_project_git_dir.parent)} has been set up properly.", file=sys.stderr)
    sys.exit(1)

print("*** Initializing server database ***")
status = os.system(sys.executable + " manage.py makemigrations flextool3")
if status != 0:
    sys.exit(status)
status = os.system(sys.executable + " manage.py migrate")
if status != 0:
    sys.exit(status)
print("")
print("*** Creating new user account ***")
status = os.system(sys.executable + " manage.py createsuperuser")
if status != 0:
    sys.exit(status)
