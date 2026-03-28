import React from 'react';
import { BrunoPanel } from './panels/bruno/BrunoPanel';
import type { PanelDefinition, PanelContextValue, BrunoPanelContext, PanelComponentProps, PanelActions } from './types';
import { brunoPanelTools, brunoPanelToolsMetadata } from './tools';

// Re-export types for consumers
export type { BrunoRequest, BrunoResponse, BrunoPanelActions } from './types';

/**
 * Export array of panel definitions.
 */
export const panels: PanelDefinition[] = [
  {
    metadata: {
      id: 'principal-ade.bruno-panel',
      name: 'Bruno API Client',
      icon: '🔌',
      version: '0.1.0',
      author: 'Principal ADE',
      description: 'Bruno-compatible API client for testing HTTP requests',
      slices: ['fileTree'],
      tools: brunoPanelTools,
    },
    // Cast needed because BrunoPanelActions extends PanelActions with required methods
    component: BrunoPanel as React.ComponentType<PanelComponentProps<PanelActions, BrunoPanelContext>>,

    onMount: async (context: PanelContextValue<BrunoPanelContext>) => {
      console.log('Bruno Panel mounted', context.currentScope.repository?.path);
    },

    onUnmount: async (_context: PanelContextValue<BrunoPanelContext>) => {
      console.log('Bruno Panel unmounting');
    },
  },
];

export const onPackageLoad = async () => {
  console.log('Bruno Panel package loaded');
};

export const onPackageUnload = async () => {
  console.log('Bruno Panel package unloading');
};

export { brunoPanelTools, brunoPanelToolsMetadata } from './tools';
