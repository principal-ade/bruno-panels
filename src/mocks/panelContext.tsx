import React from 'react';
import { ThemeProvider } from '@principal-ade/industry-theme';
import type {
  PanelComponentProps,
  PanelContextValue,
  PanelEventEmitter,
  PanelEvent,
  PanelEventType,
  DataSlice,
  BrunoPanelActions,
  BrunoPanelContext,
  BrunoRequest,
  BrunoResponse,
  BrunoEnvironment,
  FileTree,
} from '../types';
import { mockBrunoRequests, mockBrunoFileTree, mockBrunoEnvironments } from './brunoData';

/**
 * Create a mock DataSlice
 */
const createMockSlice = <T,>(
  name: string,
  data: T,
  scope: 'workspace' | 'repository' | 'global' = 'repository'
): DataSlice<T> => ({
  scope,
  name,
  data,
  loading: false,
  error: null,
  refresh: async () => {
    // eslint-disable-next-line no-console
    console.log(`[Mock] Refreshing slice: ${name}`);
  },
});

/**
 * Mock Panel Actions for Storybook
 */
export const createMockActions = (
  overrides?: Partial<BrunoPanelActions>,
  brunoRequests: Record<string, BrunoRequest> = mockBrunoRequests
): BrunoPanelActions => ({
  openFile: (filePath: string) => {
    // eslint-disable-next-line no-console
    console.log('[Mock] Opening file:', filePath);
  },
  openGitDiff: (filePath: string, status) => {
    // eslint-disable-next-line no-console
    console.log('[Mock] Opening git diff:', filePath, status);
  },
  navigateToPanel: (panelId: string) => {
    // eslint-disable-next-line no-console
    console.log('[Mock] Navigating to panel:', panelId);
  },
  notifyPanels: (event) => {
    // eslint-disable-next-line no-console
    console.log('[Mock] Notifying panels:', event);
  },
  readFile: async (path: string) => {
    // eslint-disable-next-line no-console
    console.log('[Mock] Reading file:', path);
    return '// Mock file content';
  },
  loadBruRequest: async (path: string) => {
    // eslint-disable-next-line no-console
    console.log('[Mock] Loading Bruno request:', path);
    const request = brunoRequests[path];
    if (request) {
      return request;
    }
    throw new Error(`Mock request not found: ${path}`);
  },
  loadEnvironments: async (collectionPath: string): Promise<BrunoEnvironment[]> => {
    // eslint-disable-next-line no-console
    console.log('[Mock] Loading environments for:', collectionPath);
    return mockBrunoEnvironments;
  },
  writeFile: async (path: string, content: string) => {
    // eslint-disable-next-line no-console
    console.log('[Mock] Writing file:', path, content.length, 'chars');
  },
  deleteFile: async (path: string) => {
    // eslint-disable-next-line no-console
    console.log('[Mock] Deleting file:', path);
  },
  exists: async (path: string) => {
    // eslint-disable-next-line no-console
    console.log('[Mock] Checking exists:', path);
    return true;
  },
  sendRequest: async (request: BrunoRequest, environment?: Record<string, string>): Promise<BrunoResponse> => {
    // eslint-disable-next-line no-console
    console.log('[Mock] Sending request:', request.http?.method, request.http?.url, environment);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      status: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'application/json',
        'x-request-id': 'mock-123',
      },
      data: { message: 'Mock response from Storybook', timestamp: Date.now() },
      responseTime: 123,
      size: 256,
    };
  },
  ...overrides,
});

/**
 * Mock Event Emitter for Storybook
 */
export const createMockEvents = (): PanelEventEmitter => {
  const handlers = new Map<
    PanelEventType,
    Set<(event: PanelEvent<unknown>) => void>
  >();

  return {
    emit: (event) => {
      // eslint-disable-next-line no-console
      console.log('[Mock] Emitting event:', event);
      const eventHandlers = handlers.get(event.type);
      if (eventHandlers) {
        eventHandlers.forEach((handler) => handler(event));
      }
    },
    on: (type, handler) => {
      // eslint-disable-next-line no-console
      console.log('[Mock] Subscribing to event:', type);
      if (!handlers.has(type)) {
        handlers.set(type, new Set());
      }
      handlers.get(type)!.add(handler as (event: PanelEvent<unknown>) => void);

      // Return cleanup function
      return () => {
        // eslint-disable-next-line no-console
        console.log('[Mock] Unsubscribing from event:', type);
        handlers
          .get(type)
          ?.delete(handler as (event: PanelEvent<unknown>) => void);
      };
    },
    off: (type, handler) => {
      // eslint-disable-next-line no-console
      console.log('[Mock] Removing event handler:', type);
      handlers
        .get(type)
        ?.delete(handler as (event: PanelEvent<unknown>) => void);
    },
  };
};

/**
 * Mock Bruno Panel Context for Storybook
 * Includes fileTree slice for Bruno collection discovery
 */
export const createMockBrunoContext = (
  fileTree: FileTree = mockBrunoFileTree,
  overrides?: Partial<PanelContextValue<BrunoPanelContext>>
): PanelContextValue<BrunoPanelContext> => {
  const defaultContext: PanelContextValue<BrunoPanelContext> = {
    currentScope: {
      type: 'repository',
      workspace: {
        name: 'my-workspace',
        path: '/Users/developer/my-workspace',
      },
      repository: {
        name: 'collection',
        path: '/collection',
      },
    },
    fileTree: createMockSlice('fileTree', fileTree),
    refresh: async (
      scope?: 'workspace' | 'repository',
      slice?: string
    ): Promise<void> => {
      // eslint-disable-next-line no-console
      console.log('[Mock] Bruno context refresh called', { scope, slice });
    },
  };

  return { ...defaultContext, ...overrides };
};

/**
 * Mock Bruno Panel Props Provider
 * Wraps BrunoPanel with mock context including fileTree and ThemeProvider
 */
export const MockBrunoPanelProvider: React.FC<{
  children: (props: PanelComponentProps<BrunoPanelActions, BrunoPanelContext>) => React.ReactNode;
  fileTree?: FileTree;
  brunoRequests?: Record<string, BrunoRequest>;
  contextOverrides?: Partial<PanelContextValue<BrunoPanelContext>>;
  actionsOverrides?: Partial<BrunoPanelActions>;
}> = ({ children, fileTree, brunoRequests, contextOverrides, actionsOverrides }) => {
  const context = createMockBrunoContext(fileTree, contextOverrides);
  const actions = createMockActions(actionsOverrides, brunoRequests);
  const events = createMockEvents();

  return <ThemeProvider>{children({ context, actions, events })}</ThemeProvider>;
};
