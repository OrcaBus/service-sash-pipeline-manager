Manual Pipeline Execution
================================================================================
- Version: 1.0
- Contact: Alexis Lucattini, [alexisl@unimelb.edu.au](mailto:alexisl@unimelb.edu.au)

Table of Contents
- [Introduction](#introduction)
- [Requirements](#requirements)
- [Procedure](#procedure)
- [Confirmation](#confirmation)


Introduction
--------------------------------------------------------------------------------

This Pipeline Manager manages the execution of the Sash pipeline. Here we describe the SOP for manual execution of the pipeline.

Requirements
--------------------------------------------------------------------------------

- appropriate AWS permissions
- AWS credentials set up in the local environment
- tools installed
  - AWS CLI
  - JQ


Procedure
--------------------------------------------------------------------------------

To initiate a pipeline execution we need to generate an initial DRAFT event. For more details consult the main [README](../../../../README.md).
For convenience we provide a shell script that generates and optionally submits an appropriate event.

- familiarise yourself with the script: [generate-WRU-draft.sh](./generate-WRU-draft.sh)
  - you may run the script with `bash generate-WRU-draft.sh -h` to see the available options
- execute the script (e.g. `bash generate-WRU-draft.sh`)
  - Ensure you use `-d` or `--dryrun` flag for the initial run to check the generated DRAFT event looks correct.
  - Ensure you have added the correct library ids as positional arguments to the script.
  - Note: AWS credentials need to set on the environment.
- the script should produce the JSON output of the DRAFT event. This should be used to ensure it reflects the intended request
  - take note of the generated `workflowRunName` or `portalRunId`
- if the DRAFT event is correct, update the `DRYRUN` variable to `false` and run the script again
- the script will now submit the DRAFT event and it should complete successfully


Confirmation
--------------------------------------------------------------------------------

The OrcaBus [Portal](https://portal.umccr.org/) can be used to check whether the event resulted in a WorkflowRun record.

- navigate to the Portal's WorkflowRun listing: https://portal.umccr.org/runs/workflow
- search for your WorkflowRun using the `workflowRunName` or `portalRunId`
- confirm that the WorkflowRun is listed and progressing as expected (check over time)
- once the WorkflowRun as `SUCCEEDED` the results should be available via the Portal's [Files](https://portal.umccr.org/files) view
  - simply filter by the `portalRunId`
