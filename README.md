# sse.js

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

## Basic usage

The most simple way to use `SSE` is to create the `SSE` object, attach
one or more listeners, and activate the stream:

```js
var source = new SSE(url);
source.addEventListener('message', function(e) {
  // Assuming we receive JSON-encoded data payloads:
  var payload = JSON.parse(e.data);
  console.log(payload);
});
source.stream();
```

## Events

`SSE` implements the `EventTarget` interface (just like `EventSource`)
and emits fully constructed `Event` objects. The type of the event
corresponds to the Server-Sent Event's _name_, and the event's timestamp
is the UNIX timestamp of the _reception_ of the event.

Additionally, the events will have the following fields:

- `id`: the event ID, if present; `null` otherwise
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

## Listening for specific event types

The [Server-Sent Events
specification](https://html.spec.whatwg.org/multipage/comms.html#server-sent-events)
allows for arbitrary event types, as the `event` field of the event. The
default event type is `message`, so you'll most likely want to register
a listener for this kind of events. If you expect another type of
events, simply register your callback with the appropriate event type:

```js
var source = new SSE(url);
source.addEventListener('status', function(e) {
  console.log('System status is now: ' + e.data);
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

## Passing custom headers

```js
var source = new SSE(url, {headers: {'Authorization': 'Bearer 0xdeadbeef'}});
```

## Making a POST request and overriding the HTTP method

To make a HTTP POST request, simply specify a `payload` in the options:

```js
var source = new SSE(url, {headers: {'Content-Type': 'text/plain'},
                           payload: 'Hello, world!'});
```

Alternatively, you can also manually override the HTTP method used to
perform the request, regardless of the presence of a `payload` option, by
specifying the `method` option:

```js
var source = new SSE(url, {headers: {'Content-Type': 'text/plain'},
                           payload: 'Hello, world!',
                           method: 'GET'});
```

## Expected response from server

It is expected that the server will return the data in the following
format, as defined [here](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events):

```
event: <type>\n
data: <data>\n
\n
```

## `withCredentials` support

This `EventSource` polyfill supports the `withCredentials` option to
request that the outgoing HTTP request be made with a CORS credentials
mode of `include`, as per the [HTML Living
Standard](https://fetch.spec.whatwg.org/#concept-request-credentials-mode).

## Options reference

| Name              | Description |
| ----------------- | ----------- |
| `headers`         | A map of additional headers to use on the HTTP request |
| `method`          | Override HTTP method (defaults to `GET`, unless a payload is given, in which case it defaults to `POST`) |
| `payload`         | An optional request payload to sent with the request |
| `withCredentials` | If set to `true`, CORS requests will be set to include credentials |

## TODOs and caveats

- Internet Explorer 11 does not support arbitrary values in
  `CustomEvent`s.  A dependency on `custom-event-polyfill` is necessary
  for IE11 compatibility.
- Improve `XmlHttpRequest` error handling and connection states
- Automatically reconnect with `Last-Event-ID`
