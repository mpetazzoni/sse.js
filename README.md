# sse.js

![GitHub License](https://img.shields.io/github/license/mpetazzoni/sse.js) ![NPM Downloads](https://img.shields.io/npm/dm/sse.js)

`sse.js` is a flexible `EventSource` replacement for JavaScript designed
to consume Server-Sent Events (SSE) streams with more control and
options than the standard `EventSource`. The main limitations of
`EventSource` are that it only supports no-payload GET requests, and
does not support specifying additional custom headers to the HTTP
request.

This package is designed to provide a usable replacement to
`EventSource` that makes all of this possible: `SSE`. It is a fully
compatible `EventSource` polyfill so you should be able to do this if
you want/need to:

```js
EventSource = SSE;
```

## Usage

### Import

From a module context:

```js
import { SSE } from "./sse.js";
```

From a non-module context:

```js
(async () => {
  const { SSE } = import("./sse.js");
  window.SSE = SSE;
})();
```

### Constructor

```js
var source = new SSE(url, options);
```

### Getting started

The most simple way to use `SSE` is to create the `SSE` object, attach
one or more listeners, and activate the stream:

```js
var source = new SSE(url);
source.addEventListener("message", function (e) {
  // Assuming we receive JSON-encoded data payloads:
  var payload = JSON.parse(e.data);
  console.log(payload);
});
```

Like `EventSource`, `SSE` will automatically execute the request and
start streaming. If you want to disable this behavior, and be more
specific as to when the request should be triggered, you can pass
the `start: false` option and later call the `stream()` method:

```js
var source = new SSE(url, {start: false});
source.addEventListener('message', (e) => { ... });
// ... later on
source.stream();
```

### Passing custom headers

```js
var source = new SSE(url, { headers: { Authorization: "Bearer 0xdeadbeef" } });
```

### Making a POST request and overriding the HTTP method

To make a HTTP POST request, simply specify a `payload` in the options:

```js
var source = new SSE(url, {
  headers: { "Content-Type": "text/plain" },
  payload: "Hello, world!",
});
```

Alternatively, you can also manually override the HTTP method used to
perform the request, regardless of the presence of a `payload` option, by
specifying the `method` option:

```js
var source = new SSE(url, {
  headers: { "Content-Type": "text/plain" },
  payload: "Hello, world!",
  method: "GET",
});
```

### Auto-reconnect functionality

`SSE` supports automatic reconnection when the connection is lost or encounters an error. This can be enabled through the options:

```js
var source = new SSE(url, {
  autoReconnect: true, // Enable auto-reconnect
  reconnectDelay: 3000, // Wait 3 seconds before reconnecting
  useLastEventId: true, // Send Last-Event-ID header on reconnect (recommended)
});
```

When auto-reconnect is enabled:

- The connection will automatically attempt to reconnect after any connection loss or error
- Each reconnection attempt will wait for the specified delay (in milliseconds)
- If `useLastEventId` is true, the last received event ID will be sent in the `Last-Event-ID` header
- Auto-reconnect is automatically disabled when calling `close()` on the SSE instance

You can dynamically check the auto-reconnect status through the `autoReconnect` property:

```js
if (source.autoReconnect) {
  console.log("Auto-reconnect is enabled");
}
```

### Reconnecting after failure

There are two ways to handle reconnection after a connection failure:

1. **Automatic Reconnection (Recommended)**

```js
const source = new SSE(url, {
  autoReconnect: true,
  reconnectDelay: 3000,
});

source.addEventListener("error", (e) => {
  console.log(`Connection lost. Will automatically reconnect in 3s...`);
});
```

2. **Manual Reconnection**

```js
const source = new SSE(url, { autoReconnect: false });

source.addEventListener("error", (e) => {
  console.log("Connection lost");
  // Wait a bit then reconnect
  setTimeout(() => {
    source.stream();
  }, 3000);
});

// Or reconnect on abort
source.addEventListener("abort", () => {
  source.stream();
});
```

### Last-Event-ID Support

The `Last-Event-ID` header is a crucial part of the SSE specification that helps maintain message continuity across reconnections. When enabled (default), `SSE` will automatically:

1. Track the last received event ID
2. Send this ID in the `Last-Event-ID` header on reconnection
3. Allow the server to resume the event stream from where it left off

This behavior can be controlled with the `useLastEventId` option:

```js
const source = new SSE(url, {
  useLastEventId: true, // Recommended: follows SSE specification
});
```

It's strongly recommended to keep `useLastEventId` enabled as it's part of the SSE specification and ensures no events are lost during reconnection. Only disable it if you have specific requirements that conflict with this behavior.

You can access the last event ID at any time:

```js
console.log("Last received event ID:", source.lastEventId);
```

Example of proper Last-Event-ID handling:

```js
const source = new SSE("/api/events", {
  autoReconnect: true,
  useLastEventId: true,
  headers: { "Client-ID": "dashboard-1" },
});

source.addEventListener("message", (e) => {
  if (e.id) {
    console.log(`Received event ${e.id}`);
    // The lastEventId is automatically tracked
    // and will be sent on next reconnection
  }
});

source.addEventListener("open", (e) => {
  if (source.lastEventId) {
    console.log(`Reconnected, resuming from event ${source.lastEventId}`);
  }
});
```

## Options reference

| Name              | Description                                                                                                                                                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `headers`         | A map of additional headers to use on the HTTP request                                                                                                                                                                       |
| `method`          | Override HTTP method (defaults to `GET`, unless a payload is given, in which case it defaults to `POST`)                                                                                                                     |
| `payload`         | An optional request payload to sent with the request                                                                                                                                                                         |
| `withCredentials` | If set to `true`, CORS requests will be set to include credentials                                                                                                                                                           |
| `start`           | Automatically execute the request and start streaming (defaults to `true`)                                                                                                                                                   |
| `debug`           | Log debug messages to the console about received chunks and dispatched events (defaults to `false`)                                                                                                                          |
| `autoReconnect`   | If set to `true`, automatically attempt to reconnect when the connection is lost or errors occur (defaults to `false`). Reconnection is disabled when `close()` is called                                                    |
| `reconnectDelay`  | Number of milliseconds to wait before attempting to reconnect after a connection loss (defaults to `3000`). Only used when `autoReconnect` is `true`                                                                         |
| `useLastEventId`  | If set to `true` (default), follows the SSE specification by sending the Last-Event-ID header on reconnection attempts. This helps maintain message continuity by allowing the server to resume from the last received event |

## Events

`SSE` implements the `EventTarget` interface (just like `EventSource`)
and emits fully constructed `Event` objects. The type of the event
corresponds to the Server-Sent Event's _name_, and the event's timestamp
is the UNIX timestamp of the _reception_ of the event.

Additionally, the events will have the following fields:

- `id`: the event ID, if present; `null` otherwise
- `lastEventId`: the last seen event ID, or the empty string if no event
  with an ID was received
- `data`: the event data, unparsed

`SSE`, like `EventSource`, will emit the following events:

- `open`, when the first block of data is received from the event
  stream;
- `error`, if an error occurs while making the request;
- `abort`, as a response to the stream being explicitely aborted by the
  client;
- `readystatechange`, to notify of a change in the ready state of the
  event source.

Note that all events dispatched by `SSE` will have the event target
initially set to the `SSE` object itself.

### Response headers and status code

The SSE endpoint's response headers and the status code returned by the
server are exposed in the `open` event that is fired at the beginning of
the stream, under the `headers` and `responseCode` properties,
respectivitely:

```js
var source = new SSE(url);
source.addEventListener("open", function (e) {
  console.log(
    "Got a " + e.data.responseCode + " response with headers: " + e.data.headers
  );
});
source.stream();
```

The response headers are represented as a map of (lowercased) header
names to array of header values.

### Listening for specific event types

The [Server-Sent Events
specification](https://html.spec.whatwg.org/multipage/comms.html#server-sent-events)
allows for arbitrary event types, as the `event` field of the event. The
default event type is `message`, so you'll most likely want to register
a listener for this kind of events. If you expect another type of
events, simply register your callback with the appropriate event type:

```js
var source = new SSE(url);
source.addEventListener("status", function (e) {
  console.log("System status is now: " + e.data);
});
source.stream();
```

You can also register an event listener with the `on<event>` style:

```js
var source = new SSE(url);
source.onstatus = function(e) { ... };
```

You can mix both `on<event>` and `addEventListener()`. The `on<event>`
handler is always called first if it is defined.

## Event stream order

In a regular stream, you should expect to receive events in the
following order:

1. A `readystatechange` event with a `readyState` of `CONNECTING (0)`;
1. An `open` event, with the endpoint's `responseCode` and `headers`;
1. A `readystatechange` event with a `readyState` of `OPEN (1)`;
1. One `message` event for each received server-sent event, plus the
   event-type-specific event for the same;

When closing the stream, you should also expect:

1. A `readystatechange` event with a `readyState` of `CLOSED (2)`;
1. An `abort` event.

## Expected response from server

It is expected that the server will return the data in the following
format, as defined [here](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events):

```
event: <type>\n
data: <data>\n
\n
```

Note that the space after the colon field delimiter is optional. A space
after the colon, if present, is always removed from the parsed field
value [as mandated by the SSE specification](https://html.spec.whatwg.org/multipage/server-sent-events.html#event-stream-interpretation).
If your SSE server does _not_ output with a space after the colon
delimiter, it must take care to correctly express field values with
leading spaces.

## Advanced usage

### `withCredentials` support

This `EventSource` polyfill supports the `withCredentials` option to
request that the outgoing HTTP request be made with a CORS credentials
mode of `include`, as per the [HTML Living
Standard](https://fetch.spec.whatwg.org/#concept-request-credentials-mode).

### Browser Compatibility

- Modern browsers: Full support for all features
- Internet Explorer 11: Requires `custom-event-polyfill` for proper `CustomEvent` support

## Development and Release

### Releasing `sse.js`

Increment the package version with `npm version`, and publish to GitHub
and NPM.js:

```
$ npm version {major,minor,patch}
$ git publish --tags
$ npm publish --otp <otp>
```

Then, [create a new GitHub release](https://github.com/mpetazzoni/sse.js/releases/new)
for the new tagged version.
