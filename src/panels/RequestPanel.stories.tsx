import React, { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { RequestPanel } from './bruno/RequestPanel';
import { MockBrunoPanelProvider } from '../mocks/panelContext';
import { mockBrunoRequests } from '../mocks/brunoData';
import type { PanelComponentProps, BrunoPanelActions, BrunoPanelContext } from '../types';

/**
 * RequestPanel displays the request editor and response viewer.
 * It listens for request-selected events from the CollectionPanel.
 */
const meta: Meta = {
  title: 'Panels/RequestPanel',
  component: RequestPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A panel for editing and sending Bruno API requests. Listens for request-selected events.',
      },
    },
  },
  tags: ['autodocs'],
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

/**
 * Helper component that emits a request-selected event on mount
 */
const RequestPanelWithSelection: React.FC<{
  props: PanelComponentProps<BrunoPanelActions, BrunoPanelContext>;
  requestPath: string;
}> = ({ props, requestPath }) => {
  useEffect(() => {
    // Emit selection event after a short delay to ensure panel is mounted
    const timer = setTimeout(() => {
      const request = mockBrunoRequests[requestPath];
      if (request) {
        props.events.emit({
          type: 'principal-ade.bruno:request-selected',
          source: 'storybook',
          timestamp: Date.now(),
          payload: { requestId: requestPath, request },
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [props.events, requestPath]);

  return <RequestPanel {...props} />;
};

/**
 * Empty state - no request selected
 */
export const EmptyState: Story = {
  render: () => (
    <MockBrunoPanelProvider>
      {(props) => <RequestPanel {...props} />}
    </MockBrunoPanelProvider>
  ),
};

/**
 * With GET request selected
 */
export const WithGetRequest: Story = {
  render: () => (
    <MockBrunoPanelProvider brunoRequests={mockBrunoRequests}>
      {(props) => (
        <RequestPanelWithSelection
          props={props}
          requestPath="/collection/users/get-users.bru"
        />
      )}
    </MockBrunoPanelProvider>
  ),
};

/**
 * With POST request selected
 */
export const WithPostRequest: Story = {
  render: () => (
    <MockBrunoPanelProvider brunoRequests={mockBrunoRequests}>
      {(props) => (
        <RequestPanelWithSelection
          props={props}
          requestPath="/collection/users/create-user.bru"
        />
      )}
    </MockBrunoPanelProvider>
  ),
};
