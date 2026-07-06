# Running Workflow Validations

- Version: 1.0
- Contact: Alexis Lucattini, [alexisl@unimelb.edu.au](mailto:alexisl@unimelb.edu.au)

Table of Contents
- [Introduction](#introduction)
- [Requirements](#requirements)
- [Validation Procedure](#validation-procedure)
  - [CDK Tests](#cdk-tests)
  - [End-to-End Validation](#end-to-end-validation)
- [Expected Outcomes](#expected-outcomes)


## Introduction

This SOP describes how to validate the Sash pipeline after making changes to infrastructure, parameters, or the CWL workflow. Validation ensures that the pipeline can successfully process a DRAFT event through to SUCCEEDED status.


## Requirements

- AWS credentials for the target environment (dev/beta)
- Access to the OrcaBus Portal
- Node.js 22.9.0 with pnpm enabled
- Test libraries available in the target environment


## Validation Procedure

### CDK Tests

Run the CDK compliance tests to verify infrastructure changes:

```shell
make test
```

This runs `tsc` compilation followed by Jest tests that check all CDK stacks against `cdk-nag` rules.

### End-to-End Validation

1. **Submit a test DRAFT event** using the [Manual Pipeline Execution SOP](../PM.SAS.1/PM.SAS.1-ManualPipelineExecution.md)
   - Use test libraries from the beta/dev environment
   - Ensure upstream Dragen WGTS DNA and Oncoanalyser WGTS DNA runs have SUCCEEDED for the test libraries

2. **Monitor the workflow progression**:
   - DRAFT → populated DRAFT (populate-draft-data state machine)
   - Populated DRAFT → READY (validate-draft-and-put-ready-event state machine)
   - READY → SUBMITTED (ready-to-icav2-wes-request state machine)
   - SUBMITTED → RUNNING → SUCCEEDED (ICAv2 execution)

3. **Check results** via the OrcaBus [Portal](https://portal.umccr.org/):
   - Verify the workflow run reached SUCCEEDED status
   - Check that output URIs point to valid S3 locations
   - Review any comments written to the workflow run record


## Expected Outcomes

- All CDK-nag rules pass without new violations
- Test workflow run completes with SUCCEEDED status
- Output data is written to the expected S3 paths
- No unexpected errors in Step Functions execution history
