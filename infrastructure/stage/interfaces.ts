/*

Interfaces for the application

 */

import { SsmParameterPaths, SsmParameterValues } from './ssm/interfaces';

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

  // Workflow manager stuff
  isNewWorkflowManagerDeployed: boolean;

  // SSM Parameters
  ssmParameterPaths: SsmParameterPaths;
}

/* Set versions */
export type WorkflowVersionType = '0.6.0' | '0.6.1' | '0.6.2' | '0.6.3' | '0.7.0';
