import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useTheme } from '@principal-ade/industry-theme';

export interface RequestEditorProps {
  request: unknown;
  isSending: boolean;
  onSend: () => void;
}

type TabId = 'params' | 'headers' | 'body' | 'auth' | 'script';

const METHOD_COLORS: Record<string, string> = {
  GET: '#61affe',
  POST: '#49cc90',
  PUT: '#fca130',
  DELETE: '#f93e3e',
  PATCH: '#50e3c2',
  HEAD: '#9012fe',
  OPTIONS: '#0d5aa7',
};

export const RequestEditor: React.FC<RequestEditorProps> = ({
  request,
  isSending,
  onSend,
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabId>('params');

  // Extract request data from the parsed .bru file
  const parsed = request as {
    meta?: { name?: string };
    http?: { method?: string; url?: string; body?: string };
    headers?: Array<{ name: string; value: string; enabled: boolean }>;
    params?: Array<{ name: string; value: string; enabled: boolean; type: string }>;
    body?: { json?: string; text?: string; xml?: string };
    auth?: { mode?: string };
    script?: { req?: string; res?: string };
  } | null;

  const method = parsed?.http?.method?.toUpperCase() || 'GET';
  const url = parsed?.http?.url || '';
  const methodColor = METHOD_COLORS[method] || METHOD_COLORS.GET;

  const headers = parsed?.headers || [];
  const params = parsed?.params || [];
  const body = parsed?.body;
  const bodyContent = body?.json || body?.text || body?.xml || '';

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'params', label: 'Params', count: params.filter(p => p.enabled).length },
    { id: 'headers', label: 'Headers', count: headers.filter(h => h.enabled).length },
    { id: 'body', label: 'Body' },
    { id: 'auth', label: 'Auth' },
    { id: 'script', label: 'Script' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* URL Bar */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '12px',
          borderBottom: `1px solid ${theme.colors.border}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: theme.colors.backgroundSecondary,
            borderRadius: '6px',
            minWidth: '80px',
          }}
        >
          <span style={{ color: methodColor, fontWeight: 600, fontSize: '13px' }}>
            {method}
          </span>
        </div>

        <input
          type="text"
          value={url}
          readOnly
          placeholder="Enter URL"
          style={{
            flex: 1,
            padding: '8px 12px',
            background: theme.colors.backgroundSecondary,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '6px',
            color: theme.colors.text,
            fontSize: '13px',
            fontFamily: 'monospace',
          }}
        />

        <button
          onClick={onSend}
          disabled={isSending}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: isSending ? theme.colors.backgroundSecondary : theme.colors.primary,
            border: 'none',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 500,
            cursor: isSending ? 'not-allowed' : 'pointer',
            opacity: isSending ? 0.7 : 1,
          }}
        >
          <Send size={14} />
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          padding: '8px 12px',
          borderBottom: `1px solid ${theme.colors.border}`,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: activeTab === tab.id ? theme.colors.backgroundSecondary : 'transparent',
              border: 'none',
              borderRadius: '4px',
              color: activeTab === tab.id ? theme.colors.text : theme.colors.textMuted,
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                style={{
                  padding: '1px 6px',
                  background: theme.colors.primary,
                  borderRadius: '10px',
                  fontSize: '10px',
                  color: '#fff',
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
        {activeTab === 'params' && (
          <KeyValueTable items={params} emptyMessage="No parameters" theme={theme} />
        )}

        {activeTab === 'headers' && (
          <KeyValueTable items={headers} emptyMessage="No headers" theme={theme} />
        )}

        {activeTab === 'body' && (
          <div
            style={{
              height: '100%',
              background: theme.colors.backgroundSecondary,
              borderRadius: '6px',
              padding: '12px',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: theme.colors.text,
              whiteSpace: 'pre-wrap',
              overflow: 'auto',
            }}
          >
            {bodyContent || <span style={{ color: theme.colors.textMuted }}>No body</span>}
          </div>
        )}

        {activeTab === 'auth' && (
          <div style={{ color: theme.colors.textMuted, fontSize: '13px' }}>
            Auth mode: {parsed?.auth?.mode || 'none'}
          </div>
        )}

        {activeTab === 'script' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {parsed?.script?.req && (
              <div>
                <div style={{ fontSize: '11px', color: theme.colors.textMuted, marginBottom: '6px' }}>
                  Pre-request Script
                </div>
                <pre
                  style={{
                    padding: '12px',
                    background: theme.colors.backgroundSecondary,
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: theme.colors.text,
                    margin: 0,
                    overflow: 'auto',
                  }}
                >
                  {parsed.script.req}
                </pre>
              </div>
            )}
            {parsed?.script?.res && (
              <div>
                <div style={{ fontSize: '11px', color: theme.colors.textMuted, marginBottom: '6px' }}>
                  Post-response Script
                </div>
                <pre
                  style={{
                    padding: '12px',
                    background: theme.colors.backgroundSecondary,
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: theme.colors.text,
                    margin: 0,
                    overflow: 'auto',
                  }}
                >
                  {parsed.script.res}
                </pre>
              </div>
            )}
            {!parsed?.script?.req && !parsed?.script?.res && (
              <div style={{ color: theme.colors.textMuted, fontSize: '13px' }}>
                No scripts
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface KeyValueTableProps {
  items: Array<{ name: string; value: string; enabled: boolean }>;
  emptyMessage: string;
  theme: ReturnType<typeof useTheme>['theme'];
}

const KeyValueTable: React.FC<KeyValueTableProps> = ({ items, emptyMessage, theme }) => {
  if (items.length === 0) {
    return (
      <div style={{ color: theme.colors.textMuted, fontSize: '13px' }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
      <thead>
        <tr style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
          <th style={{ textAlign: 'left', padding: '8px', color: theme.colors.textMuted, fontWeight: 500, width: '30%' }}>
            Key
          </th>
          <th style={{ textAlign: 'left', padding: '8px', color: theme.colors.textMuted, fontWeight: 500 }}>
            Value
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr
            key={index}
            style={{
              borderBottom: `1px solid ${theme.colors.border}`,
              opacity: item.enabled ? 1 : 0.5,
            }}
          >
            <td style={{ padding: '8px', fontFamily: 'monospace', color: theme.colors.text }}>
              {item.name}
            </td>
            <td style={{ padding: '8px', fontFamily: 'monospace', color: theme.colors.text }}>
              {item.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
