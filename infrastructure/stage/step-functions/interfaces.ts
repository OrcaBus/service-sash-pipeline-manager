import { IEventBus } from 'aws-cdk-lib/aws-events';
import { StateMachine } from 'aws-cdk-lib/aws-stepfunctions';

import { LambdaName, LambdaObject } from '../lambda/interfaces';
import { SsmParameterPaths } from '../ssm/interfaces';

/**
 * Step Function Interfaces
 */
export type StateMachineName =
  // Upstream Events
  | 'glueSucceededEventsToDraftUpdate'
  // Populate Draft Data
  | 'populateDraftData'
  // Validate draft data and put ready event
  | 'validateDraftDataAndPutReadyEvent'
  // Ready-to-Submitted
  | 'readyEventToIcav2WesRequestEvent'
  // Post-submission event conversion
  | 'icav2WesEventToWrscEvent';

export const stateMachineNameList: StateMachineName[] = [
  // Upstream Events
  'glueSucceededEventsToDraftUpdate',
  // Populate Draft Data
  'populateDraftData',
  // Validate draft data and put ready event
  'validateDraftDataAndPutReadyEvent',
  // Ready-to-Submitted
  'readyEventToIcav2WesRequestEvent',
  // Post-submission event conversion
  'icav2WesEventToWrscEvent',
];

// Requirements interface for Step Functions
export interface StepFunctionRequirements {
  // Event stuff
  needsEventPutPermission?: boolean;
  // SSM Stuff
  needsSsmParameterStoreAccess?: boolean;
}

export interface StepFunctionInput {
  stateMachineName: StateMachineName;
}

export interface BuildStepFunctionProps extends StepFunctionInput {
  lambdaObjects: LambdaObject[];
  eventBus: IEventBus;
  ssmParameterPaths: SsmParameterPaths;
}

export interface StepFunctionObject extends StepFunctionInput {
  sfnObject: StateMachine;
}

export type WireUpPermissionsProps = BuildStepFunctionProps & StepFunctionObject;

export type BuildStepFunctionsProps = Omit<BuildStepFunctionProps, 'stateMachineName'>;

export const stepFunctionsRequirementsMap: Record<StateMachineName, StepFunctionRequirements> = {
  glueSucceededEventsToDraftUpdate: {
    needsEventPutPermission: true,
  },
  populateDraftData: {
    needsEventPutPermission: true,
    needsSsmParameterStoreAccess: true,
  },
  validateDraftDataAndPutReadyEvent: {
    needsEventPutPermission: true,
  },
  readyEventToIcav2WesRequestEvent: {
    needsEventPutPermission: true,
  },
  icav2WesEventToWrscEvent: {
    needsEventPutPermission: true,
  },
};

export const stepFunctionToLambdasMap: Record<StateMachineName, LambdaName[]> = {
  // Upstream Events
  glueSucceededEventsToDraftUpdate: [
    // Shared - preready creation lambdas
    'comparePayload',
    'generateWruEventObjectWithMergedData',
    'getOncoanalyserDirFromPortalRunId',
    'findLatestWorkflow',
    'getDragenOutputsFromPortalRunId',
    'getWorkflowRunObject',
    // Glue upstream lambdas
    'getWorkflowRunObject',
    'getDraftPayload',
  ],
  // Populate Draft Data
  populateDraftData: [
    // Shared - preready creation lambdas
    'comparePayload',
    'generateWruEventObjectWithMergedData',
    'getMissingSchemaFields',
    'getOncoanalyserDirFromPortalRunId',
    'findLatestWorkflow',
    'getWorkflowRunObject',
    // Shared - validation lambdas
    'validateDraftDataCompleteSchema',
    // Draft lambdas
    'getDragenOutputsFromPortalRunId',
    'getFastqIdListFromRgidList',
    'getFastqRgidsFromLibraryId',
    'getLibraries',
    'getMetadataTags',
    // Commentary Functions
    'addPopulateDraftComment',
  ],
  // Validate draft data and put ready event
  validateDraftDataAndPutReadyEvent: [
    // Shared - validation lambdas
    'validateDraftDataCompleteSchema',
    'postSchemaValidation',
  ],
  // Ready-to-Submitted
  readyEventToIcav2WesRequestEvent: ['convertReadyEventInputsToIcav2WesEventInputs'],
  // Post-submission event conversion
  icav2WesEventToWrscEvent: ['convertIcav2WesEventToWrscEvent', 'addWesFailureComment'],
};
