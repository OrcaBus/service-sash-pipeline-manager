# Product: Sash Pipeline Manager

## Summary

This is an OrcaBus microservice that manages the lifecycle of the **Sash pipeline** — a somatic annotation and reporting pipeline that integrates outputs from both the Oncoanalyser WGTS DNA and Dragen WGTS DNA pipelines to produce annotated somatic variant calls, structural variants, and clinical reporting using PCGR/CPSR on ICAv2.

The service handles orchestration on ICAv2 (Illumina Connected Analytics v2) via CWL workflows. It follows the standard ICAv2-centric Pipeline Architecture used across OrcaBus. This is a downstream service — it depends on the successful completion of both the Oncoanalyser WGTS DNA and Dragen WGTS DNA pipelines (via glue state machines) to obtain their analysis outputs as inputs.

## Core Responsibilities

- Accept `WorkflowRunStateChange` DRAFT events and validate/populate them into READY events
- Submit READY events to ICAv2 as `Icav2WesRequest` events via a Step Functions state machine
- Monitor ICAv2 analysis state changes and convert them to `WorkflowRunUpdate` events
- Validate draft schemas against a registered JSON schema before promotion
- React to upstream Oncoanalyser WGTS DNA and Dragen WGTS DNA SUCCEEDED events and update existing DRAFT runs with new upstream data (glue pattern)
- Perform post-schema validation of engine parameters and URI formats

## Event Flow

```
DRAFT event (WorkflowRunStateChange)
  → populate draft data (Step Functions)
  → validate draft schema
  → post-schema validation (engine params, URIs)
  → emit READY event
  → submit to ICAv2 WES
  → monitor ICAv2 state changes
  → emit WorkflowRunUpdate events

Upstream SUCCEEDED event (oncoanalyser-wgts-dna OR dragen-wgts-dna)
  → glue state machine
  → find matching DRAFT runs
  → merge upstream outputs into DRAFT payload
  → emit WorkflowRunUpdate DRAFT event (if changed)
```

## Upstream / Downstream

- **Upstream**: Oncoanalyser WGTS DNA, Dragen WGTS DNA (provides analysis outputs via glue state machines)
- **Downstream**: None (terminal pipeline in the somatic analysis chain)
- **Key dependencies**: ICAv2 WES Manager, Workflow Manager

## Environments

Deploys to `beta`, `gamma`, and `prod` via AWS CodePipeline. The toolchain account hosts the CodePipeline; application stacks deploy cross-account.
