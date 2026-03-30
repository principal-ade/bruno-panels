import React, { useState, useCallback, useEffect } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { useTheme } from '@principal-ade/industry-theme';
import { RequestEditor, ResponseViewer } from './components';
import type { PanelComponentProps, BrunoPanelActions, BrunoPanelContext, BrunoRequest, BrunoResponse } from '../../types';

type RequestPanelProps = PanelComponentProps<BrunoPanelActions, BrunoPanelContext> & {
  /** Optional request to display (if provided, skips event subscription) */
  selectedRequest?: BrunoRequest;
  /** Optional request ID for tracking */
  selectedRequestId?: string;
};

/**
 * RequestPanel displays the request editor and response viewer.
 * Can receive request via props or listen for 'principal-ade.bruno:request-selected' events.
 */
export const RequestPanel: React.FC<RequestPanelProps> = ({
  actions,
  events,
  selectedRequest,
  selectedRequestId,
}) => {
  const { theme } = useTheme();
  const [request, setRequest] = useState<BrunoRequest | null>(selectedRequest ?? null);
  const [requestId, setRequestId] = useState<string | null>(selectedRequestId ?? null);
  const [response, setResponse] = useState<BrunoResponse | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [environment, setEnvironment] = useState<Record<string, string>>({});
  const [environmentName, setEnvironmentName] = useState<string | null>(null);

  // Update state when props change
  useEffect(() => {
    if (selectedRequest) {
      setRequest(selectedRequest);
      setRequestId(selectedRequestId ?? null);
      setResponse(null);
      setError(null);
    }
  }, [selectedRequest, selectedRequestId]);

  // Subscribe to request-selected events (only if no request prop provided)
  useEffect(() => {
    if (selectedRequest) return; // Skip event subscription if request provided via props

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
  }, [events, selectedRequest]);

  // Subscribe to environment-changed events
  useEffect(() => {
    const unsubscribe = events.on(
      'principal-ade.bruno:environment-changed',
      (event) => {
        const payload = event.payload as { environment: Record<string, string>; environmentName: string | null };
        setEnvironment(payload.environment);
        setEnvironmentName(payload.environmentName);
      }
    );

    return unsubscribe;
  }, [events]);

  const handleSendRequest = useCallback(async () => {
    if (!request) return;

    setIsSending(true);
    setError(null);

    try {
      const result = await actions.sendRequest(request, environment);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setIsSending(false);
    }
  }, [request, actions, environment]);

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
