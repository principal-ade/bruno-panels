# Request panel integration

`RequestPanel` edits and displays a prepared request without requiring a `.bru`
file or collection. It only calls `actions.sendRequest` when the user presses
**Send**. Opening, editing, or restoring state never sends a request.

The layout button next to **Send** switches between stacked panes and a
side-by-side view (request on the left, response on the right). Switching
layouts preserves edits and the current response. Layout is local UI state.

The package exports `RequestPanel`, `RequestPanelProps`, `RequestPanelState`,
`createRequestPanelState`, `RequestEditor`, and `ResponseViewer` from its root.

## Uncontrolled mode

Existing `selectedRequest`, `selectedRequestId`, `selectedEnvironment`, and
`selectedEnvironmentName` props continue to work. Without `selectedRequest`, the
panel listens for `principal-ade.bruno:request-selected` events.

The panel retains edits locally. `onRequestChange(request)` reports edits;
`onStateChange(state)` optionally observes all state transitions. No files are
written automatically.

## Host-owned tab state

```tsx
const [state, setState] = useState<RequestPanelState>(() =>
  createRequestPanelState(preparedRequest, 'request-123')
);

<RequestPanel
  context={context}
  actions={actions}
  events={events}
  state={state}
  onStateChange={setState}
/>;
```

Store this state with the tab, above the panel's lifetime, to preserve edits and
responses across remounts. Pass the same request object back unchanged unless
its definition changes. Controlled state is authoritative: the panel ignores
selection and environment props/events in this mode. Set `state.environment`
and `state.environmentName` from the host instead.

`RequestPanelState` contains the request, request ID, latest response, loading
state, error, and environment. For a different request, use
`createRequestPanelState(nextRequest, nextId)` to clear the previous result.
Results from superseded requests are ignored.

The host owns persistence and pin controls. Save the request definition and a
stable ID, not the entire execution state. Reopening a pin should construct
fresh state with no response and `isSending: false`. Do not persist raw
credentials or secret environment values without an explicit secure-storage
policy. The panel never logs credentials or performs persistence itself.

## Supported editing

- HTTP method and URL.
- Headers and query/path parameters: add, edit, enable, disable, remove.
- JSON, text, XML, URL-encoded, and multipart body definitions.
- None, basic, and bearer authentication; sensitive inputs are masked.

Sending stays delegated to the host. The editor does not implement variable
interpolation, path substitution, multipart upload, scripts, or authentication
protocols. The host must support the features it accepts. Scripts remain
display-only. Editing does not mutate the original request object.

## Storybook

Run `npm run storybook`, then open **Requests → Agent Prepared**:

- **Playground**: manual editing, Send, pin/reopen, and remount controls. No
  automated interaction runs when you open this story.
- **Editable Request**: edits are echoed in a mock response after Send.
- **Layout Toggle**: verifies both orientations without losing edits or the response.
- **Host Controlled**: mock pin/reopen and remount controls demonstrate host
  ownership. Pins exist only in demo memory, not on disk.
- **Network Failure**: shows a recoverable simulated execution error.
- **Headers Body And Auth**: exercises row editing, body mode changes, and
  masked credentials.
- **Event Driven Selection**: verifies legacy selection events and ignores a
  late response from the previously selected request.

The stories include interaction assertions and never make real API requests.
Use placeholder credentials only.
