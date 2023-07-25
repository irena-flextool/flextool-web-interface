data_connection = project.find_item("Excel_input_data")
data_connection["file_references"] = [
    {{"type": "path", "relative": True, "path": "{file_name}"}}
]
importer = project.find_item("Import_from_Excel")
importer["file_selection"] = [["<project>/{file_name}", True]]
