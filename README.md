# Sash Pipeline Manager

- [Overview](#overview)
- [Pipeline State Flow](#pipeline-state-flow)
  - [1. Glue — upstream SUCCEEDED events update DRAFT runs](#1-glue--upstream-succeeded-events-update-draft-runs)
  - [2. DRAFT → populated DRAFT](#2-draft--populated-draft)
  - [3. Populated DRAFT → READY](#3-populated-draft--ready)
  - [4. READY → ICAv2 submission](#4-ready--icav2-submission)
  - [5. ICAv2 state changes → WorkflowRunUpdate events](#5-icav2-state-changes--workflowrunupdate-events)
- [Event Contract](#event-contract)
  - [Consumed Events](#consumed-events)
  - [Published Events](#published-events)
- [Draft Event Payload](#draft-event-payload)
  - [Minimal DRAFT event detail](#minimal-draft-event-detail)
  - [Auto-populated Fields](#auto-populated-fields)
  - [Schema Validation](#schema-validation)
- [Submitting a Draft Event](#submitting-a-draft-event)
- [Infrastructure](#infrastructure)
  - [Stateful Resources](#stateful-resources)
  - [Stateless Resources](#stateless-resources)
  - [Stacks](#stacks)
- [CI/CD and Release Management](#cicd-and-release-management)
- [Related Services](#related-services)
- [SOPs](#sops)
- [Glossary & References](#glossary--references)

---

## Overview

This service manages the lifecycle of the **Sash pipeline** — a somatic annotation and reporting pipeline that integrates outputs from both the Oncoanalyser WGTS DNA and Dragen WGTS DNA pipelines to produce annotated somatic variant calls, structural variants, and clinical reporting using PCGR/CPSR on ICAv2.

The pipeline runs on [ICAv2](https://help.ica.illumina.com/) via CWL. Orchestration follows the standard [ICAv2-centric Pipeline Architecture](https://github.com/OrcaBus/wiki/blob/main/orcabus/platform/pipelines.md#pipeline-orchestration-general-logic).

This is a **downstream service** — it depends on the successful completion of both the Oncoanalyser WGTS DNA and Dragen WGTS DNA pipelines (via glue state machines) to obtain their analysis outputs as inputs.

**Upstream**: [Oncoanalyser WGTS DNA](https://github.com/OrcaBus/service-oncoanalyser-wgts-dna-pipeline-manager), [Dragen WGTS DNA](https://github.com/OrcaBus/service-dragen-wgts-dna-pipeline-manager)
**Downstream**: None (terminal pipeline in the somatic analysis chain)

---

## Pipeline State Flow

The service orchestrates five Step Functions state machines that together drive a workflow run from initial DRAFT submission through to ICAv2 execution and result reporting.

### 1. Glue — upstream SUCCEEDED events update DRAFT runs

**State machine**: [`glue_succeeded_events_to_draft_update_sfn_template`](app/step-functions-templates/glue_succeeded_events_to_draft_update_sfn_template.asl.json)

![Glue succeeded events to draft update](docs/draw-io-exports/glue-succeeded-events-to-draft-update.svg)

When an upstream pipeline (Oncoanalyser WGTS DNA or Dragen WGTS DNA) emits a `WorkflowRunStateChange` SUCCEEDED event, this state machine finds matching DRAFT workflow runs for the Sash pipeline and merges the upstream outputs into the DRAFT payload.

### 2. DRAFT → populated DRAFT

**State machine**: [`populate_draft_data_sfn_template`](app/step-functions-templates/populate_draft_data_sfn_template.asl.json)

![Populate draft data](docs/draw-io-exports/populate-draft-data.svg)

When a `WorkflowRunStateChange` DRAFT event arrives, this state machine populates any missing payload fields by resolving defaults from SSM and querying upstream services:

1. **Resolve engine parameters** — `projectId`, `pipelineId`, `outputUri`, `logsUri`
2. **Resolve tags** — library metadata, subject/individual IDs, upstream run IDs
3. **Resolve inputs** — Dragen somatic/germline output directories, Oncoanalyser DNA output directory, reference data path
4. **Emit DRAFT update event** with the fully populated payload

### 3. Populated DRAFT → READY

**State machine**: [`validate_draft_data_and_put_ready_event_sfn_template`](app/step-functions-templates/validate_draft_data_and_put_ready_event_sfn_template.asl.json)

![Validate draft and put READY event](docs/draw-io-exports/validate-draft-and-put-ready-event.svg)

Triggered when a DRAFT `WorkflowRunStateChange` event is received with a fully populated payload:

1. **Schema validation** — validates against the registered AWS Schemas registry entry
2. **Post-schema validation** — business-rule checks (engine parameter consistency, URI accessibility)
3. **Push READY event** — emits a `WorkflowRunStateChange` READY event to EventBridge

### 4. READY → ICAv2 submission

**State machine**: [`ready_event_to_icav2_wes_request_event_sfn_template`](app/step-functions-templates/ready_event_to_icav2_wes_request_event_sfn_template.asl.json)

![READY to ICAv2 WES request](docs/draw-io-exports/ready-to-icav2-wes-request.svg)

Converts a READY event into an `Icav2WesRequest` event that the ICAv2 WES Manager consumes to launch the CWL analysis:

1. **Convert** — translates the READY event payload into ICAv2 WES request format
2. **Push** — emits an `Icav2WesRequest` event to `OrcaBusMain`

### 5. ICAv2 state changes → WorkflowRunUpdate events

**State machine**: [`icav2_wes_event_to_wrsc_event_sfn_template`](app/step-functions-templates/icav2_wes_event_to_wrsc_event_sfn_template.asl.json)

![ICAv2 WES event to WRSC](docs/draw-io-exports/icav2-wes-event-to-wrsc.svg)

Listens for `Icav2WesAnalysisStateChange` events and converts them into `WorkflowRunUpdate` events:

1. **Convert** — maps the ICAv2 status to a `WorkflowRunStateChange` event
2. **Route by status**:
   - **SUCCEEDED** — pushes the WRSC event
   - **FAILED** — writes a failure comment, then pushes the WRSC event
   - **Any other status** — pushes the WRSC event directly

---

## Event Contract

### Consumed Events

 | DetailType                    | Source                    | Schema                                                                                                                                     | Description                                                                                         |
 |-------------------------------|---------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
 | `WorkflowRunStateChange`      | `orcabus.workflowmanager` | [WorkflowRunStateChange](https://github.com/OrcaBus/wiki/tree/main/orcabus-platform#workflowrunstatechange)                                | DRAFT/READY workflow run records for Sash, and upstream SUCCEEDED events (oncoanalyser/dragen WGTS) |
 | `Icav2WesAnalysisStateChange` | `orcabus.icav2wes`        | [Icav2WesAnalysisStateChange](https://github.com/OrcaBus/service-icav2-wes-manager/blob/main/app/event-schemas/analysis-state-change.json) | ICAv2 analysis state updates                                                                        |

### Published Events

| DetailType          | Source          | Schema                                                                                                      | Description                                         |
|---------------------|-----------------|-------------------------------------------------------------------------------------------------------------|-----------------------------------------------------|
| `WorkflowRunUpdate` | `orcabus.sash`  | [WorkflowRunUpdate](https://github.com/OrcaBus/wiki/blob/main/orcabus/platform/events.md#workflowrunupdate) | Pipeline state updates (DRAFT, READY, running, succeeded…) |

---

## Draft Event Payload

A DRAFT event can be submitted with a minimal `data` payload — the populate state machine resolves all defaults. The `data` object may be omitted entirely. The final validated payload must satisfy the [complete-data draft schema](app/event-schemas/complete-data-draft/2025.08.05/complete-data-draft-schema.json).

### Minimal DRAFT event detail

```json
{
  "status": "DRAFT",
  "workflowName": "sash",
  "workflowVersion": "2.1.0",
  "workflowRunName": "umccr--automated--sash--2-1-0--<portalRunId>",
  "portalRunId": "<portalRunId>",
  "linkedLibraries": [
    { "libraryId": "L2401541", "orcabusId": "lib.01..." },
    { "libraryId": "L2401540", "orcabusId": "lib.02..." }
  ]
}
```

The `payload.data` object may be included to override any auto-populated fields. An empty or absent `payload.data` is valid.

### Auto-populated Fields

| Field | Resolved from |
|---|---|
| `engineParameters.projectId` | SSM: default ICAv2 project for the environment |
| `engineParameters.pipelineId` | SSM: pipeline ID map keyed by workflow version |
| `engineParameters.outputUri` | SSM: output prefix + `portalRunId` |
| `engineParameters.logsUri` | SSM: logs prefix + `portalRunId` |
| `tags.libraryId` | From `linkedLibraries` (normal entry) |
| `tags.tumorLibraryId` | From `linkedLibraries` (tumor entry) |
| `tags.fastqRgidList` | Fastq Glue — resolved from `libraryId` |
| `tags.tumorFastqRgidList` | Fastq Glue — resolved from `tumorLibraryId` |
| `tags.subjectId` / `individualId` | Metadata service |
| `inputs.dragenSomaticDir` | Dragen WGTS DNA SUCCEEDED outputs |
| `inputs.dragenGermlineDir` | Dragen WGTS DNA SUCCEEDED outputs |
| `inputs.oncoanalyserDnaDir` | Oncoanalyser WGTS DNA SUCCEEDED outputs |
| `inputs.refDataPath` | SSM: default reference data for workflow version |

### Schema Validation

The complete-data schema is registered in the AWS Schemas registry and used for validation. See the schema at [`app/event-schemas/`](app/event-schemas/).

---

## Submitting a Draft Event

To manually submit a Sash DRAFT event (e.g. to trigger a reanalysis), follow:

- [PM.SAS.1 — Manual Pipeline Execution](docs/operation/SOP/PM.SAS.1/PM.SAS.1-ManualPipelineExecution.md)

See the [full SOPs index](docs/operation/SOP/README.md) for all operational procedures including deployment, parameter updates, and troubleshooting.

---

## Infrastructure

The service is deployed via AWS CDK. Resources are split into two stacks: stateful (data/config) and stateless (compute/events).

All SSM parameters live under `/orcabus/workflows/sash/`.
Event bus: `OrcaBusMain`
Event source: `orcabus.sash`

### Stateful Resources

**AWS Schemas registry**
- `complete-data-draft-schema.json` — used to validate DRAFT payloads before promotion to READY

**SSM Parameters**

| Parameter | Description |
|---|---|
| `workflowName` | `sash` |
| `workflowVersion` | Current default version |
| `payloadVersion` | Payload schema version |
| `icav2ProjectId` | Default ICAv2 project ID per environment |
| `logsPrefix` | Default S3 prefix for logs |
| `outputPrefix` | Default S3 prefix for outputs |
| `pipelineIdsByWorkflowVersion/<version>` | ICAv2 CWL pipeline ID for each workflow version |
| `inputsByWorkflowVersion/<version>` | Default input overrides per workflow version |

### Stateless Resources

- **Lambda functions** (Python 3.14, ARM64) — one per task in the state machines; see [`app/lambdas/`](app/lambdas/)
- **Step Functions state machines** — five ASL templates in [`app/step-functions-templates/`](app/step-functions-templates/)
- **EventBridge rules** — route incoming `WorkflowRunStateChange` (DRAFT, READY, upstream SUCCEEDED) and `Icav2WesAnalysisStateChange` events to the appropriate state machines

### Stacks

The CDK project deploys a CodePipeline in the toolchain account that promotes changes to `beta`, `gamma`, and `prod`.

```sh
# List stateful stacks
pnpm cdk-stateful ls

# List stateless stacks
pnpm cdk-stateless ls
```

---

## CI/CD and Release Management

All changes merged to `main` are automatically built and deployed to `beta` and `gamma`. Promotion to `prod` requires manually enabling the CodePipeline transition in the AWS console.

---

## Related Services

| Role            | Service                                                                                                    |
|-----------------|------------------------------------------------------------------------------------------------------------|
| Upstream        | [Oncoanalyser WGTS DNA](https://github.com/OrcaBus/service-oncoanalyser-wgts-dna-pipeline-manager)        |
| Upstream        | [Dragen WGTS DNA](https://github.com/OrcaBus/service-dragen-wgts-dna-pipeline-manager)                    |
| ICAv2 execution | [ICAv2 WES Manager](https://github.com/OrcaBus/service-icav2-wes-manager)                                 |
| Workflow state  | [Workflow Manager](https://github.com/OrcaBus/service-workflow-manager)                                    |

---

## SOPs

| SOP | Description |
|---|---|
| [PM.SAS.1](docs/operation/SOP/PM.SAS.1/PM.SAS.1-ManualPipelineExecution.md) | Manually kick off a reanalysis |
| [PM.SAS.2](docs/operation/SOP/PM.SAS.2/PM.SAS.2-DeployingNewPipelineVersion.md) | Install and deploy a new pipeline version |
| [PM.SAS.3](docs/operation/SOP/PM.SAS.3/PM.SAS.3-UpdatingSsmParameters.md) | Update SSM parameters |
| [PM.SAS.4](docs/operation/SOP/PM.SAS.4/PM.SAS.4-RunningWorkflowValidations.md) | Run workflow validations |
| [PM.SAS.5](docs/operation/SOP/PM.SAS.5/PM.SAS.5-Troubleshooting.md) | Troubleshoot common issues |

---

## Glossary & References

- Platform glossary: [OrcaBus wiki](https://github.com/OrcaBus/wiki/blob/main/orcabus-platform/README.md#glossary--references)
- For development setup, build commands, project structure, and conventions see the [steering docs](.kiro/steering/).
