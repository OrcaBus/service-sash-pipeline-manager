export interface SsmParameterValues {
  // Payload defaults
  workflowName: string;
  payloadVersion: string;

  // Engine Parameter defaults
  pipelineIdsByWorkflowVersionMap: Record<string, string>;
  icav2ProjectId: string;
  logsPrefix: string;
  outputPrefix: string;
  cachePrefix: string;

  // Reference defaults
  sashReferenceDataByWorkflowVersionMap: Record<string, string>;
}

export interface SsmParameterPaths {
  // Top level prefix
  ssmRootPrefix: string;

  // Payload defaults
  workflowName: string;
  payloadVersion: string;

  // Engine Parameter defaults
  prefixPipelineIdsByWorkflowVersion: string;
  icav2ProjectId: string;
  logsPrefix: string;
  outputPrefix: string;
  cachePrefix: string;

  // Reference defaults
  sashReferenceDataSsmRootPrefix: string;
}

export interface BuildSsmParameterProps {
  ssmParameterValues: SsmParameterValues;
  ssmParameterPaths: SsmParameterPaths;
}
