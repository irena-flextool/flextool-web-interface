# Flextool 3 web interface

This package contains the web interface for Flextool 3.

## Setup

1. Create a ``flextool3/site.py`` file which contains information required to run Spine Toolbox locally:
```python
from pathlib import Path

SPINE_TOOLBOX_PYTHON = Path(r"<path to the Python executable of Spine Toolbox' Python environment>")
```
2. Initialize server database and create a (super) user account:
```
python init.py
```

## Run

1. Start local web server:
```
python manage.py runserver
```
2. Point your browser to ``http://localhost:8000/flextool3/``
3. If asked, log in with the account created in Setup.

## Development

Install `dev-requirements.txt` to get the Python packages needed for development.

[node.js](nodejs.org) and [yarn](yarnpkg.com) package manager are needed to build the browser app.
