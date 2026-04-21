/*

Interfaces for the application

 */

import { SsmParameterPaths, SsmParameterValues } from './ssm/interfaces';
import { StageName } from '@orcabus/platform-cdk-constructs/shared-config/accounts';

/**
 * Stateful application stack interface.
 */

export interface StatefulApplicationStackConfig {
  // Values
  // Detail
  ssmParameterValues: SsmParameterValues;

  // Keys
  ssmParameterPaths: SsmParameterPaths;
}

/**
 * Stateless application stack interface.
 */
export interface StatelessApplicationStackConfig {
  // Event Stuff
  eventBusName: string;

  // SSM Parameters
  ssmParameterPaths: SsmParameterPaths;

  // TestData and RefData bucket names
  testDataBucketName: string;
  refDataBucketName: string;

  // Stage Name (required for lambdas needing ICAtools)
  stageName: StageName;
}

/* Set versions */
export type WorkflowVersionType = '0.6.0' | '0.6.1' | '0.6.2' | '0.6.3' | '0.6.4' | '0.7.0';
