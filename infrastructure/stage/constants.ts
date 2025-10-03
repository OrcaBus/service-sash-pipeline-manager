/* Directory constants */
import path from 'path';
import { StageName } from '@orcabus/platform-cdk-constructs/shared-config/accounts';
import { WorkflowVersionType } from './interfaces';

export const APP_ROOT = path.join(__dirname, '../../app');
export const LAMBDA_DIR = path.join(APP_ROOT, 'lambdas');
export const STEP_FUNCTIONS_DIR = path.join(APP_ROOT, 'step-functions-templates');
export const EVENT_SCHEMAS_DIR = path.join(APP_ROOT, 'event-schemas');

/* Workflow constants */
export const WORKFLOW_NAME = 'sash';

// Yet to implement draft events into this service
// However, because this workflow has the same workflow name as the
// existing production workflow, we need to filter on the payload version
// to prevent the wrong service from being triggered
export const DEFAULT_PAYLOAD_VERSION = '2025.08.05';

// Yet to implement draft events into this service
export const WORKFLOW_LOGS_PREFIX = `s3://{__CACHE_BUCKET__}/{__CACHE_PREFIX__}logs/${WORKFLOW_NAME}/`;
export const WORKFLOW_OUTPUT_PREFIX = `s3://{__CACHE_BUCKET__}/{__CACHE_PREFIX__}analysis/${WORKFLOW_NAME}/`;
export const WORKFLOW_CACHE_PREFIX = `s3://{__CACHE_BUCKET__}/{__CACHE_PREFIX__}cache/${WORKFLOW_NAME}/`;

/* We extend this every time we release a new version of the workflow */
/* This is added into our SSM Parameter Store to allow us to map workflow versions to pipeline IDs */
export const WORKFLOW_VERSION_TO_DEFAULT_ICAV2_PIPELINE_ID_MAP: Record<
  WorkflowVersionType,
  string
> = {
  // At the moment we are running manual deployments of the workflow
  '0.6.0': 'ab6e1d62-1b5a-4b24-86b8-81ccf4bdc7a2',
  '0.6.1': '5c8d2267-73bc-4923-83ec-15fe1aa6aed9',
  '0.6.2': '5865b1f2-ce78-4fe7-a630-24cb6a55fb88',
};

export const WORKFLOW_VERSION_TO_SASH_REFERENCE_PATHS_MAP: Record<WorkflowVersionType, string> = {
  '0.6.0': 's3://reference-data-503977275616-ap-southeast-2/refdata/sash/0.6.0/',
  '0.6.1': 's3://reference-data-503977275616-ap-southeast-2/refdata/sash/0.6.1/',
  // No differences in the reference data between 0.6.1 and 0.6.2
  '0.6.2': 's3://reference-data-503977275616-ap-southeast-2/refdata/sash/0.6.1/',
};

/* SSM Parameter Paths */
export const SSM_PARAMETER_PATH_PREFIX = path.join(`/orcabus/workflows/${WORKFLOW_NAME}/`);
// Workflow Parameters
export const SSM_PARAMETER_PATH_WORKFLOW_NAME = path.join(
  SSM_PARAMETER_PATH_PREFIX,
  'workflow-name'
);
export const SSM_PARAMETER_PATH_DEFAULT_WORKFLOW_VERSION = path.join(
  SSM_PARAMETER_PATH_PREFIX,
  'default-workflow-version'
);
// Engine Parameters
export const SSM_PARAMETER_PATH_PREFIX_PIPELINE_IDS_BY_WORKFLOW_VERSION = path.join(
  SSM_PARAMETER_PATH_PREFIX,
  'pipeline-ids-by-workflow-version'
);
export const SSM_PARAMETER_PATH_ICAV2_PROJECT_ID = path.join(
  SSM_PARAMETER_PATH_PREFIX,
  'icav2-project-id'
);
export const SSM_PARAMETER_PATH_PAYLOAD_VERSION = path.join(
  SSM_PARAMETER_PATH_PREFIX,
  'payload-version'
);
export const SSM_PARAMETER_PATH_LOGS_PREFIX = path.join(SSM_PARAMETER_PATH_PREFIX, 'logs-prefix');
export const SSM_PARAMETER_PATH_OUTPUT_PREFIX = path.join(
  SSM_PARAMETER_PATH_PREFIX,
  'output-prefix'
);
export const SSM_PARAMETER_PATH_CACHE_PREFIX = path.join(SSM_PARAMETER_PATH_PREFIX, 'cache-prefix');
// Reference Parameters
export const SSM_PARAMETER_PATH_PREFIX_SASH_REFERENCE_PATHS_BY_WORKFLOW_VERSION = path.join(
  SSM_PARAMETER_PATH_PREFIX,
  'default-sash-reference-paths-by-workflow-version'
);

/* Event Constants */
export const EVENT_BUS_NAME = 'OrcaBusMain';
export const EVENT_SOURCE = 'orcabus.sash';
export const WORKFLOW_RUN_STATE_CHANGE_DETAIL_TYPE = 'WorkflowRunStateChange';
export const WORKFLOW_RUN_UPDATE_DETAIL_TYPE = 'WorkflowRunUpdate';
export const ICAV2_WES_REQUEST_DETAIL_TYPE = 'Icav2WesRequest';
export const ICAV2_WES_STATE_CHANGE_DETAIL_TYPE = 'Icav2WesAnalysisStateChange';
export const WORKFLOW_MANAGER_EVENT_SOURCE = 'orcabus.workflowmanager';
export const ICAV2_WES_EVENT_SOURCE = 'orcabus.icav2wesmanager';
export const DRAGEN_WGTS_DNA_WORKFLOW_NAME = 'dragen-wgts-dna';
export const ONCOANALYSER_WGTS_DNA_WORKFLOW_NAME = 'oncoanalyser-wgts-dna';

/* Event rule constants */
// Yet to implement draft events into this service
export const DRAFT_STATUS = 'DRAFT';
export const READY_STATUS = 'READY';
export const SUCCEEDED_STATUS = 'SUCCEEDED';

/* Schema constants */
// Yet to implement draft events into this service
export const SCHEMA_REGISTRY_NAME = EVENT_SOURCE;
export const SSM_SCHEMA_ROOT = path.join(SSM_PARAMETER_PATH_PREFIX, 'schemas');

/* Future proofing */
export const NEW_WORKFLOW_MANAGER_IS_DEPLOYED: Record<StageName, boolean> = {
  BETA: true,
  GAMMA: false,
  PROD: false,
};

// Used to group event rules and step functions
export const STACK_PREFIX = 'orca-sash';
