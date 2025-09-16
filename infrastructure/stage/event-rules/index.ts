/* Event Bridge Rules */
import {
  // Yet to be utilised
  // BuildDraftRuleProps,
  BuildReadyRuleProps,
  BuildIcav2AnalysisStateChangeRuleProps,
  eventBridgeRuleNameList,
  EventBridgeRuleObject,
  EventBridgeRuleProps,
  EventBridgeRulesProps,
  BuildDraftRuleProps,
} from './interfaces';
import { EventPattern, Rule } from 'aws-cdk-lib/aws-events';
import * as events from 'aws-cdk-lib/aws-events';
import { Construct } from 'constructs';
import {
  DEFAULT_PAYLOAD_VERSION,
  DRAFT_STATUS,
  DRAGEN_WGTS_DNA_WORKFLOW_NAME,
  // DRAFT_STATUS,
  ICAV2_WES_EVENT_SOURCE,
  ICAV2_WES_STATE_CHANGE_DETAIL_TYPE,
  ONCOANALYSER_WGTS_DNA_WORKFLOW_NAME,
  READY_STATUS,
  STACK_PREFIX,
  SUCCEEDED_STATUS,
  WORKFLOW_MANAGER_EVENT_SOURCE,
  WORKFLOW_NAME,
  WORKFLOW_RUN_STATE_CHANGE_DETAIL_TYPE,
} from '../constants';

/*
https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-create-pattern-operators.html
*/

function buildIcav2AnalysisStateChangeEventPattern(): EventPattern {
  return {
    detailType: [ICAV2_WES_STATE_CHANGE_DETAIL_TYPE],
    source: [ICAV2_WES_EVENT_SOURCE],
    detail: {
      name: [
        {
          wildcard: `*--${WORKFLOW_NAME}--*`,
        },
      ],
    },
  };
}

function buildUpstreamWorkflowRunStateChangeLegacySucceededEventPattern(): EventPattern {
  return {
    detailType: [WORKFLOW_RUN_STATE_CHANGE_DETAIL_TYPE],
    source: [WORKFLOW_MANAGER_EVENT_SOURCE],
    detail: {
      workflowName: [DRAGEN_WGTS_DNA_WORKFLOW_NAME, ONCOANALYSER_WGTS_DNA_WORKFLOW_NAME],
      status: [SUCCEEDED_STATUS],
    },
  };
}

function buildWorkflowManagerLegacyDraftEventPattern(): EventPattern {
  return {
    detailType: [WORKFLOW_RUN_STATE_CHANGE_DETAIL_TYPE],
    source: [WORKFLOW_MANAGER_EVENT_SOURCE],
    detail: {
      workflowName: [WORKFLOW_NAME],
      status: [DRAFT_STATUS],
    },
  };
}

function buildWorkflowManagerLegacyReadyEventPattern(): EventPattern {
  return {
    detailType: [WORKFLOW_RUN_STATE_CHANGE_DETAIL_TYPE],
    source: [WORKFLOW_MANAGER_EVENT_SOURCE],
    detail: {
      workflowName: [WORKFLOW_NAME],
      status: [READY_STATUS],
    },
  };
}

function buildUpstreamWorkflowRunStateChangeSucceededEventPattern(): EventPattern {
  return {
    detailType: [WORKFLOW_RUN_STATE_CHANGE_DETAIL_TYPE],
    source: [WORKFLOW_MANAGER_EVENT_SOURCE],
    detail: {
      workflow: {
        name: [DRAGEN_WGTS_DNA_WORKFLOW_NAME, ONCOANALYSER_WGTS_DNA_WORKFLOW_NAME],
      },
      status: [SUCCEEDED_STATUS],
    },
  };
}

function buildWorkflowManagerDraftEventPattern(): EventPattern {
  return {
    detailType: [WORKFLOW_RUN_STATE_CHANGE_DETAIL_TYPE],
    source: [WORKFLOW_MANAGER_EVENT_SOURCE],
    detail: {
      workflow: {
        name: [WORKFLOW_NAME],
      },
      status: [DRAFT_STATUS],
    },
  };
}

function buildWorkflowManagerReadyEventPattern(): EventPattern {
  return {
    detailType: [WORKFLOW_RUN_STATE_CHANGE_DETAIL_TYPE],
    source: [WORKFLOW_MANAGER_EVENT_SOURCE],
    detail: {
      workflow: {
        name: [WORKFLOW_NAME],
      },
      status: [READY_STATUS],
      payload: {
        version: [DEFAULT_PAYLOAD_VERSION],
      },
    },
  };
}

function buildEventRule(scope: Construct, props: EventBridgeRuleProps): Rule {
  return new events.Rule(scope, props.ruleName, {
    ruleName: `${STACK_PREFIX}-${props.ruleName}`,
    eventPattern: props.eventPattern,
    eventBus: props.eventBus,
  });
}

function buildIcav2WesAnalysisStateChangeRule(
  scope: Construct,
  props: BuildIcav2AnalysisStateChangeRuleProps
): Rule {
  return buildEventRule(scope, {
    ruleName: props.ruleName,
    eventPattern: buildIcav2AnalysisStateChangeEventPattern(),
    eventBus: props.eventBus,
  });
}

function buildUpstreamWorkflowRunStateChangeSucceededLegacyEventRule(
  scope: Construct,
  props: BuildDraftRuleProps
): Rule {
  return buildEventRule(scope, {
    ruleName: props.ruleName,
    eventPattern: buildUpstreamWorkflowRunStateChangeLegacySucceededEventPattern(),
    eventBus: props.eventBus,
  });
}

function buildWorkflowRunStateChangeDraftLegacyEventRule(
  scope: Construct,
  props: BuildDraftRuleProps
): Rule {
  return buildEventRule(scope, {
    ruleName: props.ruleName,
    eventPattern: buildWorkflowManagerLegacyDraftEventPattern(),
    eventBus: props.eventBus,
  });
}

function buildWorkflowRunStateChangeReadyLegacyEventRule(
  scope: Construct,
  props: BuildReadyRuleProps
): Rule {
  return buildEventRule(scope, {
    ruleName: props.ruleName,
    eventPattern: buildWorkflowManagerLegacyReadyEventPattern(),
    eventBus: props.eventBus,
  });
}

function buildUpstreamWorkflowRunStateChangeSucceededEventRule(
  scope: Construct,
  props: BuildDraftRuleProps
): Rule {
  return buildEventRule(scope, {
    ruleName: props.ruleName,
    eventPattern: buildUpstreamWorkflowRunStateChangeSucceededEventPattern(),
    eventBus: props.eventBus,
  });
}

function buildWorkflowRunStateChangeDraftEventRule(
  scope: Construct,
  props: BuildDraftRuleProps
): Rule {
  return buildEventRule(scope, {
    ruleName: props.ruleName,
    eventPattern: buildWorkflowManagerDraftEventPattern(),
    eventBus: props.eventBus,
  });
}

function buildWorkflowRunStateChangeReadyEventRule(
  scope: Construct,
  props: BuildReadyRuleProps
): Rule {
  return buildEventRule(scope, {
    ruleName: props.ruleName,
    eventPattern: buildWorkflowManagerReadyEventPattern(),
    eventBus: props.eventBus,
  });
}

export function buildAllEventRules(
  scope: Construct,
  props: EventBridgeRulesProps
): EventBridgeRuleObject[] {
  const eventBridgeRuleObjects: EventBridgeRuleObject[] = [];

  // Iterate over the eventBridgeNameList and create the event rules
  for (const ruleName of eventBridgeRuleNameList) {
    switch (ruleName) {
      // Upstream succeeded events
      case 'upstreamSucceededEventLegacy': {
        eventBridgeRuleObjects.push({
          ruleName: ruleName,
          ruleObject: buildUpstreamWorkflowRunStateChangeSucceededLegacyEventRule(scope, {
            ruleName: ruleName,
            eventBus: props.eventBus,
          }),
        });
        break;
      }
      case 'upstreamSucceededEvent': {
        eventBridgeRuleObjects.push({
          ruleName: ruleName,
          ruleObject: buildUpstreamWorkflowRunStateChangeSucceededEventRule(scope, {
            ruleName: ruleName,
            eventBus: props.eventBus,
          }),
        });
        break;
      }
      // Populate Draft Data events
      case 'wrscDraftLegacy': {
        eventBridgeRuleObjects.push({
          ruleName: ruleName,
          ruleObject: buildWorkflowRunStateChangeDraftLegacyEventRule(scope, {
            ruleName: ruleName,
            eventBus: props.eventBus,
          }),
        });
        break;
      }
      case 'wrscDraft': {
        eventBridgeRuleObjects.push({
          ruleName: ruleName,
          ruleObject: buildWorkflowRunStateChangeDraftEventRule(scope, {
            ruleName: ruleName,
            eventBus: props.eventBus,
          }),
        });
        break;
      }
      // Ready
      case 'wrscReadyLegacy': {
        eventBridgeRuleObjects.push({
          ruleName: ruleName,
          ruleObject: buildWorkflowRunStateChangeReadyLegacyEventRule(scope, {
            ruleName: ruleName,
            eventBus: props.eventBus,
          }),
        });
        break;
      }
      case 'wrscReady': {
        eventBridgeRuleObjects.push({
          ruleName: ruleName,
          ruleObject: buildWorkflowRunStateChangeReadyEventRule(scope, {
            ruleName: ruleName,
            eventBus: props.eventBus,
          }),
        });
        break;
      }
      case 'icav2WesAnalysisStateChange': {
        eventBridgeRuleObjects.push({
          ruleName: ruleName,
          ruleObject: buildIcav2WesAnalysisStateChangeRule(scope, {
            ruleName: ruleName,
            eventBus: props.eventBus,
          }),
        });
      }
    }
  }

  // Return the event bridge rule objects
  return eventBridgeRuleObjects;
}
