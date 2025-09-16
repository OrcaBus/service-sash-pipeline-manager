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
  // Validate the draft data payload
  | 'validateDraftToReady'
  // Ready-to-Submitted
  | 'readyEventToIcav2WesRequestEvent'
  // Post-submission event conversion
  | 'icav2WesAscEventToWorkflowRscEvent';

export const stateMachineNameList: StateMachineName[] = [
  // Upstream Events
  'glueSucceededEventsToDraftUpdate',
  // Populate Draft Data
  'populateDraftData',
  // Validate
  'validateDraftToReady',
  // Ready-to-Submitted
  'readyEventToIcav2WesRequestEvent',
  // Post-submission event conversion
  'icav2WesAscEventToWorkflowRscEvent',
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
  isNewWorkflowManagerDeployed: boolean;
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
  validateDraftToReady: {
    needsEventPutPermission: true,
  },
  readyEventToIcav2WesRequestEvent: {
    needsEventPutPermission: true,
  },
  icav2WesAscEventToWorkflowRscEvent: {
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
  ],
  // Validate the draft data payload
  validateDraftToReady: [
    // Shared - validation lambdas
    'validateDraftDataCompleteSchema',
  ],
  // Ready-to-Submitted
  readyEventToIcav2WesRequestEvent: ['convertReadyEventInputsToIcav2WesEventInputs'],
  // Post-submission event conversion
  icav2WesAscEventToWorkflowRscEvent: ['convertIcav2WesEventToWrscEvent'],
};
