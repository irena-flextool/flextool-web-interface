"""Utilities and helpers for the import model database interface."""


def save_model_database_file(source, project):
    """Overwrites project's model database file.

    Args:
        source (UploadedFile): file content source
        project (Project): project
    """
    with open(project.model_database_path(), "wb+") as destination:
        for chunk in source.chunks():
            destination.write(chunk)
