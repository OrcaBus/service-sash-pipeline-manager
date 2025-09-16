#!/usr/bin/env python3

"""
1 Get the latest succeeded workflow for a given library id
2 Get the BAM file from that workflow
"""

# Standard imports
from typing import Optional, Literal, List
from pathlib import Path

# Layer imports
from orcabus_api_tools.filemanager import get_file_manager_request_response_results
from orcabus_api_tools.filemanager.models import FileObject

# Globals
DRAGEN_WGTS_DNA_WORKFLOW_RUN_NAME = "dragen-wgts-dna"
Phenotype = Literal["TUMOR", "NORMAL"]
PHENOTYPE_LIST: List[Phenotype] = ["TUMOR", "NORMAL"]


def get_redux_bam_from_oncoanalyser_workflow(portal_run_id: str) -> Optional[FileObject]:
    bam_file: FileObject = next(filter(
        lambda file_iter: file_iter['key'].endswith("redux.bam"),
        get_file_manager_request_response_results(
            endpoint="api/v1/s3/attributes",
            params={
                "portalRunId": portal_run_id,
            }
        )
    ))

    return bam_file


def handler(event, context):
    """
    Given a portal run id, get the output directory for the oncoanalyser workflow
    :param event:
    :param context:
    :return:
    """
    # Get the library ids from the event
    portal_run_id = event.get('portalRunId', None)
    bam_file_obj = get_redux_bam_from_oncoanalyser_workflow(portal_run_id)

    # Stored under output_dir/alignments/dna/redux.bam
    # So we need to go up three levels to get the output_dir/
    output_dir = f"s3://{bam_file_obj['bucket']}/{str(Path(bam_file_obj['key']).parent.parent.parent)}/"

    return {
        "oncoanalyserDnaDir": output_dir
    }
