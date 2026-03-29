import React, { useState, useCallback, useEffect } from 'react';
import { FolderOpen, Loader } from 'lucide-react';
import { useTheme } from '@principal-ade/industry-theme';
import { CollectionTree } from './components';
import type { PanelComponentProps, BrunoPanelActions, BrunoPanelContext, BrunoRequest, CollectionItem } from '../../types';

type CollectionPanelProps = PanelComponentProps<BrunoPanelActions, BrunoPanelContext>;

/**
 * Recursively extracts .bru file paths from a FileTree node
 */
function extractBruFilePaths(node: { path: string; name: string; children?: unknown[]; isDirectory?: boolean }): string[] {
  const paths: string[] = [];

  if (node.isDirectory === false && node.name.endsWith('.bru')) {
    paths.push(node.path);
  }

  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      paths.push(...extractBruFilePaths(child as { path: string; name: string; children?: unknown[]; isDirectory?: boolean }));
    }
  }

  return paths;
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

  const handleSelectItem = useCallback((item: CollectionItem) => {
    if (item.type === 'request') {
      setSelectedItem(item);
      // Emit event for RequestPanel
      events.emit({
        type: 'principal-ade.bruno:request-selected',
        source: 'collection-panel',
        timestamp: Date.now(),
        payload: { requestId: item.uid, request: item.request },
      });
    }
  }, [events]);

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
          padding: '12px',
          borderBottom: `1px solid ${theme.colors.border}`,
        }}
      >
        <FolderOpen size={16} color={theme.colors.primary} />
        <span style={{ fontSize: '13px', fontWeight: 600 }}>Collection</span>
      </div>

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
        ) : items.length === 0 ? (
          <div
            style={{
              padding: '24px',
              textAlign: 'center',
              color: theme.colors.textMuted,
              fontSize: '12px',
            }}
          >
            No requests found
          </div>
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
