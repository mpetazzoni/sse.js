# sse-ts

Forked from `https://github.com/mpetazzoni/sse.js`. 
Made the library strongly typed and added support for ES6 modules. So this library can now be imported as a ES6 module and compiled with TS. 

`sse-ts` is a strongly-typed ES6 module-based flexible `EventSource` replacement for Typescript designed
to consume Server-Sent Events (SSE) streams with more control and
options than the standard `EventSource`. The main limitations of
`EventSource` are that it only supports no-payload GET requests, and
does not support specifying additional custom headers to the HTTP
request. This library solves the problem by providing:
- Support for GET and POST requests to a SSE endpoint
- Support for additional headers that can be passed
- Support for `withCredentials` flag


## Installation
```ts
npm i sse-ts
```
OR
```ts
yarn add sse-ts
```

## Basic usage

The most simple way to use `SSE` is to create the `SSE` object, attach
one or more listeners, and activate the stream:

```ts

import { CustomEventDataType, CustomEventType, SSE, SSEOptions, SSEOptionsMethod } from "sse-ts";

const sseOptions: SSEOptions = {
            method: SSEOptionsMethod.GET
        };


const source = new SSE(backendURL, sseOptions);
source.addEventListener('message', (event: CustomEventType) => {
            const dataEvent = event as CustomEventDataType;
            // Assuming we receive JSON-encoded data payloads:
            var payload = JSON.parse(dataEvent.data);
            console.log(payload);
          });

source.stream();
```

## Events

`SSE` implements the `EventTarget` interface (just like `EventSource`)
and emits fully constructed `Event` objects. The type of the event
corresponds to the Server-Sent Event's _name_, and the event's timestamp
is the UNIX timestamp of the _reception_ of the event.

Additionally, the events will have the following fields if the event type is `CustomEventDataType`:

- `id`: the event ID, if present; `null` otherwise
- `data`: the event data, unparsed

`SSE`, like `EventSource`, will emit the following events:

- `open`, when the first block of data is received from the event
  stream;
- `error`, if an error occurs while making the request;
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

```ts
import { CustomEventDataType, CustomEventType, SSE, SSEOptions, SSEOptionsMethod } from "sse-ts";

const sseOptions: SSEOptions = {
            method: SSEOptionsMethod.GET
        };
        
const source = new SSE(backendURL, sseOptions);
source.addEventListener('status', (event: CustomEventType) => {
        const dataEvent = event as CustomEventDataType;
        console.log('System status is now: ' + dataEvent.data);
        });

        source.stream();
```


## Passing custom headers

```ts
import { CustomEventDataType, CustomEventType, SSE, SSEOptions, SSEOptionsMethod } from "sse-ts";

const sseOptions: SSEOptions = {
            headers: { 'Content-Type': 'application/json', 'api-key': "apiKey" },
            method: SSEOptionsMethod.GET,
        };

const source = new SSE(backendURL, sseOptions);
        
```

## Making a POST request and overriding the HTTP method

To make a HTTP POST request, simply specify a `payload` in the options:

```ts
import { CustomEventDataType, CustomEventType, SSE, SSEOptions, SSEOptionsMethod } from "sse-ts";

const sseOptions: SSEOptions = {
            headers: { 'Content-Type': 'application/json', 'api-key': "apiKey" },
            method: SSEOptionsMethod.POST,
            payload: JSON.stringify({
                foo: "bar"
            })
        };

const source = new SSE(backendURL, sseOptions);
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
| `method`          | (Required) Override HTTP method (GET or POST) |
| `payload`         | The request payload to sent with the request |
| `withCredentials` | If set to `true`, CORS requests will be set to include credentials |

## TODOs and caveats

- Internet Explorer 11 does not support arbitrary values in
  `CustomEvent`s.  A dependency on `custom-event-polyfill` is necessary
  for IE11 compatibility.
- Improve `XmlHttpRequest` error handling and connection states
- Automatically reconnect with `Last-Event-ID`
