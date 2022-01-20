# Flextool 3 web interface

This package contains the web interface for Flextool 3.

## Setup

1. Create a ``flextool3/site.py`` file which contains local directory information:
```python
from pathlib import Path

FLEXTOOL_PROJECT_TEMPLATE = Path(r"<path to Flextool's Toolbox project template>")
FLEXTOOL_PROJECTS_ROOT = Path(r"<path where to store projects>")
SPINE_TOOLBOX_PYTHON = Path(r"<path to the Python executable of Spine Toolbox' Python environment>")
```
2. Create local server database by running the following commands in project root:
```
python manage.py makemigrations flextool3
```
```
python manage.py migrate
```
3. Create an (administrator) account:
```
python manage.py createsuperuser
```

## Run

1. Start local web server:
```
python manage.py runserve
```
2. Point your browser to ``http://localhost:8000/flextool3/``
3. If asked, log in with the credentials created in Setup.

## Frontend development

[node.js](nodejs.org) and [yarn](yarnpkg.com) package manager are needed to build the browser app.
