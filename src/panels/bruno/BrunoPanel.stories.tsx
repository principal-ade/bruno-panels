import type { Meta, StoryObj } from '@storybook/react-vite';
import { BrunoPanel } from './BrunoPanel';
import { MockPanelProvider } from '../../mocks/panelContext';

/**
 * BrunoPanel is a Bruno-compatible API client panel.
 * It displays collections of HTTP requests and allows sending them.
 */
const meta: Meta = {
  title: 'Panels/BrunoPanel',
  component: BrunoPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A Bruno-compatible API client panel for testing HTTP requests. Supports .bru file format, collections, and environments.',
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
    <MockPanelProvider>
      {(props) => <BrunoPanel {...props} />}
    </MockPanelProvider>
  ),
};
