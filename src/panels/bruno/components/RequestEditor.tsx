import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useTheme } from '@principal-ade/industry-theme';
import type { BrunoRequest } from '../../../types';
import { paneHeaderStyle, paneTabsStyle } from './paneLayout';

export interface RequestEditorProps {
  request: BrunoRequest;
  isSending: boolean;
  onSend: () => void;
  onChange?: (request: BrunoRequest) => void;
  /** Optional host controls displayed next to Send. */
  headerActions?: React.ReactNode;
}

type TabId = 'params' | 'headers' | 'body' | 'auth' | 'script';
type BodyMode = keyof NonNullable<BrunoRequest['body']> | 'none';
type Entry = { name: string; value: string; enabled: boolean; type?: string };

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

export const RequestEditor: React.FC<RequestEditorProps> = ({
  request,
  isSending,
  onSend,
  onChange,
  headerActions,
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabId>('params');
  const fieldStyle: React.CSSProperties = {
    padding: '8px 10px',
    background: theme.colors.backgroundSecondary,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '4px',
    color: theme.colors.text,
    fontFamily: 'monospace',
    fontSize: '13px',
    minWidth: 0,
  };
  const buttonStyle: React.CSSProperties = {
    ...fieldStyle,
    cursor: 'pointer',
    fontFamily: theme.fonts.body,
  };
  const method = request.http.method.toUpperCase();
  const bodyMode: BodyMode =
    (
      Object.keys(request.body ?? {}) as Array<
        keyof NonNullable<BrunoRequest['body']>
      >
    ).find((key) => request.body?.[key] !== undefined) ?? 'none';
  const change = (patch: Partial<BrunoRequest>) =>
    onChange?.({ ...request, ...patch });
  const changeBody = (mode: BodyMode) => {
    const value = mode === 'none' ? undefined : request.body?.[mode];
    change({
      http: { ...request.http, body: mode === 'none' ? undefined : mode },
      body:
        mode === 'none'
          ? undefined
          : {
              [mode]:
                value ??
                (mode === 'formUrlEncoded' || mode === 'multipartForm'
                  ? []
                  : ''),
            },
    });
  };

  const renderEntries = (
    label: string,
    entries: Entry[],
    update: (entries: Entry[]) => void,
    types?: string[]
  ) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {entries.length === 0 && (
        <span style={{ color: theme.colors.textMuted }}>
          No {label.toLowerCase()}
        </span>
      )}
      {entries.map((entry, index) => (
        <div
          key={index}
          style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          <input
            type="checkbox"
            aria-label={`${label} ${index + 1} enabled`}
            checked={entry.enabled}
            onChange={(event) =>
              update(
                entries.map((item, i) =>
                  i === index
                    ? { ...item, enabled: event.target.checked }
                    : item
                )
              )
            }
          />
          <input
            aria-label={`${label} ${index + 1} name`}
            placeholder="Name"
            value={entry.name}
            style={{ ...fieldStyle, flex: 1 }}
            onChange={(event) =>
              update(
                entries.map((item, i) =>
                  i === index ? { ...item, name: event.target.value } : item
                )
              )
            }
          />
          <input
            aria-label={`${label} ${index + 1} value`}
            placeholder="Value"
            value={entry.value}
            style={{ ...fieldStyle, flex: 2 }}
            onChange={(event) =>
              update(
                entries.map((item, i) =>
                  i === index ? { ...item, value: event.target.value } : item
                )
              )
            }
          />
          {types && (
            <select
              aria-label={`${label} ${index + 1} type`}
              value={entry.type ?? types[0]}
              style={fieldStyle}
              onChange={(event) =>
                update(
                  entries.map((item, i) =>
                    i === index ? { ...item, type: event.target.value } : item
                  )
                )
              }
            >
              {types.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          )}
          <button
            type="button"
            aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
            style={buttonStyle}
            onClick={() => update(entries.filter((_, i) => i !== index))}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        style={{ ...buttonStyle, alignSelf: 'flex-start' }}
        onClick={() =>
          update([
            ...entries,
            {
              name: '',
              value: '',
              enabled: true,
              ...(types ? { type: types[0] } : {}),
            },
          ])
        }
      >
        Add {label.toLowerCase()}
      </button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        data-testid="request-header"
        style={{
          ...paneHeaderStyle,
          display: 'flex',
          gap: '8px',
          padding: '12px',
          borderBottom: `1px solid ${theme.colors.border}`,
        }}
      >
        <select
          aria-label="Request method"
          value={method}
          disabled={isSending || !onChange}
          style={{ ...fieldStyle, fontWeight: 600 }}
          onChange={(event) =>
            change({ http: { ...request.http, method: event.target.value } })
          }
        >
          {[...new Set([...METHODS, method])].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <input
          aria-label="Request URL"
          value={request.http.url}
          readOnly={!onChange}
          disabled={isSending}
          placeholder="https://api.example.com"
          style={{ ...fieldStyle, flex: 1 }}
          onChange={(event) =>
            change({ http: { ...request.http, url: event.target.value } })
          }
        />
        <button
          type="button"
          onClick={onSend}
          disabled={isSending || !request.http.url.trim()}
          style={{
            ...buttonStyle,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: theme.colors.primary,
            color: '#fff',
            opacity: isSending ? 0.7 : 1,
          }}
        >
          <Send size={14} />
          {isSending ? 'Sending...' : 'Send'}
        </button>
        {headerActions}
      </div>
      <div
        role="tablist"
        aria-label="Request sections"
        data-testid="request-tabs"
        style={{
          ...paneTabsStyle,
          display: 'flex',
          gap: '4px',
          padding: '8px 12px',
          borderBottom: `1px solid ${theme.colors.border}`,
        }}
      >
        {(['params', 'headers', 'body', 'auth', 'script'] as const).map(
          (tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              style={{
                ...buttonStyle,
                background:
                  activeTab === tab
                    ? theme.colors.backgroundSecondary
                    : 'transparent',
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab[0].toUpperCase() + tab.slice(1)}
            </button>
          )
        )}
      </div>
      <fieldset
        disabled={isSending || !onChange}
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          padding: '12px',
          margin: 0,
          border: 'none',
        }}
      >
        {activeTab === 'params' &&
          renderEntries(
            'Parameter',
            request.params ?? [],
            (entries) =>
              change({
                params: entries.map((entry) => ({
                  ...entry,
                  type: entry.type ?? 'query',
                })),
              }),
            ['query', 'path']
          )}
        {activeTab === 'headers' &&
          renderEntries('Header', request.headers ?? [], (headers) =>
            change({ headers })
          )}
        {activeTab === 'body' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              height: '100%',
            }}
          >
            <select
              aria-label="Body type"
              value={bodyMode}
              style={{ ...fieldStyle, alignSelf: 'flex-start' }}
              onChange={(event) => changeBody(event.target.value as BodyMode)}
            >
              <option value="none">None</option>
              <option value="json">JSON</option>
              <option value="text">Text</option>
              <option value="xml">XML</option>
              <option value="formUrlEncoded">Form URL encoded</option>
              <option value="multipartForm">Multipart form</option>
            </select>
            {bodyMode === 'none' ? (
              <span style={{ color: theme.colors.textMuted }}>No body</span>
            ) : bodyMode === 'formUrlEncoded' ||
              bodyMode === 'multipartForm' ? (
              <>
                {bodyMode === 'multipartForm' && (
                  <span style={{ color: theme.colors.textMuted }}>
                    Sending multipart requests requires host support.
                  </span>
                )}
                {renderEntries(
                  'Field',
                  request.body?.[bodyMode] ?? [],
                  (entries) => change({ body: { [bodyMode]: entries } }),
                  bodyMode === 'multipartForm' ? ['text', 'file'] : undefined
                )}
              </>
            ) : (
              <textarea
                aria-label="Request body"
                spellCheck={false}
                value={request.body?.[bodyMode] ?? ''}
                style={{
                  ...fieldStyle,
                  flex: 1,
                  minHeight: '100px',
                  resize: 'vertical',
                }}
                onChange={(event) =>
                  change({ body: { [bodyMode]: event.target.value } })
                }
              />
            )}
          </div>
        )}
        {activeTab === 'auth' && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <label>
              Authentication{' '}
              <select
                aria-label="Authentication"
                value={request.auth?.mode ?? 'none'}
                style={fieldStyle}
                onChange={(event) =>
                  change({
                    auth: { ...request.auth, mode: event.target.value },
                  })
                }
              >
                {[
                  ...new Set([
                    'none',
                    'basic',
                    'bearer',
                    request.auth?.mode ?? 'none',
                  ]),
                ].map((mode) => (
                  <option key={mode}>{mode}</option>
                ))}
              </select>
            </label>
            {request.auth?.mode === 'basic' && (
              <>
                <label>
                  Username{' '}
                  <input
                    aria-label="Username"
                    autoComplete="off"
                    style={fieldStyle}
                    value={request.auth.basic?.username ?? ''}
                    onChange={(event) =>
                      change({
                        auth: {
                          ...request.auth,
                          basic: {
                            username: event.target.value,
                            password: request.auth?.basic?.password ?? '',
                          },
                        },
                      })
                    }
                  />
                </label>
                <label>
                  Password{' '}
                  <input
                    aria-label="Password"
                    type="password"
                    autoComplete="off"
                    style={fieldStyle}
                    value={request.auth.basic?.password ?? ''}
                    onChange={(event) =>
                      change({
                        auth: {
                          ...request.auth,
                          basic: {
                            username: request.auth?.basic?.username ?? '',
                            password: event.target.value,
                          },
                        },
                      })
                    }
                  />
                </label>
              </>
            )}
            {request.auth?.mode === 'bearer' && (
              <label>
                Bearer token{' '}
                <input
                  aria-label="Bearer token"
                  type="password"
                  autoComplete="off"
                  style={fieldStyle}
                  value={request.auth.bearer?.token ?? ''}
                  onChange={(event) =>
                    change({
                      auth: {
                        ...request.auth,
                        bearer: { token: event.target.value },
                      },
                    })
                  }
                />
              </label>
            )}
            {request.auth?.mode &&
              !['none', 'basic', 'bearer'].includes(request.auth.mode) && (
                <span>This authentication mode requires host support.</span>
              )}
          </div>
        )}
        {activeTab === 'script' && (
          <div>
            <p style={{ color: theme.colors.textMuted }}>
              Scripts are displayed only. Execution requires host support.
            </p>
            {Object.entries(
              (request as BrunoRequest & { script?: Record<string, string> })
                .script ?? {}
            ).map(([name, script]) => (
              <div key={name}>
                <strong>
                  {name === 'req'
                    ? 'Pre-request script'
                    : name === 'res'
                      ? 'Post-response script'
                      : name}
                </strong>
                <pre style={{ whiteSpace: 'pre-wrap' }}>{script}</pre>
              </div>
            ))}
          </div>
        )}
      </fieldset>
    </div>
  );
};
