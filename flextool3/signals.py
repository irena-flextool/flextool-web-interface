from shutil import rmtree
from django.dispatch import receiver
from django.db.models.signals import pre_delete

from flextool3.models import ScenarioExecution
from flextool3.utils import database_map, Database


@receiver(pre_delete, sender=ScenarioExecution)
def delete_result_data(sender, **kwargs):
    """Deletes Tool output files and result records from the results database.

    Args:
        sender (type): ``ScenarioExecution`` model class
        **kwargs (): signal arguments
    """
    scenario_execution = kwargs["instance"]
    summary_path = scenario_execution.summary_path()
    if summary_path is not None:
        tool_output_path = summary_path.parent.parent
        rmtree(tool_output_path)
    alternative_id = scenario_execution.results_alternative_id()
    if alternative_id is not None:
        with database_map(scenario_execution.scenario.project, Database.RESULT) as db_map:
            db_map.cascade_remove_items(alternative={alternative_id})
            db_map.commit_session(
                f"Deleted results for scenario '{scenario_execution.scenario.name}'"
                + f" run on {scenario_execution.execution_time}."
            )
