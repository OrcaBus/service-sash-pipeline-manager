import { PythonUvFunction } from '@orcabus/platform-cdk-constructs/lambda';

export type LambdaName =
  // Shared - preready creation lambdas
  | 'comparePayload'
  | 'generateWruEventObjectWithMergedData'
  | 'getOncoanalyserDirFromPortalRunId'
  | 'findLatestWorkflow'
  | 'getDragenOutputsFromPortalRunId'
  // Shared - validation lambdas
  | 'validateDraftDataCompleteSchema'
  // Glue upstream lambdas
  | 'getWorkflowRunObject'
  | 'getDraftPayload'
  // Draft lambdas
  | 'getFastqIdListFromRgidList'
  | 'getFastqRgidsFromLibraryId'
  | 'getLibraries'
  | 'getMetadataTags'
  // Post-Draft checks
  | 'postSchemaValidation'
  // Ready to ICAv2 WES lambdas
  | 'convertReadyEventInputsToIcav2WesEventInputs'
  // ICAv2 WES to WRSC Event lambdas
  | 'convertIcav2WesEventToWrscEvent';

export const lambdaNameList: LambdaName[] = [
  // Shared - preready creation lambdas
  'comparePayload',
  'generateWruEventObjectWithMergedData',
  'getOncoanalyserDirFromPortalRunId',
  'findLatestWorkflow',
  'getDragenOutputsFromPortalRunId',
  // Shared - validation lambdas
  'validateDraftDataCompleteSchema',
  // Glue upstream lambdas
  'getWorkflowRunObject',
  'getDraftPayload',
  // Draft lambdas
  'getFastqIdListFromRgidList',
  'getFastqRgidsFromLibraryId',
  'getLibraries',
  'getMetadataTags',
  'postSchemaValidation',
  // Ready to ICAv2 WES lambdas
  'convertReadyEventInputsToIcav2WesEventInputs',
  // ICAv2 WES to WRSC Event lambdas
  'convertIcav2WesEventToWrscEvent',
];

// Requirements interface for Lambda functions
export interface LambdaRequirements {
  needsOrcabusApiTools?: boolean;
  needsIcav2Tools?: boolean;
  needsSsmParametersAccess?: boolean;
  needsSchemaRegistryAccess?: boolean;
  needsHigherMemory?: boolean;
  needsWorkflowEnvVars?: boolean;
  needsBucketEnvVars?: boolean;
}

// Lambda requirements mapping
export const lambdaRequirementsMap: Record<LambdaName, LambdaRequirements> = {
  // Shared - preready creation lambdas
  comparePayload: {
    needsOrcabusApiTools: true,
  },
  generateWruEventObjectWithMergedData: {
    needsOrcabusApiTools: true,
  },
  getOncoanalyserDirFromPortalRunId: {
    needsOrcabusApiTools: true,
  },
  findLatestWorkflow: {
    needsOrcabusApiTools: true,
  },
  getDragenOutputsFromPortalRunId: {
    needsOrcabusApiTools: true,
  },
  // Shared - validation lambdas
  validateDraftDataCompleteSchema: {
    needsSchemaRegistryAccess: true,
    needsSsmParametersAccess: true,
  },
  // Glue upstream lambdas
  getWorkflowRunObject: {
    needsOrcabusApiTools: true,
  },
  getDraftPayload: {
    needsOrcabusApiTools: true,
  },
  // Draft lambdas
  getFastqIdListFromRgidList: {
    needsOrcabusApiTools: true,
  },
  getFastqRgidsFromLibraryId: {
    needsOrcabusApiTools: true,
  },
  getLibraries: {
    needsOrcabusApiTools: true,
  },
  getMetadataTags: {
    needsOrcabusApiTools: true,
  },
  // Post draft lambdas
  postSchemaValidation: {
    needsHigherMemory: true,
    needsIcav2Tools: true,
    needsOrcabusApiTools: true,
  },
  // Convert ready to ICAv2 WES Event - no requirements
  convertReadyEventInputsToIcav2WesEventInputs: {
    needsHigherMemory: true,
  },
  // Needs OrcaBus toolkit to get the wrsc event
  convertIcav2WesEventToWrscEvent: {
    needsOrcabusApiTools: true,
  },
};

export interface BuildAllLambdasProps {
  refDataBucketName: string;
  testDataBucketName: string;
}

export interface BuildLambdaProps extends BuildAllLambdasProps {
  lambdaName: LambdaName;
}

export interface LambdaInput {
  lambdaName: LambdaName;
}

export interface LambdaObject extends LambdaInput {
  lambdaFunction: PythonUvFunction;
}
