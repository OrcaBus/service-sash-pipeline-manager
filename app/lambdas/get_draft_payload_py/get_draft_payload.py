#!/usr/bin/env python3

"""
Get the latest version of the draft payload

If genomes.GRCh38Umccr is a key, we switch it to genomes.GRCh38_umccr

Given a portal run id

"""
# Standard imports
from typing import Dict
from requests import HTTPError

# Local imports
from orcabus_api_tools.workflow import get_latest_payload_from_portal_run_id
from orcabus_api_tools.workflow.models import Payload


def handler(event, context):
    """
    Get the latest payload from the portal run id
    :param event:
    :param context:
    :return:
    """
    portal_run_id = event['portalRunId']

    try:
        payload: Payload = get_latest_payload_from_portal_run_id(portal_run_id)
    except HTTPError as e:
        return {
            "payload": {},
        }

    # Make a copy and convert to dict type
    payload: Dict = payload.copy()

    # Strip orcabusId and the payload ref id from the payload
    if "orcabusId" in payload:
        del payload['orcabusId']

    # Strip the payload ref id
    if "payloadRefId" in payload:
        del payload['payloadRefId']

    return {
        "payload": payload
    }
