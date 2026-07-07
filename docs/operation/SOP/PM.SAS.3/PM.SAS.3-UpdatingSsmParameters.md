# Updating SSM Parameters

- Version: 1.0
- Contact: Alexis Lucattini, [alexisl@unimelb.edu.au](mailto:alexisl@unimelb.edu.au)

Table of Contents
- [Introduction](#introduction)
- [Constants File Update](#constants-file-update)
- [Draft Event Schema](#draft-event-schema)
- [Lambda Parameter Mapping](#lambda-parameter-mapping)
- [Testing](#testing)


## Introduction

From time-to-time there may be a requirement to add or update SSM pipeline parameters for the Sash pipeline. This SOP describes how to modify SSM parameters that control pipeline behaviour (project IDs, output prefixes, reference data paths, workflow versions, etc.).

The pipeline parameters are defined as constants in the infrastructure code and deployed as SSM parameters via CDK.


## Constants File Update

To update pipeline parameters, edit the [infrastructure constants file](../../../../infrastructure/stage/constants.ts).

Common parameters you may need to update:

- `DEFAULT_WORKFLOW_VERSION` — the default sash workflow version
- `DEFAULT_PAYLOAD_VERSION` — the default payload schema version
- `WORKFLOW_VERSION_TO_DEFAULT_ICAV2_PIPELINE_ID_MAP` — pipeline ID for each workflow version
- `DEFAULT_WORKFLOW_INPUTS_BY_VERSION_MAP` — default inputs per workflow version
- Reference data paths

After modifying constants, create a PR and merge. CodePipeline will deploy the updated SSM parameters to all environments.

## Draft Event Schema

If you are adding or removing input parameters, you may need to update the [DRAFT event schema](../../../../app/event-schemas/) to reflect these changes. This ensures that the input validation for the DRAFT payload is accurate and up-to-date.


## Lambda Parameter Mapping

If you are adding or removing pipeline inputs, you will need to update the mapping logic in the ready-to-ICAv2-WES-request Lambda to ensure that the DRAFT payload inputs are correctly mapped to the ICAv2 pipeline parameters.

See: [`app/lambdas/convert_ready_event_inputs_to_icav2_wes_event_inputs_py/`](../../../../app/lambdas/convert_ready_event_inputs_to_icav2_wes_event_inputs_py/)


## Testing

1. Deploy your changes to development by updating the infrastructure through CodePipeline
2. Follow the [Manual Pipeline Execution SOP](../PM.SAS.1/PM.SAS.1-ManualPipelineExecution.md) to verify changes are working
3. Run the [Workflow Validations SOP](../PM.SAS.4/PM.SAS.4-RunningWorkflowValidations.md) for comprehensive testing
