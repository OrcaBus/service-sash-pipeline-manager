#!/usr/bin/env python3

"""
Generate a WRU event object with merged data
"""
from typing import Optional

# Layer imports
from orcabus_api_tools.workflow import (
    get_workflow_run_from_portal_run_id
)


def handler(event, context):
    """
    Generate WRU event object with merged data
    :param event:
    :param context:
    :return:
    """

    # Get the event inputs
    portal_run_id = event.get("portalRunId", None)
    libraries = event.get("libraries", None)
    sash_payload = event.get("payload", None)
    upstream_data = event.get("upstreamData", {})

    # Get the dragen draft workflow run object
    dragen_germline_dir: Optional[str] = upstream_data.get('dragenGermlineDir', None)
    dragen_somatic_dir: Optional[str] = upstream_data.get('dragenSomaticDir', None)
    oncoanalyser_dna_dir: Optional[str] = upstream_data.get('oncoanalyserDnaDir', None)

    # Create a copy of the oncoanalyser draft workflow run object to update
    sash_draft_workflow_run = get_workflow_run_from_portal_run_id(
        portal_run_id=portal_run_id
    )
    # Make a copy
    sash_draft_workflow_update = sash_draft_workflow_run.copy()

    # Remove 'currentState' and replace with 'status'
    sash_draft_workflow_update['status'] = sash_draft_workflow_update.pop('currentState')['status']

    # Add in the libraries if provided
    if libraries is not None:
        sash_draft_workflow_update["libraries"] = list(map(
            lambda library_iter: {
                "libraryId": library_iter['libraryId'],
                "orcabusId": library_iter['orcabusId'],
                "readsets": library_iter.get('readsets', [])
            },
            libraries
        ))

    # First check if the oncoanalyser draft workflow object has the fields we would update with the

    # Generate a workflow run update object with the merged data
    if (
            (
                    sash_payload['data'].get("inputs", {}).get("dragenGermlineDir", None) is not None or
                    sash_payload['data'].get("inputs", {}).get("dragenSomaticDir", None) is not None
            ) and
            (
                    sash_payload['data'].get("inputs", {}).get("oncoanalyserDnaDir", None) is not None
            )
    ):
        # Return the OG, we dont want to overwrite existing data
        sash_draft_workflow_update["payload"] = {
            "version": sash_payload['version'],
            "data": sash_payload['data']
        }
        return {
            "workflowRunUpdate": sash_draft_workflow_update
        }

    # Merge the data from the dragen draft payload into the oncoanalyser draft payload
    new_data_object = sash_payload['data'].copy()
    if new_data_object.get("inputs", None) is None:
        new_data_object["inputs"] = {}

    if (
            (
                    dragen_germline_dir is not None and
                    dragen_somatic_dir is not None
            ) and
            (
                    sash_payload['data'].get("inputs", {}).get("dragenGermlineDir", None) is None and
                    sash_payload['data'].get("inputs", {}).get("dragenSomaticDir", None) is None
            )
    ):
        new_data_object["inputs"]["dragenGermlineDir"] = dragen_germline_dir
        new_data_object["inputs"]["dragenSomaticDir"] = dragen_somatic_dir

    if (
            oncoanalyser_dna_dir is not None and
            sash_payload['data'].get("inputs", {}).get("oncoanalyserDnaDir", None) is None
    ):
        new_data_object["inputs"]["oncoanalyserDnaDir"] = oncoanalyser_dna_dir

    # Update the inputs with the dragen draft payload data
    sash_draft_workflow_update["payload"] = {
        "version": sash_payload['version'],
        "data": new_data_object
    }

    return {
        "workflowRunUpdate": sash_draft_workflow_update
    }
