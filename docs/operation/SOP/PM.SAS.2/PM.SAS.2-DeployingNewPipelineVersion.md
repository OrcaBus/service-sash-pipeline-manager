# Deploying a New Sash Pipeline Version

- Version: 1.0
- Contact: Alexis Lucattini, [alexisl@unimelb.edu.au](mailto:alexisl@unimelb.edu.au)

Table of Contents
- [Introduction](#introduction)
- [Requirements](#requirements)
- [Development Deployment](#development-deployment)
  - [CWL ZIP](#cwl-zip)
  - [Pipeline Creation](#pipeline-creation)
  - [Running the Pipeline](#running-the-pipeline)
  - [Pipeline Update](#pipeline-update)
- [Production Deployment](#production-deployment)
  - [GitHub Releases](#github-releases)
  - [Infrastructure Constants Updates](#infrastructure-constants-updates)
  - [Workflow Manager Updates](#workflow-manager-updates)


## Introduction

This SOP covers how to deploy a new version of the Sash pipeline to ICAv2. The Sash pipeline depends on upstream Oncoanalyser WGTS DNA and Dragen WGTS DNA outputs; ensure those pipelines are already deployed and validated before deploying a new Sash version.

## Requirements

- Access to the [cwl-ica repository](https://github.com/umccr/cwl-ica) with CWL knowledge
- ICAv2 CLI tools installed ([ICAv2 CLI](https://help.ica.illumina.com/command-line-interface/cli-installation), [ICAv2 CLI Plugins](https://github.com/umccr/icav2-cli-plugins/wiki))
- AWS access to the appropriate accounts
- Contributor level permissions in the target ICAv2 project


## Development Deployment

### CWL ZIP

Package the CWL workflow into a ZIP file:

```shell
cwl-ica icav2-zip-workflow \
  --workflow-path workflows/sash-pipeline/<version>/sash-pipeline__<version>.cwl \
  --force
```

### Pipeline Creation

Enter the appropriate ICAv2 project and create the pipeline:

```shell
icav2 projects enter development

icav2 projectpipelines create-cwl-pipeline-from-zip \
  sash-pipeline__<version>.zip
```

Keep note of the pipeline ID — you will need it for subsequent steps.

### Running the Pipeline

Test the pipeline by submitting a manual DRAFT event. See [PM.SAS.1](../PM.SAS.1/PM.SAS.1-ManualPipelineExecution.md) for instructions.

You will need to include the `pipelineId` engine parameter override:

```json
{
  "payload": {
    "version": "<PAYLOAD_VERSION>",
    "data": {
      "engineParameters": {
        "pipelineId": "<THE_PIPELINE_ID>"
      }
    }
  }
}
```

### Pipeline Update

If the pipeline did not work correctly:

1. Fix the CWL code
2. Re-zip using the `cwl-ica icav2-zip-workflow` command
3. Update the pipeline in ICAv2:
   ```shell
   icav2 projectpipelines update sash-pipeline__<version>.zip <pipeline_id>
   ```
4. Re-run the pipeline


## Production Deployment

### GitHub Releases

Once validated in development:

1. Push your CWL changes to a branch, get PR reviewed and merged
2. Create a release:
   ```shell
   cwl-ica workflow-release \
     --workflow-path workflows/sash-pipeline/<version>/sash-pipeline__<version>.cwl
   ```

### Infrastructure Constants Updates

Update the `WORKFLOW_VERSION_TO_DEFAULT_ICAV2_PIPELINE_ID_MAP` in [`infrastructure/stage/constants.ts`](../../../../infrastructure/stage/constants.ts):

```typescript
export const WORKFLOW_VERSION_TO_DEFAULT_ICAV2_PIPELINE_ID_MAP: Record<
  WorkflowVersionType,
  string
> = {
  '<version>': '<PIPELINE_ID>',
};
```

Create a PR and merge once approved. CodePipeline will deploy to beta/gamma/prod.

### Workflow Manager Updates

Register the new workflow version with the Workflow Manager:

```shell
make-new-workflow.sh \
  --workflow-name 'sash' \
  --workflow-version "<version>" \
  --executionEngine "ICA" \
  --executionEnginePipelineId "<PIPELINE_ID>" \
  --codeVersion "$(cd <cwl-ica-repo> && git rev-parse --short=7 HEAD)" \
  --validationState "VALIDATED"
```
