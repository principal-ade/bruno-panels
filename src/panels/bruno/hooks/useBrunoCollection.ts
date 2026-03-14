import { useState, useCallback } from 'react';
import { bruToJsonV2, bruToEnvJsonV2 } from '@usebruno/lang';
import type { BrunoResponse, BrunoPanelActions } from '../types';

export interface CollectionItem {
  uid: string;
  name: string;
  type: 'folder' | 'request';
  path: string;
  request?: unknown;
  items?: CollectionItem[];
}

export interface CollectionState {
  name: string;
  path: string;
  items: CollectionItem[];
  environments: Array<{ name: string; variables: Array<{ name: string; value: string; enabled: boolean }> }>;
}

export interface UseBrunoCollectionOptions {
  actions: BrunoPanelActions;
  collectionPath: string;
}

export interface UseBrunoCollectionResult {
  collection: CollectionState | null;
  selectedItem: CollectionItem | null;
  response: BrunoResponse | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  loadCollection: () => Promise<void>;
  selectItem: (item: CollectionItem) => void;
  sendRequest: (item: CollectionItem) => Promise<void>;
  parseRequest: (content: string) => unknown;
}

/**
 * Hook for managing Bruno collection state
 */
export function useBrunoCollection(options: UseBrunoCollectionOptions): UseBrunoCollectionResult {
  const { actions, collectionPath } = options;

  const [collection, setCollection] = useState<CollectionState | null>(null);
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);
  const [response, setResponse] = useState<BrunoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Parse a .bru file content into a request object
   */
  const parseRequest = useCallback((content: string): unknown => {
    try {
      return bruToJsonV2(content);
    } catch (err) {
      console.error('Failed to parse .bru file:', err);
      return null;
    }
  }, []);

  /**
   * Parse an environment .bru file
   */
  const parseEnvironment = useCallback((content: string) => {
    try {
      return bruToEnvJsonV2(content);
    } catch (err) {
      console.error('Failed to parse environment file:', err);
      return null;
    }
  }, []);

  /**
   * Build collection tree from file paths
   */
  const buildCollectionTree = useCallback(async (basePath: string, filePaths: string[]): Promise<CollectionItem[]> => {
    const items: CollectionItem[] = [];
    const folders = new Map<string, CollectionItem>();

    // Filter to .bru files only and sort
    const bruFiles = filePaths
      .filter(p => p.endsWith('.bru') && !p.includes('/environments/'))
      .sort();

    for (const filePath of bruFiles) {
      const relativePath = filePath.replace(basePath + '/', '');
      const parts = relativePath.split('/');
      const fileName = parts[parts.length - 1];
      const name = fileName.replace('.bru', '');

      // Read and parse the file
      let request: unknown = null;
      try {
        const content = await actions.readFile(filePath);
        request = parseRequest(content);
      } catch (err) {
        console.warn(`Failed to read ${filePath}:`, err);
      }

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
  }, [actions, parseRequest]);

  /**
   * Load collection from the specified path
   */
  const loadCollection = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // For now, we'll need the file list passed in or discovered
      // This is a simplified version - in practice you'd scan the directory
      const collectionName = collectionPath.split('/').pop() || 'Collection';

      setCollection({
        name: collectionName,
        path: collectionPath,
        items: [],
        environments: [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collection');
    } finally {
      setIsLoading(false);
    }
  }, [collectionPath]);

  /**
   * Select an item in the collection
   */
  const selectItem = useCallback((item: CollectionItem) => {
    setSelectedItem(item);
    setResponse(null);
  }, []);

  /**
   * Send the request for the given item
   */
  const sendRequest = useCallback(async (item: CollectionItem) => {
    if (!item.request) {
      setError('No request data available');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const result = await actions.sendRequest(item.request);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setIsSending(false);
    }
  }, [actions]);

  return {
    collection,
    selectedItem,
    response,
    isLoading,
    isSending,
    error,
    loadCollection,
    selectItem,
    sendRequest,
    parseRequest,
  };
}
