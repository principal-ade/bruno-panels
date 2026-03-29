import React, { useState, useCallback, useEffect } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { useTheme } from '@principal-ade/industry-theme';
import { RequestEditor, ResponseViewer } from './components';
import type { PanelComponentProps, BrunoPanelActions, BrunoPanelContext, BrunoRequest, BrunoResponse } from '../../types';

type RequestPanelProps = PanelComponentProps<BrunoPanelActions, BrunoPanelContext>;

/**
 * RequestPanel displays the request editor and response viewer.
 * Listens for 'principal-ade.bruno:request-selected' events from CollectionPanel.
 */
export const RequestPanel: React.FC<RequestPanelProps> = ({
  actions,
  events,
}) => {
  const { theme } = useTheme();
  const [request, setRequest] = useState<BrunoRequest | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [response, setResponse] = useState<BrunoResponse | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to request-selected events
  useEffect(() => {
    const unsubscribe = events.on(
      'principal-ade.bruno:request-selected',
      (event) => {
        const payload = event.payload as { requestId: string; request: BrunoRequest };
        setRequestId(payload.requestId);
        setRequest(payload.request);
        setResponse(null);
        setError(null);
      }
    );

    return unsubscribe;
  }, [events]);

  const handleSendRequest = useCallback(async () => {
    if (!request) return;

    setIsSending(true);
    setError(null);

    try {
      const result = await actions.sendRequest(request);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setIsSending(false);
    }
  }, [request, actions]);

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
      {request ? (
        <>
          {/* Request Editor */}
          <div style={{ flex: 1, minHeight: '200px', borderBottom: `1px solid ${theme.colors.border}` }}>
            <RequestEditor
              request={request}
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
          <Send size={48} strokeWidth={1} />
          <span style={{ fontSize: '14px' }}>Select a request to get started</span>
        </div>
      )}
    </div>
  );
};
