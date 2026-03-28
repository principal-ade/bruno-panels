/**
 * Panel Extension Type Definitions
 *
 * Re-exports core types from @principal-ade/panel-framework-core
 */

// Re-export all core types from panel-framework-core
export type {
  // Core data types
  DataSlice,
  WorkspaceMetadata,
  RepositoryMetadata,
  FileTreeSource,
  ActiveFileSlice,

  // Event system
  PanelEventType,
  PanelEvent,
  PanelEventEmitter,

  // Panel interface
  PanelActions,
  PanelContextValue,
  PanelComponentProps,

  // Panel definition
  PanelMetadata,
  PanelLifecycleHooks,
  PanelDefinition,
  PanelModule,

  // Registry types
  PanelRegistryEntry,
  PanelLoader,
  PanelRegistryConfig,

  // Tool types (UTCP-compatible)
  PanelTool,
  PanelToolsMetadata,
  JsonSchema,
  PanelEventCallTemplate,

  // Common slice context types
  FileTreeContext,
  ActiveFileContext,
  CommonPanelContext,
} from '@principal-ade/panel-framework-core';

import type { DataSlice, FileTree, PanelActions } from '@principal-ade/panel-framework-core';

/**
 * Git status data structure for this panel
 */
export interface GitStatusData {
  staged: string[];
  unstaged: string[];
  untracked: string[];
  deleted: string[];
}

/**
 * Context type for the Example Panel
 * Defines the data slices this panel expects
 */
export interface ExamplePanelContext {
  git?: DataSlice<GitStatusData>;
}

/**
 * Bruno request structure from parsed .bru files
 * Based on @usebruno/lang output structure
 */
export interface BrunoRequest {
  meta?: {
    name: string;
    type: string;
    seq?: number;
  };
  http: {
    method: string;
    url: string;
    body?: string;
  };
  headers?: Array<{ name: string; value: string; enabled: boolean }>;
  params?: Array<{
    name: string;
    value: string;
    enabled: boolean;
    type: string;
  }>;
  body?: {
    json?: string;
    text?: string;
    xml?: string;
    formUrlEncoded?: Array<{ name: string; value: string; enabled: boolean }>;
    multipartForm?: Array<{
      name: string;
      value: string;
      enabled: boolean;
      type: string;
    }>;
  };
  auth?: {
    mode?: string;
    basic?: { username: string; password: string };
    bearer?: { token: string };
  };
}

/**
 * Bruno Response from executing a request
 */
export interface BrunoResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  responseTime: number;
  size: number;
}

/**
 * Context type for the Bruno Panel
 */
export interface BrunoPanelContext {
  fileTree?: DataSlice<FileTree>;
}

/**
 * Actions available to the Bruno Panel
 * Extends PanelActions with Bruno-specific actions
 */
export interface BrunoPanelActions extends PanelActions {
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  exists: (path: string) => Promise<boolean>;
  sendRequest: (request: BrunoRequest, environment?: Record<string, string>) => Promise<BrunoResponse>;
}
