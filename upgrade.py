import os
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
