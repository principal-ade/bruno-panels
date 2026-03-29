import type { Meta, StoryObj } from '@storybook/react-vite';
import { RequestPanel } from './bruno/RequestPanel';
import { MockBrunoPanelProvider } from '../mocks/panelContext';
import { mockBrunoRequests } from '../mocks/brunoData';

/**
 * RequestPanel displays the request editor and response viewer.
 * Can receive request via props or listen for events from CollectionPanel.
 */
const meta: Meta = {
  title: 'Panels/RequestPanel',
  component: RequestPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A panel for editing and sending Bruno API requests. Accepts request via props or events.',
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
 * With GET request via props
 */
export const WithGetRequest: Story = {
  render: () => (
    <MockBrunoPanelProvider brunoRequests={mockBrunoRequests}>
      {(props) => (
        <RequestPanel
          {...props}
          selectedRequest={mockBrunoRequests['/collection/users/get-users.bru']}
          selectedRequestId="/collection/users/get-users.bru"
        />
      )}
    </MockBrunoPanelProvider>
  ),
};

/**
 * With POST request via props
 */
export const WithPostRequest: Story = {
  render: () => (
    <MockBrunoPanelProvider brunoRequests={mockBrunoRequests}>
      {(props) => (
        <RequestPanel
          {...props}
          selectedRequest={mockBrunoRequests['/collection/users/create-user.bru']}
          selectedRequestId="/collection/users/create-user.bru"
        />
      )}
    </MockBrunoPanelProvider>
  ),
};
