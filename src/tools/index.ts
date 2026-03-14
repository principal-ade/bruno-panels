/**
 * Bruno Panel Tools
 *
 * UTCP-compatible tools for the Bruno API client panel.
 */

import type { PanelTool, PanelToolsMetadata } from '@principal-ade/utcp-panel-event';

/**
 * Tool: Send Request
 */
export const sendRequestTool: PanelTool = {
  name: 'send_request',
  description: 'Sends the currently selected HTTP request',
  inputs: {
    type: 'object',
    properties: {
      requestId: {
        type: 'string',
        description: 'ID of the request to send (uses selected if not provided)',
      },
    },
  },
  outputs: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      status: { type: 'number' },
      responseTime: { type: 'number' },
    },
  },
  tags: ['http', 'request', 'api'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: 'principal-ade.bruno-panel:send-request',
  },
};

/**
 * Tool: Select Request
 */
export const selectRequestTool: PanelTool = {
  name: 'select_request',
  description: 'Selects a request from the collection to view/edit',
  inputs: {
    type: 'object',
    properties: {
      requestPath: {
        type: 'string',
        description: 'Path to the .bru request file',
      },
    },
    required: ['requestPath'],
  },
  outputs: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      requestName: { type: 'string' },
    },
  },
  tags: ['request', 'selection', 'navigation'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: 'principal-ade.bruno-panel:select-request',
  },
};

/**
 * Tool: Load Collection
 */
export const loadCollectionTool: PanelTool = {
  name: 'load_collection',
  description: 'Loads a Bruno collection from the specified directory',
  inputs: {
    type: 'object',
    properties: {
      collectionPath: {
        type: 'string',
        description: 'Path to the Bruno collection directory',
      },
    },
    required: ['collectionPath'],
  },
  outputs: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      requestCount: { type: 'number' },
    },
  },
  tags: ['collection', 'load', 'bruno'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: 'principal-ade.bruno-panel:load-collection',
  },
};

/**
 * All tools exported as an array.
 */
export const brunoPanelTools: PanelTool[] = [
  sendRequestTool,
  selectRequestTool,
  loadCollectionTool,
];

/**
 * Panel tools metadata for registration.
 */
export const brunoPanelToolsMetadata: PanelToolsMetadata = {
  id: 'principal-ade.bruno-panel',
  name: 'Bruno API Client',
  description: 'Tools for interacting with the Bruno API client panel',
  tools: brunoPanelTools,
};
