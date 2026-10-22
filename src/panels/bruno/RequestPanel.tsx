import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Send, AlertCircle, Columns2, Rows2 } from 'lucide-react';
import { useTheme } from '@principal-ade/industry-theme';
import { RequestEditor, ResponseViewer } from './components';
import type {
  PanelComponentProps,
  BrunoPanelActions,
  BrunoPanelContext,
  BrunoRequest,
  BrunoResponse,
} from '../../types';

export interface RequestPanelState {
  request: BrunoRequest | null;
  requestId: string | null;
  response: BrunoResponse | null;
  isSending: boolean;
  error: string | null;
  environment: Record<string, string>;
  environmentName: string | null;
}

export function createRequestPanelState(
  request: BrunoRequest | null = null,
  requestId: string | null = null
): RequestPanelState {
  return {
    request,
    requestId,
    response: null,
    isSending: false,
    error: null,
    environment: {},
    environmentName: null,
  };
}

export type RequestPanelProps = PanelComponentProps<
  BrunoPanelActions,
  BrunoPanelContext
> & {
  /** Optional request to display (if provided, skips event subscription) */
  selectedRequest?: BrunoRequest;
  /** Optional request ID for tracking */
  selectedRequestId?: string;
  /** Optional environment variables for request interpolation */
  selectedEnvironment?: Record<string, string>;
  /** Optional environment name */
  selectedEnvironmentName?: string;
  /** Receives request edits, for example to mark a pinned request as unsaved. */
  onRequestChange?: (request: BrunoRequest) => void;
} & (
    | {
        /** Host-owned state. Takes precedence over selected* props/events. */
        state: RequestPanelState;
        onStateChange: (state: RequestPanelState) => void;
      }
    | {
        state?: undefined;
        onStateChange?: (state: RequestPanelState) => void;
      }
  );

/**
 * RequestPanel displays the request editor and response viewer.
 * Can receive request via props or listen for 'principal-ade.bruno:request-selected' events.
 */
export const RequestPanel: React.FC<RequestPanelProps> = ({
  actions,
  events,
  selectedRequest,
  selectedRequestId,
  selectedEnvironment,
  selectedEnvironmentName,
  state: controlledState,
  onStateChange,
  onRequestChange,
}) => {
  const { theme } = useTheme();
  const [sideBySide, setSideBySide] = useState(false);
  const [localState, setLocalState] = useState<RequestPanelState>(() => ({
    ...createRequestPanelState(
      selectedRequest ?? null,
      selectedRequestId ?? null
    ),
    environment: selectedEnvironment ?? {},
    environmentName: selectedEnvironmentName ?? null,
  }));
  const isControlled = controlledState !== undefined;
  const current = controlledState ?? localState;
  const stateRef = useRef(current);
  stateRef.current = current;
  const callbackRef = useRef(onStateChange);
  callbackRef.current = onStateChange;
  const controlledRef = useRef(isControlled);
  controlledRef.current = isControlled;
  const sendSequence = useRef(0);
  const { request, response, isSending, error } = current;

  const updateState = useCallback(
    (update: (previous: RequestPanelState) => RequestPanelState) => {
      const next = update(stateRef.current);
      stateRef.current = next;
      if (!controlledRef.current) setLocalState(next);
      callbackRef.current?.(next);
    },
    []
  );

  // Update state when props change
  useEffect(() => {
    if (!controlledRef.current && selectedRequest) {
      sendSequence.current++;
      updateState((previous) => ({
        ...previous,
        ...createRequestPanelState(selectedRequest, selectedRequestId ?? null),
        environment: previous.environment,
        environmentName: previous.environmentName,
      }));
    }
  }, [selectedRequest, selectedRequestId, updateState]);

  // Update environment when props change
  useEffect(() => {
    if (!controlledRef.current) {
      updateState((previous) => ({
        ...previous,
        environment: selectedEnvironment ?? {},
        environmentName: selectedEnvironmentName ?? null,
      }));
    }
  }, [selectedEnvironment, selectedEnvironmentName, updateState]);

  // Subscribe to request-selected events (only if no request prop provided)
  useEffect(() => {
    if (selectedRequest || isControlled) return;

    const unsubscribe = events.on(
      'principal-ade.bruno:request-selected',
      (event) => {
        const payload = event.payload as {
          requestId: string;
          request: BrunoRequest;
          environment?: Record<string, string>;
          environmentName?: string | null;
        };
        sendSequence.current++;
        updateState(() => ({
          ...createRequestPanelState(payload.request, payload.requestId),
          environment: payload.environment ?? {},
          environmentName: payload.environmentName ?? null,
        }));
      }
    );

    return unsubscribe;
  }, [events, selectedRequest, isControlled, updateState]);

  // Subscribe to environment-changed events
  useEffect(() => {
    if (isControlled) return;
    const unsubscribe = events.on(
      'principal-ade.bruno:environment-changed',
      (event) => {
        const payload = event.payload as {
          environment: Record<string, string>;
          environmentName: string | null;
        };
        updateState((previous) => ({
          ...previous,
          environment: payload.environment,
          environmentName: payload.environmentName,
        }));
      }
    );

    return unsubscribe;
  }, [events, isControlled, updateState]);

  const handleSendRequest = useCallback(async () => {
    const submitted = stateRef.current;
    if (
      !submitted.request ||
      submitted.isSending ||
      !submitted.request.http.url.trim()
    )
      return;
    const sequence = ++sendSequence.current;
    updateState((previous) => ({ ...previous, isSending: true, error: null }));

    const isCurrent = () =>
      sequence === sendSequence.current &&
      stateRef.current.requestId === submitted.requestId &&
      stateRef.current.request === submitted.request;

    try {
      const result = await actions.sendRequest(
        submitted.request,
        submitted.environment
      );
      if (isCurrent())
        updateState((previous) => ({
          ...previous,
          response: result,
          isSending: false,
        }));
    } catch (err) {
      if (isCurrent())
        updateState((previous) => ({
          ...previous,
          error: err instanceof Error ? err.message : 'Request failed',
          isSending: false,
        }));
    }
  }, [actions, updateState]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: sideBySide ? 'row' : 'column',
        height: '100%',
        minHeight: 0,
        minWidth: 0,
        overflow: 'auto',
        background: theme.colors.background,
        color: theme.colors.text,
        fontFamily: theme.fonts.body,
      }}
    >
      {request ? (
        <>
          {/* Request Editor */}
          <div
            data-testid="request-pane"
            style={{
              flex: '1 1 0',
              minWidth: 0,
              minHeight: sideBySide ? 0 : '200px',
              borderBottom: sideBySide
                ? undefined
                : `1px solid ${theme.colors.border}`,
              borderRight: sideBySide
                ? `1px solid ${theme.colors.border}`
                : undefined,
            }}
          >
            <RequestEditor
              request={request}
              isSending={isSending}
              onSend={handleSendRequest}
              headerActions={
                <button
                  type="button"
                  aria-label="Side-by-side layout"
                  aria-pressed={sideBySide}
                  title={
                    sideBySide
                      ? 'Switch to stacked layout'
                      : 'Switch to side-by-side layout'
                  }
                  onClick={() => setSideBySide((previous) => !previous)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    padding: '8px',
                    background: theme.colors.backgroundSecondary,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '4px',
                    color: sideBySide
                      ? theme.colors.primary
                      : theme.colors.text,
                    cursor: 'pointer',
                  }}
                >
                  {sideBySide ? <Rows2 size={16} /> : <Columns2 size={16} />}
                </button>
              }
              onChange={(nextRequest) => {
                updateState((previous) => ({
                  ...previous,
                  request: nextRequest,
                }));
                onRequestChange?.(nextRequest);
              }}
            />
          </div>

          {/* Response Viewer */}
          <div
            data-testid="response-pane"
            style={{
              flex: '1 1 0',
              minWidth: 0,
              minHeight: sideBySide ? 0 : '200px',
            }}
          >
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
          <span style={{ fontSize: '14px' }}>
            Select a request to get started
          </span>
        </div>
      )}
    </div>
  );
};
