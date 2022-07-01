# FlexTool 3 web interface

This package contains the web interface for FlexTool 3.

## Installation

Currently, the only supported method is installation from the Git repository.
Instructions to install into a conda environment are provided below, though
Python's virtual environment would work equally well.

### Installation in conda environment

Install [Miniconda](https://docs.conda.io/en/latest/miniconda.html) if you don't have conda yet.

1. Open a conda prompt
2. Create a new Python 3.8 environment:
```commandline
conda create -n flextool3-web-interface python=3.8
```
3. Activate the environment:
```commandline
conda activate flextool3-web-interface
```
4. If you don't have Git installed yet, install it in conda:
```commandline
conda install git
```
5. `cd` to a directory where you want the store the application.
6. Clone the repository. You'll need GitLab username and password.
```commandline
git clone --recurse-submodules https://github.com/irena-flextool/flextool-web-interface.git
```
7. `cd` to the newly created directory:
```commandline
cd flextool-web-interface
```
8. Make sure Python's `pip` package is up-to-date:
```commandline
python -mpip install --upgrade pip
```
9. Install Python packages that are required by FlexTool:
```commandline
python -mpip install -r requirements.txt
```
10. Initialize server database and create a (super) user account:
```commandline
python init.py
```

## Upgrade

1. Pull the latest changes:
```commandline
git pull
```

2. Make sure the master project is up-to-date:
```commandline
git submodule update
```

3. Make sure the Python environment and server database are up-to-date:
```commandline
python upgrade.py
```

## Run

1. Start local web server:
```
python manage.py runserver
```
2. Point your browser to ``http://localhost:8000/flextool3/``
3. If asked, log in with the account created in Installation.

## Development

Install `dev-requirements.txt` to get the Python packages needed for development.

[node.js](nodejs.org) and [yarn](yarnpkg.com) package manager are needed to build the browser app.

### Keeping master project up-to-date

The master project template is located in `<repository root>/flextool3/master_project`.
The directory is a [git submodule](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
and can be updated to the latest version by

```commandline
cd flextool3
cd master_project
git checkout master
git pull
cd ..
cd ..
git add -A
git commit
```
