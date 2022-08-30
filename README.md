# FlexTool 3 web interface

This package contains the web interface for [FlexTool 3](https://github.com/irena-flextool/flextool),
an energy systems optimization model for power and energy systems
with high shares of wind and solar power.
A web server and a browser are needed to use the interface.
If you already have a server running somewhere,
just point your browser there and you are good to go.
However, it is also possible to run the server and use the interface on a local installation.
The instructions below guide through the process to do just that.

A link to the Flextool [User Guide](https://irena-flextool.github.io/flextool/)
is available in the top right corner of the interface, next to the Logout button.

## Installation

Currently, the only supported method is installation from the Git repository.
Instructions to install into a conda environment are provided below, though
Python's virtual environment would work equally well.

### Installation in conda environment

Install [Miniconda](https://docs.conda.io/en/latest/miniconda.html) if you don't have conda yet.

1. Open a conda prompt.
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
6. Clone the repository. This will create a new directory `flextool-web-interface`.
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
10. Initialize server database and create a (super) user account
    (the password need not be secure/complicated on local server
    and warnings regarding it can be safely ignored):
    ```commandline
    python init.py
    ```

## Run

1. Open a conda prompt.
2. Activate the `flextool3-web-interface` environment:
   ```commandline
   conda activate flextool3-web-interface
   ```
3. `cd` to the `flextool-web-interface` directory that was set up during installation.
4. Start local web server:
   ```commandline
   python manage.py runserver
   ```
   The server will continue to run and log on the prompt
   until it is stopped by the user.
5. Point your browser to ``http://localhost:8000/flextool3/``.
6. If asked, log in with the account created in Installation.

## Stop

1. Press **Ctrl+C** in the conda prompt where the server is running
   or just close the window.

## Upgrade

1. Open a conda prompt.
2. Activate the `flextool3-web-interface` environment:
   ```commandline
   conda activate flextool3-web-interface
   ```
3. `cd` to the `flextool-web-interface` directory that was set up during installation.
4. Pull the latest changes:
   ```commandline
   git pull
   ```
6. Make sure the Python environment and server database are up-to-date:
   ```commandline
   python upgrade.py
   ```

## Development

Install `dev-requirements.txt` to get the Python packages needed for development.

[node.js](https://nodejs.org/en/) and [yarn](https://yarnpkg.com/) package manager
are needed to build the browser app.

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
