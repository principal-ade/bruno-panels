import React from 'react';
import { CollectionPanel, RequestPanel } from './panels/bruno';
import type { PanelDefinition, PanelContextValue, BrunoPanelContext, PanelComponentProps, PanelActions } from './types';
import { brunoPanelTools, brunoPanelToolsMetadata } from './tools';

// Re-export types for consumers
export type { BrunoRequest, BrunoResponse, BrunoEnvironment, BrunoPanelActions } from './types';

/**
 * Export array of panel definitions.
 */
export const panels: PanelDefinition[] = [
  {
    metadata: {
      id: 'principal-ade.bruno-collection',
      name: 'Bruno Collection',
      icon: '📁',
      version: '0.1.0',
      author: 'Principal ADE',
      description: 'Tree view for browsing Bruno API collections',
      slices: ['fileTree'],
      tools: [],
    },
    component: CollectionPanel as React.ComponentType<PanelComponentProps<PanelActions, BrunoPanelContext>>,

    onMount: async (context: PanelContextValue<BrunoPanelContext>) => {
      console.log('Bruno Collection Panel mounted', context.currentScope.repository?.path);
    },

    onUnmount: async (_context: PanelContextValue<BrunoPanelContext>) => {
      console.log('Bruno Collection Panel unmounting');
    },
  },
  {
    metadata: {
      id: 'principal-ade.bruno-request',
      name: 'Bruno Request',
      icon: '🔌',
      version: '0.1.0',
      author: 'Principal ADE',
      description: 'Request editor and response viewer for Bruno API requests',
      slices: [],
      tools: brunoPanelTools,
    },
    component: RequestPanel as React.ComponentType<PanelComponentProps<PanelActions, BrunoPanelContext>>,

    onMount: async (context: PanelContextValue<BrunoPanelContext>) => {
      console.log('Bruno Request Panel mounted', context.currentScope.repository?.path);
    },

    onUnmount: async (_context: PanelContextValue<BrunoPanelContext>) => {
      console.log('Bruno Request Panel unmounting');
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
