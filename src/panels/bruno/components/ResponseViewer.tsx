import React, { useState } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import type { BrunoResponse } from '../../../types';

export interface ResponseViewerProps {
  response: BrunoResponse | null;
  isLoading: boolean;
}

type TabId = 'body' | 'headers';

const getStatusColor = (status: number): string => {
  if (status >= 200 && status < 300) return '#49cc90';
  if (status >= 300 && status < 400) return '#fca130';
  if (status >= 400 && status < 500) return '#f93e3e';
  if (status >= 500) return '#f93e3e';
  return '#888';
};

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatJson = (data: unknown): string => {
  try {
    if (typeof data === 'string') {
      const parsed = JSON.parse(data);
      return JSON.stringify(parsed, null, 2);
    }
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
};

export const ResponseViewer: React.FC<ResponseViewerProps> = ({
  response,
  isLoading,
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabId>('body');

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: theme.colors.textMuted,
          fontSize: '13px',
        }}
      >
        Sending request...
      </div>
    );
  }

  if (!response) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: theme.colors.textMuted,
          fontSize: '13px',
        }}
      >
        Send a request to see the response
      </div>
    );
  }

  const statusColor = getStatusColor(response.status);
  const headerCount = Object.keys(response.headers).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Status Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '12px',
          borderBottom: `1px solid ${theme.colors.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '4px 8px',
              background: statusColor,
              borderRadius: '4px',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {response.status}
          </span>
          <span style={{ color: theme.colors.text, fontSize: '13px' }}>
            {response.statusText}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: theme.colors.textMuted }}>
          <span>Time: {response.responseTime}ms</span>
          <span>Size: {formatSize(response.size)}</span>
        </div>
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
        <button
          onClick={() => setActiveTab('body')}
          style={{
            padding: '6px 12px',
            background: activeTab === 'body' ? theme.colors.backgroundSecondary : 'transparent',
            border: 'none',
            borderRadius: '4px',
            color: activeTab === 'body' ? theme.colors.text : theme.colors.textMuted,
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Body
        </button>
        <button
          onClick={() => setActiveTab('headers')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: activeTab === 'headers' ? theme.colors.backgroundSecondary : 'transparent',
            border: 'none',
            borderRadius: '4px',
            color: activeTab === 'headers' ? theme.colors.text : theme.colors.textMuted,
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Headers
          <span
            style={{
              padding: '1px 6px',
              background: theme.colors.primary,
              borderRadius: '10px',
              fontSize: '10px',
              color: '#fff',
            }}
          >
            {headerCount}
          </span>
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
        {activeTab === 'body' && (
          <pre
            style={{
              margin: 0,
              padding: '12px',
              background: theme.colors.backgroundSecondary,
              borderRadius: '6px',
              fontSize: '12px',
              fontFamily: 'monospace',
              color: theme.colors.text,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {formatJson(response.data)}
          </pre>
        )}

        {activeTab === 'headers' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                <th style={{ textAlign: 'left', padding: '8px', color: theme.colors.textMuted, fontWeight: 500, width: '30%' }}>
                  Header
                </th>
                <th style={{ textAlign: 'left', padding: '8px', color: theme.colors.textMuted, fontWeight: 500 }}>
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(response.headers).map(([key, value]) => (
                <tr key={key} style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                  <td style={{ padding: '8px', fontFamily: 'monospace', color: theme.colors.text }}>
                    {key}
                  </td>
                  <td style={{ padding: '8px', fontFamily: 'monospace', color: theme.colors.text }}>
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
