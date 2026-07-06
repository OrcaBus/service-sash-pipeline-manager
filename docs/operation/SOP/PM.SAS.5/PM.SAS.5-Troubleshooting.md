# Troubleshooting

- Version: 1.0
- Contact: Alexis Lucattini, [alexisl@unimelb.edu.au](mailto:alexisl@unimelb.edu.au)

Table of Contents
- [Introduction](#introduction)
- [Common Issues](#common-issues)
  - [DRAFT event not progressing](#draft-event-not-progressing)
  - [Validation failures](#validation-failures)
  - [ICAv2 submission failures](#icav2-submission-failures)
  - [Pipeline execution failures](#pipeline-execution-failures)
- [Debugging Tools](#debugging-tools)


## Introduction

This SOP provides guidance for diagnosing and resolving common issues with the Sash pipeline manager. The Sash pipeline depends on upstream Oncoanalyser WGTS DNA and Dragen WGTS DNA outputs, which adds additional failure points compared to non-downstream pipelines.


## Common Issues

### DRAFT event not progressing

**Symptoms**: A DRAFT workflow run remains in DRAFT status without progressing to READY.

**Possible causes**:

1. **Missing upstream data** — The Sash pipeline requires both Dragen WGTS DNA and Oncoanalyser WGTS DNA SUCCEEDED runs for the same libraries. Check that both upstream runs have completed successfully.

2. **Glue state machine not triggered** — Verify that upstream SUCCEEDED events are being routed to the `glueSucceededEventsToDraftUpdate` state machine. Check EventBridge rules.

3. **populate-draft-data failure** — Check the Step Functions execution history for the `populateDraftData` state machine. Look for Lambda errors or missing SSM parameters.

**Resolution**:
- Check workflow run comments in the OrcaBus Portal for diagnostic messages
- Check Step Functions execution history in the AWS Console
- Verify upstream workflow runs have SUCCEEDED status

### Validation failures

**Symptoms**: DRAFT event is populated but does not progress to READY.

**Possible causes**:

1. **Schema validation failure** — The populated payload does not match the complete-data-draft JSON Schema
2. **Post-schema validation failure** — Business-rule checks failed (e.g. invalid project ID, inaccessible URIs)

**Resolution**:
- Check workflow run comments — validation failures are written as comments
- Validate the payload manually against the [schema](../../../../app/event-schemas/)
- Verify that `projectId` is valid and the pipeline is accessible in that project
- Verify that input URIs (dragenSomaticDir, dragenGermlineDir, oncoanalyserDnaDir) are accessible

### ICAv2 submission failures

**Symptoms**: Workflow reaches READY but does not transition to SUBMITTED/RUNNING.

**Possible causes**:

1. **ICAv2 WES Manager not processing** — Check the ICAv2 WES Manager service
2. **Invalid pipeline ID** — The pipeline ID in engine parameters may not exist in the target project
3. **Ready-to-ICAv2-WES Lambda failure** — Check the `readyEventToIcav2WesRequestEvent` state machine execution

**Resolution**:
- Check the `readyEventToIcav2WesRequestEvent` Step Functions execution
- Verify the pipeline ID is accessible in the target ICAv2 project
- Check ICAv2 WES Manager logs

### Pipeline execution failures

**Symptoms**: Workflow reaches RUNNING but transitions to FAILED.

**Possible causes**:

1. **Input data issues** — Input directories may be empty or contain corrupt files
2. **CWL workflow error** — Bug in the CWL pipeline definition
3. **Resource limits** — ICAv2 compute resource limits exceeded

**Resolution**:
- Check the workflow run comment for the WES failure message
- Review the ICAv2 analysis logs (accessible via the analysis ID in the portal)
- Verify input data integrity at the S3 URIs
- Check ICAv2 project resource availability


## Debugging Tools

| Tool | Usage |
|---|---|
| OrcaBus Portal | View workflow run status, comments, and linked libraries |
| AWS Step Functions Console | View execution history, input/output for each state |
| AWS CloudWatch Logs | Lambda function logs for detailed error messages |
| ICAv2 Console | Analysis status and logs for pipeline execution |
| AWS EventBridge | Event delivery history for troubleshooting routing issues |
