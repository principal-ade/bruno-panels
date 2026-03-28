import React from 'react';
import { ThemeProvider } from '@principal-ade/industry-theme';
import type {
  PanelComponentProps,
  PanelContextValue,
  PanelEventEmitter,
  PanelEvent,
  PanelEventType,
  DataSlice,
  ExamplePanelContext,
  BrunoPanelActions,
  BrunoRequest,
  BrunoResponse,
} from '../types';

/**
 * Mock Git Status data for Storybook
 */
const mockGitStatusData = {
  staged: ['src/components/Button.tsx', 'src/styles/theme.css'],
  unstaged: ['README.md', 'package.json'],
  untracked: ['src/new-feature.tsx'],
  deleted: [],
};

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
 * Mock Panel Context for Storybook
 * Updated for panel-framework-core v0.5.x API where slices are typed on context
 */
export const createMockContext = (
  overrides?: Partial<PanelContextValue<ExamplePanelContext>>
): PanelContextValue<ExamplePanelContext> => {
  const defaultContext: PanelContextValue<ExamplePanelContext> = {
    currentScope: {
      type: 'repository',
      workspace: {
        name: 'my-workspace',
        path: '/Users/developer/my-workspace',
      },
      repository: {
        name: 'my-project',
        path: '/Users/developer/my-project',
      },
    },
    // v0.5.x API: slices are typed directly on the context
    git: createMockSlice('git', mockGitStatusData),
    refresh: async (
      scope?: 'workspace' | 'repository',
      slice?: string
    ): Promise<void> => {
      // eslint-disable-next-line no-console
      console.log('[Mock] Context refresh called', { scope, slice });
    },
  };

  return { ...defaultContext, ...overrides };
};

/**
 * Mock Panel Actions for Storybook
 */
export const createMockActions = (
  overrides?: Partial<BrunoPanelActions>
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
 * Mock Panel Props Provider
 * Wraps components with mock context and ThemeProvider for Storybook
 */
export const MockPanelProvider: React.FC<{
  children: (props: PanelComponentProps<BrunoPanelActions, ExamplePanelContext>) => React.ReactNode;
  contextOverrides?: Partial<PanelContextValue<ExamplePanelContext>>;
  actionsOverrides?: Partial<BrunoPanelActions>;
}> = ({ children, contextOverrides, actionsOverrides }) => {
  const context = createMockContext(contextOverrides);
  const actions = createMockActions(actionsOverrides);
  const events = createMockEvents();

  return <ThemeProvider>{children({ context, actions, events })}</ThemeProvider>;
};
