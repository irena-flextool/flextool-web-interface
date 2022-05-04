import os
import sys

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
