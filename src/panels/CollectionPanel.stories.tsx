import type { Meta, StoryObj } from '@storybook/react-vite';
import { CollectionPanel } from './bruno/CollectionPanel';
import { MockBrunoPanelProvider } from '../mocks/panelContext';
import { mockBrunoFileTree, mockBrunoRequests } from '../mocks/brunoData';

/**
 * CollectionPanel displays a tree view of Bruno API requests.
 * It emits events when a request is selected for the RequestPanel to consume.
 */
const meta: Meta = {
  title: 'Panels/CollectionPanel',
  component: CollectionPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A tree view panel for browsing Bruno API collections. Emits request-selected events.',
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
 * Default state - shows collection tree with demo requests
 */
export const Default: Story = {
  render: () => (
    <MockBrunoPanelProvider
      fileTree={mockBrunoFileTree}
      brunoRequests={mockBrunoRequests}
    >
      {(props) => <CollectionPanel {...props} />}
    </MockBrunoPanelProvider>
  ),
};

/**
 * Empty collection - no .bru files in the fileTree
 */
export const EmptyCollection: Story = {
  render: () => (
    <MockBrunoPanelProvider
      fileTree={{
        ...mockBrunoFileTree,
        root: { ...mockBrunoFileTree.root, children: [] },
        allFiles: [],
      }}
      brunoRequests={{}}
    >
      {(props) => <CollectionPanel {...props} />}
    </MockBrunoPanelProvider>
  ),
};
