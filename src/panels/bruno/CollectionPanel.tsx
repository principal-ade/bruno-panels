import React, { useState, useCallback, useEffect } from 'react';
import { FolderOpen, Loader, HelpCircle } from 'lucide-react';
import { useTheme } from '@principal-ade/industry-theme';
import { CollectionHelp, CollectionTree, EnvironmentSelector } from './components';
import type { PanelComponentProps, BrunoPanelActions, BrunoPanelContext, BrunoRequest, BrunoEnvironment, CollectionItem } from '../../types';

type CollectionPanelProps = PanelComponentProps<BrunoPanelActions, BrunoPanelContext>;

type FileTreeNode = { path: string; name: string; children?: unknown[]; isDirectory?: boolean };

/**
 * Recursively extracts .bru file paths from a FileTree node
 */
function extractBruFilePaths(node: FileTreeNode): string[] {
  const paths: string[] = [];

  if (node.isDirectory === false && node.name.endsWith('.bru')) {
    paths.push(node.path);
  }

  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      paths.push(...extractBruFilePaths(child as FileTreeNode));
    }
  }

  return paths;
}

/**
 * Find the Bruno collection path by locating bruno.json
 */
function findBrunoCollectionPath(node: FileTreeNode): string | null {
  // Check if this directory contains bruno.json
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      const childNode = child as FileTreeNode;
      if (childNode.isDirectory === false && childNode.name === 'bruno.json') {
        // Found bruno.json, return the parent directory path
        return node.path;
      }
    }
    // Recursively check subdirectories
    for (const child of node.children) {
      const childNode = child as FileTreeNode;
      if (childNode.isDirectory !== false) {
        const result = findBrunoCollectionPath(childNode);
        if (result) return result;
      }
    }
  }
  return null;
}

/**
 * Build collection tree from parsed requests
 */
function buildCollectionTree(
  basePath: string,
  requests: Array<{ path: string; request: BrunoRequest }>
): CollectionItem[] {
  const items: CollectionItem[] = [];
  const folders = new Map<string, CollectionItem>();

  // Sort by path for consistent ordering
  const sorted = [...requests].sort((a, b) => a.path.localeCompare(b.path));

  for (const { path: filePath, request } of sorted) {
    const relativePath = filePath.replace(basePath + '/', '');
    const parts = relativePath.split('/');
    const fileName = parts[parts.length - 1];
    const name = request.meta?.name || fileName.replace('.bru', '');

    const item: CollectionItem = {
      uid: filePath,
      name,
      type: 'request',
      path: filePath,
      request,
    };

    // Handle nested folders
    if (parts.length > 1) {
      let currentPath = basePath;
      let parentItems = items;

      for (let i = 0; i < parts.length - 1; i++) {
        currentPath += '/' + parts[i];

        if (!folders.has(currentPath)) {
          const folder: CollectionItem = {
            uid: currentPath,
            name: parts[i],
            type: 'folder',
            path: currentPath,
            items: [],
          };
          folders.set(currentPath, folder);
          parentItems.push(folder);
        }

        parentItems = folders.get(currentPath)!.items!;
      }

      parentItems.push(item);
    } else {
      items.push(item);
    }
  }

  return items;
}

/**
 * CollectionPanel displays a tree view of Bruno API requests.
 * Emits 'principal-ade.bruno:request-selected' when a request is selected.
 */
export const CollectionPanel: React.FC<CollectionPanelProps> = ({
  context,
  actions,
  events,
}) => {
  const { theme } = useTheme();
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [environments, setEnvironments] = useState<BrunoEnvironment[]>([]);
  const [selectedEnvironment, setSelectedEnvironment] = useState<BrunoEnvironment | null>(null);

  // Load collection from fileTree context
  useEffect(() => {
    const loadCollection = async () => {
      const fileTree = context.fileTree?.data;
      if (!fileTree) return;

      setIsLoading(true);
      setError(null);

      try {
        // Extract .bru file paths from the fileTree
        const bruFilePaths = extractBruFilePaths(fileTree.root);

        // Load and parse each file via host action
        const requests: Array<{ path: string; request: BrunoRequest }> = [];

        for (const filePath of bruFilePaths) {
          try {
            const request = await actions.loadBruRequest(filePath);
            requests.push({ path: filePath, request });
          } catch (err) {
            // eslint-disable-next-line no-console
            console.warn(`Failed to load ${filePath}:`, err);
          }
        }

        // Build the collection tree
        const basePath = fileTree.root.path;
        const tree = buildCollectionTree(basePath, requests);
        setItems(tree);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load collection');
      } finally {
        setIsLoading(false);
      }
    };

    loadCollection();
  }, [context.fileTree?.data, actions]);

  // Load environments from environments folder
  useEffect(() => {
    const loadEnvironments = async () => {
      const fileTree = context.fileTree?.data;
      if (!fileTree) return;

      try {
        // Find the Bruno collection path (where bruno.json is located)
        const collectionPath = findBrunoCollectionPath(fileTree.root) || fileTree.root.path;
        const envs = await actions.loadEnvironments(collectionPath);
        setEnvironments(envs);

        // Auto-select first environment and emit event
        if (envs.length > 0) {
          const firstEnv = envs[0];
          setSelectedEnvironment(firstEnv);

          const envVars: Record<string, string> = {};
          for (const v of firstEnv.variables) {
            if (v.enabled) {
              envVars[v.name] = v.value;
            }
          }

          events.emit({
            type: 'principal-ade.bruno:environment-changed',
            source: 'collection-panel',
            timestamp: Date.now(),
            payload: { environment: envVars, environmentName: firstEnv.name },
          });
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Failed to load environments:', err);
      }
    };

    loadEnvironments();
  }, [context.fileTree?.data, actions, events]);

  // Emit environment change event
  const handleEnvironmentChange = useCallback((env: BrunoEnvironment | null) => {
    setSelectedEnvironment(env);

    // Convert environment variables to Record<string, string>
    const envVars: Record<string, string> = {};
    if (env) {
      for (const v of env.variables) {
        if (v.enabled) {
          envVars[v.name] = v.value;
        }
      }
    }

    events.emit({
      type: 'principal-ade.bruno:environment-changed',
      source: 'collection-panel',
      timestamp: Date.now(),
      payload: { environment: envVars, environmentName: env?.name || null },
    });
  }, [events]);

  const handleSelectItem = useCallback((item: CollectionItem) => {
    if (item.type === 'request') {
      setSelectedItem(item);

      // Build environment vars
      const envVars: Record<string, string> = {};
      if (selectedEnvironment) {
        for (const v of selectedEnvironment.variables) {
          if (v.enabled) {
            envVars[v.name] = v.value;
          }
        }
      }

      // Emit event for RequestPanel with environment included
      events.emit({
        type: 'principal-ade.bruno:request-selected',
        source: 'collection-panel',
        timestamp: Date.now(),
        payload: {
          requestId: item.uid,
          request: item.request,
          environment: envVars,
          environmentName: selectedEnvironment?.name || null,
        },
      });
    }
  }, [events, selectedEnvironment]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: theme.colors.background,
        color: theme.colors.text,
        fontFamily: theme.fonts.body,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          height: '40px',
          paddingLeft: '12px',
          paddingRight: '12px',
          boxSizing: 'border-box',
          borderBottom: `1px solid ${theme.colors.border}`,
        }}
      >
        <FolderOpen size={16} color={theme.colors.primary} />
        <span style={{ fontSize: '13px', fontWeight: 600, flex: 1 }}>Collection</span>
        {items.length > 0 && (
          <button
            onClick={() => setShowHelp(!showHelp)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              background: showHelp ? theme.colors.muted : 'transparent',
              border: 'none',
              borderRadius: '4px',
              color: theme.colors.textMuted,
              cursor: 'pointer',
            }}
            title="Help"
          >
            <HelpCircle size={16} />
          </button>
        )}
      </div>

      {/* Environment Selector */}
      {environments.length > 0 && (
        <EnvironmentSelector
          environments={environments}
          selectedEnvironment={selectedEnvironment}
          onSelectEnvironment={handleEnvironmentChange}
        />
      )}

      {/* Tree */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {isLoading ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              color: theme.colors.textMuted,
            }}
          >
            <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : error ? (
          <div
            style={{
              padding: '24px',
              textAlign: 'center',
              color: '#f93e3e',
              fontSize: '12px',
            }}
          >
            {error}
          </div>
        ) : showHelp || items.length === 0 ? (
          <CollectionHelp />
        ) : (
          <CollectionTree
            items={items}
            selectedItem={selectedItem}
            onSelectItem={handleSelectItem}
          />
        )}
      </div>
    </div>
  );
};
