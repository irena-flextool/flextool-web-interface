from spinedb_api import DatabaseMapping
from spinedb_api.filters.scenario_filter import SCENARIO_FILTER_TYPE
from spinedb_api.filters.tool_filter import TOOL_FILTER_TYPE
connection = project.find_connection("Import_results", "Results")
connection.options["purge_before_writing"] = False
db_path = project.project_dir / "Input_data.sqlite"
db_url = "sqlite:///" + str(db_path)
db_map = DatabaseMapping(db_url)
active_scenarios = {{{scenarios}}}
try:
    connection = project.find_connection("Input_data", "Export_to_CSV")
    available_scenarios = [r.name for r in db_map.query(db_map.scenario_sq)]
    for name in available_scenarios:
        enabled = name in active_scenarios
        connection.set_filter_enabled("db_url@Input_data", SCENARIO_FILTER_TYPE, name, enabled)
    available_tools = [r.name for r in db_map.query(db_map.tool_sq)]
    for name in available_tools:
        enabled = name == "FlexTool3"
        connection.set_filter_enabled("db_url@Input_data", TOOL_FILTER_TYPE, name, enabled)
finally:
    db_map.connection.close()
