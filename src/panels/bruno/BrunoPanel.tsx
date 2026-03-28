import React, { useState, useCallback } from 'react';
import { FolderOpen, AlertCircle } from 'lucide-react';
import { useTheme } from '@principal-ade/industry-theme';
import { CollectionTree, RequestEditor, ResponseViewer } from './components';
import type { CollectionItem } from './hooks/useBrunoCollection';
import type { PanelComponentProps, BrunoPanelActions, BrunoPanelContext, BrunoResponse } from '../../types';

type BrunoPanelProps = PanelComponentProps<BrunoPanelActions, BrunoPanelContext>;

// Demo collection for development
const demoCollection: CollectionItem[] = [
  {
    uid: 'folder-users',
    name: 'Users',
    type: 'folder',
    path: '/users',
    items: [
      {
        uid: 'get-users',
        name: 'Get All Users',
        type: 'request',
        path: '/users/get-users.bru',
        request: {
          meta: { name: 'Get All Users', type: 'http', seq: 1 },
          http: { method: 'get', url: 'https://api.example.com/users', body: 'none' },
          headers: [
            { name: 'Accept', value: 'application/json', enabled: true },
            { name: 'Authorization', value: 'Bearer {{token}}', enabled: true },
          ],
          params: [
            { name: 'page', value: '1', enabled: true, type: 'query' },
            { name: 'limit', value: '10', enabled: true, type: 'query' },
          ],
        },
      },
      {
        uid: 'get-user',
        name: 'Get User by ID',
        type: 'request',
        path: '/users/get-user.bru',
        request: {
          meta: { name: 'Get User by ID', type: 'http', seq: 2 },
          http: { method: 'get', url: 'https://api.example.com/users/:id', body: 'none' },
          headers: [{ name: 'Accept', value: 'application/json', enabled: true }],
          params: [{ name: 'id', value: '123', enabled: true, type: 'path' }],
        },
      },
      {
        uid: 'create-user',
        name: 'Create User',
        type: 'request',
        path: '/users/create-user.bru',
        request: {
          meta: { name: 'Create User', type: 'http', seq: 3 },
          http: { method: 'post', url: 'https://api.example.com/users', body: 'json' },
          headers: [
            { name: 'Content-Type', value: 'application/json', enabled: true },
          ],
          params: [],
          body: {
            json: JSON.stringify({ name: 'John Doe', email: 'john@example.com' }, null, 2),
          },
        },
      },
    ],
  },
  {
    uid: 'folder-auth',
    name: 'Auth',
    type: 'folder',
    path: '/auth',
    items: [
      {
        uid: 'login',
        name: 'Login',
        type: 'request',
        path: '/auth/login.bru',
        request: {
          meta: { name: 'Login', type: 'http', seq: 1 },
          http: { method: 'post', url: 'https://api.example.com/auth/login', body: 'json' },
          headers: [{ name: 'Content-Type', value: 'application/json', enabled: true }],
          params: [],
          body: {
            json: JSON.stringify({ email: '{{email}}', password: '{{password}}' }, null, 2),
          },
        },
      },
    ],
  },
  {
    uid: 'health-check',
    name: 'Health Check',
    type: 'request',
    path: '/health-check.bru',
    request: {
      meta: { name: 'Health Check', type: 'http', seq: 1 },
      http: { method: 'get', url: 'https://api.example.com/health', body: 'none' },
      headers: [],
      params: [],
    },
  },
];

export const BrunoPanel: React.FC<BrunoPanelProps> = ({
  context,
  actions,
  events,
}) => {
  const { theme } = useTheme();
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);
  const [response, setResponse] = useState<BrunoResponse | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use demo collection for now
  const [items] = useState<CollectionItem[]>(demoCollection);

  const handleSelectItem = useCallback((item: CollectionItem) => {
    if (item.type === 'request') {
      setSelectedItem(item);
      setResponse(null);
      setError(null);
      // Emit event for other panels
      events.emit({
        type: 'principal-ade.bruno-panel:request-selected',
        source: 'bruno-panel',
        timestamp: Date.now(),
        payload: { requestId: item.uid, request: item.request },
      });
    }
  }, [events]);

  const handleSendRequest = useCallback(async () => {
    if (!selectedItem?.request) return;

    setIsSending(true);
    setError(null);

    try {
      const result = await actions.sendRequest(selectedItem.request);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setIsSending(false);
    }
  }, [selectedItem, actions]);

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        background: theme.colors.background,
        color: theme.colors.text,
        fontFamily: theme.fonts.body,
      }}
    >
      {/* Sidebar - Collection Tree */}
      <div
        style={{
          width: '260px',
          minWidth: '200px',
          borderRight: `1px solid ${theme.colors.border}`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Sidebar Header */}
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
          <CollectionTree
            items={items}
            selectedItem={selectedItem}
            onSelectItem={handleSelectItem}
          />
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {selectedItem ? (
          <>
            {/* Request Editor */}
            <div style={{ flex: 1, minHeight: '200px', borderBottom: `1px solid ${theme.colors.border}` }}>
              <RequestEditor
                request={selectedItem.request}
                isSending={isSending}
                onSend={handleSendRequest}
              />
            </div>

            {/* Response Viewer */}
            <div style={{ flex: 1, minHeight: '200px' }}>
              {error ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    height: '100%',
                    color: '#f93e3e',
                    fontSize: '13px',
                  }}
                >
                  <AlertCircle size={16} />
                  {error}
                </div>
              ) : (
                <ResponseViewer response={response} isLoading={isSending} />
              )}
            </div>
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '12px',
              color: theme.colors.textMuted,
            }}
          >
            <FolderOpen size={48} strokeWidth={1} />
            <span style={{ fontSize: '14px' }}>Select a request to get started</span>
          </div>
        )}
      </div>
    </div>
  );
};
