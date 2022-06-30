def save_model_database_file(source, project):
    with open(project.model_database_path(), "wb+") as destination:
        for chunk in source.chunks():
            destination.write(chunk)
