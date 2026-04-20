Manual Pipeline Execution
================================================================================
- Version: 2026.04.20
- Contact: Alexis Lucattini, [alexisl@unimelb.edu.au](mailto:alexisl@unimelb.edu.au)

Table of Contents
- [Introduction](#introduction)
- [Requirements](#requirements)
- [Procedure](#procedure)
- [Pre-populating draft data](#pre-populating-draft-data)
- [Confirmation](#confirmation)


Introduction
--------------------------------------------------------------------------------

This Pipeline Manager manages the execution of the Sash pipeline.
Here we describe the SOP for manual execution of the pipeline.

Requirements
--------------------------------------------------------------------------------

- Appropriate AWS permissions, this should be an operator level permissions for one of umccr-dev/stg/prod
- AWS credentials set up in the local environment
- Access to the OrcaBus Portal (i.e. a PORTAL_TOKEN set in the environment)
- Tools installed
  - [bash](https://www.gnu.org/software/bash/manual/bash.html) version 4 or higher
  - [aws](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) version 2 or higher
  - [jq](https://github.com/jqlang/jq) version 1.7 or higher
  - [curl](https://curl.se/download.html) version 7.76.0 or higher
  - [semver](https://github.com/fsaintjacques/semver-tool)



Procedure
--------------------------------------------------------------------------------

To initiate a pipeline execution we need to generate an initial DRAFT event. For more details consult the main [README](../../../../README.md).
For convenience, we provide a shell script that generates and optionally submits an appropriate event.

- Familiarise yourself with the script and its parameters: [generate-WRU-draft.sh --help](./generate-WRU-draft.sh)
  - Especially check the settings in the `Globals` section
    - ensure the values are fit for your use case, e.g. for clinical samples match the accredited pipeline details
  - Set the engine parameters (if necessary) and library id(s) in the positional arguments.
- Execute the script (e.g. `bash generate-WRU-draft.sh --comment 'Manual rerun' <your_tn_library_id> <your_normal_library_id>`)
  - Note: AWS credentials need to be set on the environment as does your PORTAL_TOKEN (see the script for details)
  - Use the comment parameter to explain the reason for the manual run, this will be visible in the Portal and helpful for future reference.
- The script should produce the JSON output of the DRAFT event that can be inspected to double check that reflects the intended request
  - Take note of the generated `workflowRunName` or `portalRunId` and the URL to the OrcaBus Portal view of the workflow.
  - You can have the script save the output json file by using the `--save-draft-payload` method.


Pre-populating draft data
--------------------------------------------------------------------------------

> **Dev environment note:** Libraries analysed in dev that originate from prod upstream
> runs (dragen, oncoanalyser) will typically have no fastq sets registered in the dev
> metadata service. This is expected - the raw sequencing data does not exist in dev,
> only the derived analysis outputs. This causes `populateDraftData` to fail with:
> ```
> ValueError: Expected exactly one current fastq set for library <id>, found 0
> ```
> The pattern described below is the standard approach for this scenario.

In some cases `populateDraftData` cannot complete - for example when libraries have no
current fastq set registered in the metadata service (common when restarting in dev
from upstream runs that were produced in prod).

`populateDraftData` validates the incoming payload first: if it already satisfies the
[complete-data-draft-schema.json](../../../../app/event-schemas/complete-data-draft-schema.json)
(`tags` + `inputs` + `engineParameters`), it exits immediately without performing any
lookups. The recommended approach is to provide `tags`, `inputs`, and the ICA identifiers
(`projectId` + `pipelineId`) via `--input-data`, and let the script generate the URI fields
via the prefix flags. The script merges both, producing a complete payload without requiring
a pre-generated portalRunId.

**Steps:**

1. Build an `input_data.json` with `tags`, `inputs`, and the ICA identifiers:
   ```json
   {
     "tags": {
       "libraryId": "<normal_library_id>",
       "subjectId": "<subject_id>",
       "individualId": "<individual_id>",
       "fastqRgidList": [],
       "tumorLibraryId": "<tumor_library_id>",
       "tumorFastqRgidList": []
     },
     "inputs": {
       "groupId": "<tumor>__<normal>",
       "subjectId": "<tumor>__<normal>",
       "tumorDnaSampleId": "<tumor_library_id>",
       "normalDnaSampleId": "<normal_library_id>",
       "dragenSomaticDir": "s3://...",
       "dragenGermlineDir": "s3://...",
       "oncoanalyserDnaDir": "s3://...",
       "refDataPath": "s3://reference-data-.../refdata/sash/<version>/"
     },
     "engineParameters": {
       "projectId": "<icav2_project_id>",
       "pipelineId": "<icav2_pipeline_id>"
     }
   }
   ```

2. Run the script with prefix flags - the script auto-generates the portalRunId and builds the full URIs:
   ```bash
   bash generate-WRU-draft.sh <tumor_library_id> <normal_library_id> \
     --comment 'Restart in dev - pre-populated inputs' \
     --input-data input_data.json \
     --output-uri-prefix s3://.../analysis/sash/ \
     --logs-uri-prefix s3://.../logs/sash/ \
     --cache-uri-prefix s3://.../cache/sash/ \
     --workflow-version <version> \
     --code-version <code_version>
   ```


Confirmation
--------------------------------------------------------------------------------

The OrcaBus [Portal](https://portal.umccr.org/) can be used to check whether the event resulted in a WorkflowRun DRAFT record.
