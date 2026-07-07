# Deploying a New Sash Pipeline Version

- Version: 1.0
- Contact: Alexis Lucattini, [alexisl@unimelb.edu.au](mailto:alexisl@unimelb.edu.au)

Table of Contents
- [Introduction](#introduction)
- [Requirements](#requirements)
- [Development Deployment](#development-deployment)
  - [Pipeline Creation](#pipeline-creation)
  - [Running the Pipeline](#running-the-pipeline)
  - [Pipeline Update](#pipeline-update)
- [Production Deployment](#production-deployment)
  - [GitHub Releases](#github-releases)
  - [Infrastructure Constants Updates](#infrastructure-constants-updates)
  - [Workflow Manager Updates](#workflow-manager-updates)


## Introduction

This SOP covers how to deploy a new version of the Sash pipeline to ICAv2.

## Requirements

- Access to the [sash repository](https://github.com/umccr/sash) with nextflow knowledge
- ICAv2 CLI tools installed ([ICAv2 CLI](https://help.ica.illumina.com/command-line-interface/cli-installation), [ICAv2 CLI Plugins](https://github.com/umccr/icav2-cli-plugins/wiki))
- AWS access to the appropriate accounts
- Contributor level permissions in the target ICAv2 project

## Development Deployment

### Pipeline Creation

1. Clone the [sash GitHub repository][sash_github_repo] for the pipeline you wish to deploy.
2. Package the cloned directory into a ZIP file for deployment into ICA.
3. Deploy into the development ICAv2 project:
   ```shell
   icav2 projects enter development
   icav2 projectpipelines create-nextflow-pipeline-from-zip <workflow-zip>
   ```
4. Keep note of the pipeline ID.


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

## Production Deployment

### Pipeline linking

We can link pipelines from one project to another.

```bash
icav2 projects enter production
icav2 projectpipeline link <pipeline-id>
```

### Infrastructure Constants Updates

Update `infrastructure/stage/constants.ts` to include the new pipeline ID in `WORKFLOW_VERSION_TO_DEFAULT_ICAV2_PIPELINE_ID_MAP`.

### Workflow Manager Updates

Register the new workflow version with the Workflow Manager:

```shell
make-new-workflow.sh \
  --workflow-name 'oncoanalyser-wgts-dna' \
  --workflow-version "<version>" \
  --executionEngine "ICA" \
  --executionEnginePipelineId "<pipeline-id>" \
  --codeVersion "$(cd <nf-repo> && git rev-parse --short=7 HEAD)" \
  --validationState "VALIDATED"
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
  --codeVersion "$(cd <sash-repo> && git rev-parse --short=7 HEAD)" \
  --validationState "VALIDATED"
```

### Analysis Glue Updates

Update the [analysis-glue repository][analysis_glue_repo_link] constants to include the new workflow version.

[analysis_glue_repo_link]: https://github.com/OrcaBus/service-analysis-glue
[sash_github_repo]: https://github.com/umccr/sash
