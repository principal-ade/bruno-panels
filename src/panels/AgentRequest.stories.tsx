import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { RequestPanel, createRequestPanelState } from './bruno/RequestPanel';
import type { RequestPanelState } from './bruno/RequestPanel';
import type { BrunoPanelActions, BrunoRequest, BrunoResponse } from '../types';
import { MockBrunoPanelProvider } from '../mocks/panelContext';

const agentRequest: BrunoRequest = {
  meta: { name: 'Create a task', type: 'http' },
  http: { method: 'POST', url: '{{baseUrl}}/tasks', body: 'json' },
  headers: [{ name: 'Accept', value: 'application/json', enabled: true }],
  params: [{ name: 'dryRun', value: 'true', enabled: true, type: 'query' }],
  body: { json: '{\n  "title": "Review the API request"\n}' },
  auth: { mode: 'bearer', bearer: { token: '{{token}}' } },
};

const echoActions: Partial<BrunoPanelActions> = {
  sendRequest: async (request, environment): Promise<BrunoResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      status: 200,
      statusText: 'OK (mock)',
      headers: {
        'content-type': 'application/json',
        'x-storybook': 'mock-response',
      },
      data: {
        method: request.http.method,
        url: request.http.url.replace(
          '{{baseUrl}}',
          environment?.baseUrl ?? '{{baseUrl}}'
        ),
        headers: request.headers
          ?.filter((header) => header.enabled)
          .map((header) => header.name),
        params: request.params,
        body: request.body,
        authMode: request.auth?.mode ?? 'none',
      },
      responseTime: 400,
      size: 256,
    };
  },
};

const failureActions: Partial<BrunoPanelActions> = {
  sendRequest: async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    throw new Error(
      'Mock connection refused. No real network request was sent.'
    );
  },
};

const meta: Meta = {
  title: 'Requests/Agent Prepared',
  component: RequestPanel,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj;

export const EditableRequest: Story = {
  render: () => (
    <MockBrunoPanelProvider actionsOverrides={echoActions}>
      {(props) => (
        <RequestPanel
          {...props}
          selectedRequest={agentRequest}
          selectedRequestId="agent-task"
          selectedEnvironment={{
            baseUrl: 'https://api.example.test',
            token: 'storybook-placeholder',
          }}
          selectedEnvironmentName="Storybook (mock)"
        />
      )}
    </MockBrunoPanelProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('Send a request to see the response')
    ).toBeVisible();
    await userEvent.selectOptions(
      canvas.getByLabelText('Request method'),
      'PUT'
    );
    await userEvent.clear(canvas.getByLabelText('Request URL'));
    await userEvent.type(
      canvas.getByLabelText('Request URL'),
      'https://api.example.test/edited'
    );
    await userEvent.click(canvas.getByRole('tab', { name: 'Body' }));
    await userEvent.clear(canvas.getByLabelText('Request body'));
    await userEvent.type(canvas.getByLabelText('Request body'), 'edited body');
    await userEvent.click(canvas.getByRole('button', { name: /^Send$/ }));
    await expect(await canvas.findByText('OK (mock)')).toBeVisible();
    await expect(canvas.getByText(/"method": "PUT"/)).toBeVisible();
    await expect(canvas.getByText(/"json": "edited body"/)).toBeVisible();
    await expect(agentRequest.http.method).toBe('POST');
    await expect(agentRequest.http.url).toBe('{{baseUrl}}/tasks');
    await expect(agentRequest.body?.json).toContain('Review the API request');
  },
};

export const LayoutToggle: Story = {
  render: EditableRequest.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Side-by-side layout' });
    const requestPane = canvas.getByTestId('request-pane');
    const responsePane = canvas.getByTestId('response-pane');

    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(responsePane.getBoundingClientRect().top).toBeGreaterThan(
      requestPane.getBoundingClientRect().top
    );
    await userEvent.click(canvas.getByLabelText('Request URL'));
    await userEvent.clear(canvas.getByLabelText('Request URL'));
    await userEvent.type(
      canvas.getByLabelText('Request URL'),
      'https://api.example.test/layout'
    );
    await userEvent.click(canvas.getByRole('tab', { name: 'Body' }));
    await userEvent.click(canvas.getByRole('button', { name: /^Send$/ }));
    await expect(await canvas.findByText('OK (mock)')).toBeVisible();

    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(responsePane.getBoundingClientRect().left).toBeGreaterThan(
      requestPane.getBoundingClientRect().left
    );
    await expect(responsePane.getBoundingClientRect().top).toBeCloseTo(
      requestPane.getBoundingClientRect().top,
      0
    );
    await expect(canvas.getByLabelText('Request URL')).toHaveValue(
      'https://api.example.test/layout'
    );
    await expect(canvas.getByLabelText('Request body')).toBeVisible();
    await expect(canvas.getByText('OK (mock)')).toBeVisible();
    for (const section of ['header', 'tabs']) {
      const requestRow = canvas
        .getByTestId(`request-${section}`)
        .getBoundingClientRect();
      const responseRow = canvas
        .getByTestId(`response-${section}`)
        .getBoundingClientRect();
      await expect(responseRow.top).toBeCloseTo(requestRow.top, 0);
      await expect(responseRow.height).toBeCloseTo(requestRow.height, 0);
      await expect(responseRow.bottom).toBeCloseTo(requestRow.bottom, 0);
    }

    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(responsePane.getBoundingClientRect().top).toBeGreaterThan(
      requestPane.getBoundingClientRect().top
    );
    await expect(canvas.getByText('OK (mock)')).toBeVisible();
  },
};

function HostControlledExample() {
  const [state, setState] = useState<RequestPanelState>(() => ({
    ...createRequestPanelState(agentRequest, 'host-owned-request'),
    environment: {
      baseUrl: 'https://api.example.test',
      token: 'storybook-placeholder',
    },
    environmentName: 'Storybook (mock)',
  }));
  const [mountKey, setMountKey] = useState(0);
  const [savedRequest, setSavedRequest] = useState<BrunoRequest | null>(null);
  const pinned = savedRequest !== null;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#17191c',
        color: '#eee',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          fontFamily: 'sans-serif',
          fontSize: '13px',
        }}
      >
        <strong>Host-owned tab demo</strong>
        <button
          onClick={() =>
            setSavedRequest(pinned ? null : structuredClone(state.request))
          }
        >
          {pinned ? 'Unpin request' : 'Pin request'}
        </button>
        <button
          disabled={state.isSending}
          onClick={() => setMountKey((value) => value + 1)}
        >
          Remount panel
        </button>
        <button
          disabled={!savedRequest || state.isSending}
          onClick={() => {
            setState({
              ...createRequestPanelState(
                structuredClone(savedRequest),
                'host-owned-request'
              ),
              environment: state.environment,
              environmentName: state.environmentName,
            });
            setMountKey((value) => value + 1);
          }}
        >
          Reopen pinned request
        </button>
        <span role="status">
          {pinned ? 'Pinned in demo memory' : 'Not pinned'} · Panel mount{' '}
          {mountKey + 1}
        </span>
        <span>
          Mock responses only. Pin storage belongs to the host, not this
          package.
        </span>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <MockBrunoPanelProvider actionsOverrides={echoActions}>
          {(props) => (
            <RequestPanel
              key={mountKey}
              {...props}
              state={state}
              onStateChange={setState}
            />
          )}
        </MockBrunoPanelProvider>
      </div>
    </div>
  );
}

/** Manual demo: no play function runs, so opening this story never sends. */
export const Playground: Story = {
  render: () => <HostControlledExample />,
};

export const HostControlled: Story = {
  render: () => <HostControlledExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.clear(canvas.getByLabelText('Request URL'));
    await userEvent.type(
      canvas.getByLabelText('Request URL'),
      'https://api.example.test/pinned'
    );
    await userEvent.click(
      canvas.getByRole('button', { name: /^Pin request$/ })
    );
    await userEvent.click(canvas.getByRole('button', { name: /^Send$/ }));
    await expect(await canvas.findByText('OK (mock)')).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remount panel' })
    );
    await expect(canvas.getByLabelText('Request URL')).toHaveValue(
      'https://api.example.test/pinned'
    );
    await expect(canvas.getByText('OK (mock)')).toBeVisible();
    await userEvent.clear(canvas.getByLabelText('Request URL'));
    await userEvent.type(
      canvas.getByLabelText('Request URL'),
      'https://api.example.test/unsaved'
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Reopen pinned request' })
    );
    await expect(canvas.getByLabelText('Request URL')).toHaveValue(
      'https://api.example.test/pinned'
    );
    await expect(
      canvas.getByText('Send a request to see the response')
    ).toBeVisible();
  },
};

export const NetworkFailure: Story = {
  render: () => (
    <MockBrunoPanelProvider actionsOverrides={failureActions}>
      {(props) => (
        <RequestPanel
          {...props}
          selectedRequest={agentRequest}
          selectedRequestId="failure"
        />
      )}
    </MockBrunoPanelProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /^Send$/ }));
    await expect(
      await canvas.findByText(
        'Mock connection refused. No real network request was sent.'
      )
    ).toBeVisible();
    await expect(canvas.getByRole('button', { name: /^Send$/ })).toBeEnabled();
  },
};

export const HeadersBodyAndAuth: Story = {
  render: EditableRequest.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Headers' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Add header' }));
    await userEvent.type(canvas.getByLabelText('Header 2 name'), 'X-Demo');
    await userEvent.type(canvas.getByLabelText('Header 2 value'), 'example');
    await userEvent.click(canvas.getByLabelText('Header 1 enabled'));
    await userEvent.click(canvas.getByRole('tab', { name: 'Params' }));
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove parameter 1' })
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Add parameter' })
    );
    await userEvent.type(canvas.getByLabelText('Parameter 1 name'), 'page');
    await userEvent.type(canvas.getByLabelText('Parameter 1 value'), '2');
    await userEvent.click(canvas.getByRole('tab', { name: 'Body' }));
    await userEvent.selectOptions(
      canvas.getByLabelText('Body type'),
      'formUrlEncoded'
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Add field' }));
    await userEvent.type(canvas.getByLabelText('Field 1 name'), 'title');
    await userEvent.type(canvas.getByLabelText('Field 1 value'), 'Edited task');
    await userEvent.click(canvas.getByRole('tab', { name: 'Auth' }));
    await userEvent.selectOptions(
      canvas.getByLabelText('Authentication'),
      'basic'
    );
    await userEvent.type(canvas.getByLabelText('Username'), 'storybook-user');
    await userEvent.type(canvas.getByLabelText('Password'), 'placeholder-only');
    await expect(canvas.getByLabelText('Password')).toHaveAttribute(
      'type',
      'password'
    );
    await userEvent.click(canvas.getByRole('button', { name: /^Send$/ }));
    await expect(await canvas.findByText('OK (mock)')).toBeVisible();
    const result = canvas.getByText(/"authMode": "basic"/);
    await expect(result).toHaveTextContent('"X-Demo"');
    await expect(result).not.toHaveTextContent('"Accept"');
    await expect(result).toHaveTextContent('"formUrlEncoded"');
    await expect(result).not.toHaveTextContent('"json"');
    await expect(result).toHaveTextContent('"Edited task"');
    await expect(result).toHaveTextContent('"page"');
    await expect(result).not.toHaveTextContent('placeholder-only');
    await expect(agentRequest.headers).toEqual([
      { name: 'Accept', value: 'application/json', enabled: true },
    ]);
    await expect(agentRequest.params?.[0].name).toBe('dryRun');
    await expect(agentRequest.auth?.mode).toBe('bearer');
  },
};

function EventDrivenExample() {
  return (
    <MockBrunoPanelProvider actionsOverrides={echoActions}>
      {(props) => (
        <div
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ display: 'flex', gap: '8px', padding: '12px' }}>
            <button
              onClick={() =>
                props.events.emit({
                  type: 'principal-ade.bruno:request-selected',
                  source: 'storybook',
                  timestamp: Date.now(),
                  payload: {
                    request: agentRequest,
                    requestId: 'request-a',
                    environment: { baseUrl: 'https://first.example.test' },
                    environmentName: 'First environment',
                  },
                })
              }
            >
              Select request A
            </button>
            <button
              onClick={() =>
                props.events.emit({
                  type: 'principal-ade.bruno:request-selected',
                  source: 'storybook',
                  timestamp: Date.now(),
                  payload: {
                    request: {
                      http: {
                        method: 'GET',
                        url: 'https://second.example.test',
                      },
                    },
                    requestId: 'request-b',
                  },
                })
              }
            >
              Select request B
            </button>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <RequestPanel {...props} />
          </div>
        </div>
      )}
    </MockBrunoPanelProvider>
  );
}

export const EventDrivenSelection: Story = {
  render: () => <EventDrivenExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Select request A' })
    );
    await userEvent.click(canvas.getByRole('button', { name: /^Send$/ }));
    await userEvent.click(
      canvas.getByRole('button', { name: 'Select request B' })
    );
    await expect(canvas.getByLabelText('Request URL')).toHaveValue(
      'https://second.example.test'
    );
    await userEvent.click(canvas.getByRole('button', { name: /^Send$/ }));
    await expect(await canvas.findByText('OK (mock)')).toBeVisible();
    await expect(
      canvas.getByText(/"url": "https:\/\/second.example.test"/)
    ).toBeVisible();
    await expect(
      canvas.queryByText(/"url": "https:\/\/first.example.test/)
    ).not.toBeInTheDocument();
  },
};
