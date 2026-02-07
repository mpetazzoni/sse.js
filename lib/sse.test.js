/**
 * sse.js - A flexible EventSource polyfill/replacement.
 * https://github.com/mpetazzoni/sse.js
 *
 * Copyright (C) 2016-2024 Maxime Petazzoni <maxime.petazzoni@bulix.org>.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * =============================================================================
 * Test Suite for sse.js
 * =============================================================================
 *
 * This test suite validates:
 * 1. SSE.js-specific features (initialization, lifecycle, options)
 * 2. SSE specification compliance per WHATWG HTML Living Standard
 *    https://html.spec.whatwg.org/multipage/server-sent-events.html
 *
 * Related: https://github.com/mpetazzoni/sse.js/issues/108
 */

import { SSE } from "sse.js";

// =============================================================================
// Mock Setup
// =============================================================================

function createMockXHR() {
  const eventHandlers = {};

  const mockXHR = {
    open: jest.fn(),
    send: jest.fn(),
    abort: jest.fn(),
    setRequestHeader: jest.fn(),
    getAllResponseHeaders: jest.fn(
      () => "content-type: text/event-stream\r\n"
    ),
    responseText: "",
    status: 200,
    readyState: 0,
    HEADERS_RECEIVED: 2,
    DONE: 4,
    addEventListener: jest.fn((event, handler) => {
      eventHandlers[event] = handler;
    }),
    trigger: (eventName, eventObj) => {
      if (eventHandlers[eventName]) {
        eventHandlers[eventName](eventObj);
      }
    },
  };

  return mockXHR;
}

beforeEach(() => {
  global.XMLHttpRequest = jest.fn(createMockXHR);
  global.XMLHttpRequest.HEADERS_RECEIVED = 2;
  global.XMLHttpRequest.DONE = 4;
});

// =============================================================================
// SSE.js Features: Initialization
// =============================================================================

describe("SSE Initialization", () => {
  it("should initialize with default options", () => {
    const sse = new SSE("http://example.com");
    expect(sse.method).toBe("GET");
    expect(sse.url).toBe("http://example.com");
    expect(sse.payload).toBe("");
    expect(sse.headers).toStrictEqual({});
    expect(sse.readyState).toBe(SSE.CONNECTING);
    expect(sse.listeners).toStrictEqual({});
    expect(sse.chunk).toBe("");
  });

  it("should initialize with custom headers", () => {
    const options = {
      method: "POST",
      headers: { "X-Custom-Header": "value" },
    };
    const sse = new SSE("http://example.com", options);
    expect(sse.method).toBe("POST");
    expect(sse.headers["X-Custom-Header"]).toBe("value");
  });

  it("should initialize with explicit POST", () => {
    const options = { method: "POST" };
    const sse = new SSE("http://example.com", options);
    expect(sse.method).toBe("POST");
  });

  it("should initialize with implicit POST when payload is provided", () => {
    const options = { payload: '{"mydata": "something"}' };
    const sse = new SSE("http://example.com", options);
    expect(sse.method).toBe("POST");
    expect(sse.payload).toBe('{"mydata": "something"}');
  });

  it("should not auto-start when start option is false", () => {
    const sse = new SSE("http://example.com", { start: false });
    expect(sse.readyState).toBe(SSE.INITIALIZING);
    expect(sse.xhr).toBeNull();
  });
});

// =============================================================================
// SSE.js Features: Lifecycle
// =============================================================================

describe("SSE Lifecycle", () => {
  let sse;

  beforeEach(() => {
    sse = new SSE("http://example.com", { start: false });
  });

  it("should start in an initializing state", () => {
    expect(sse.readyState).toBe(SSE.INITIALIZING);
  });

  it("should start a connection when stream method is called", () => {
    sse.stream();
    expect(sse.xhr.open).toHaveBeenCalledWith("GET", "http://example.com");
    expect(sse.xhr.send).toHaveBeenCalledWith("");
    expect(sse.readyState).toBe(SSE.CONNECTING);
  });

  it("should become ready on receiving headers", () => {
    sse.stream();
    sse.xhr.readyState = XMLHttpRequest.HEADERS_RECEIVED;
    sse.xhr.trigger("readystatechange", {});
    expect(sse.readyState).toBe(SSE.OPEN);
  });

  it("should handle a normal connection close", () => {
    sse.stream();
    sse.xhr.trigger("progress", {});
    sse.xhr.trigger("load", {});
    expect(sse.readyState).toBe(SSE.CLOSED);
  });

  it("should handle connection close due to error", () => {
    sse.stream();
    const mockErrorEvent = {
      currentTarget: {
        response: "Error message or response data",
      },
    };
    sse.xhr.trigger("error", mockErrorEvent);
    expect(sse.readyState).toBe(SSE.CLOSED);
  });

  it("should handle connection close due to abort", () => {
    sse.stream();
    sse.xhr.trigger("abort", {});
    expect(sse.readyState).toBe(SSE.CLOSED);
  });

  it("should send Last-Event-ID on reconnection", () => {
    sse.stream();
    expect(sse.xhr.setRequestHeader).toHaveBeenCalledTimes(0);
    sse.xhr.responseText = "id: event-1\ndata: Test message\n\n";
    sse.xhr.trigger("progress", {});
    expect(sse.lastEventId).toBe("event-1");

    sse.xhr.trigger("abort", {});
    expect(sse.readyState).toBe(SSE.CLOSED);
    expect(sse.lastEventId).toBe("event-1");

    sse.stream();
    expect(sse.xhr.setRequestHeader).toHaveBeenCalledWith(
      "Last-Event-ID",
      "event-1"
    );
  });
});

// =============================================================================
// SSE.js Features: Event Listener Management
// =============================================================================

describe("SSE Event Listener Management", () => {
  let sse;
  let listener;

  beforeEach(() => {
    listener = jest.fn();
    sse = new SSE("http://example.com");
    sse.addEventListener("message", listener);
  });

  it("should add event listeners", () => {
    sse.xhr.responseText = "data: test\n\n";
    sse.xhr.trigger("progress", {});
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("should remove event listeners", () => {
    sse.removeEventListener("message", listener);
    sse.xhr.responseText = "data: test\n\n";
    sse.xhr.trigger("progress", {});
    expect(listener).toHaveBeenCalledTimes(0);
  });

  it("should not add duplicate listeners", () => {
    sse.addEventListener("message", listener);
    sse.addEventListener("message", listener);
    sse.xhr.responseText = "data: test\n\n";
    sse.xhr.trigger("progress", {});
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

// =============================================================================
// SSE Spec 9.2.5: Parsing an event stream
// =============================================================================
//
// ABNF Grammar from spec:
//   stream        = [ bom ] *event
//   event         = *( comment / field ) end-of-line
//   comment       = colon *any-char end-of-line
//   field         = 1*name-char [ colon [ space ] *any-char ] end-of-line
//   end-of-line   = ( cr lf / cr / lf )

describe("SSE Spec 9.2.5: Parsing an event stream", () => {
  /**
   * "Lines must be separated by either a U+000D CARRIAGE RETURN U+000A LINE FEED
   * (CRLF) character pair, a single U+000A LINE FEED (LF) character, or a single
   * U+000D CARRIAGE RETURN (CR) character."
   */
  describe("Line ending handling", () => {
    let sse;
    let listener;

    beforeEach(() => {
      listener = jest.fn();
      sse = new SSE("http://example.com");
      sse.addEventListener("message", listener);
    });

    it("should parse events separated by LF (\\n)", () => {
      sse.xhr.responseText = "data: message1\n\ndata: message2\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener.mock.calls[0][0].data).toBe("message1");
      expect(listener.mock.calls[1][0].data).toBe("message2");
    });

    it("should parse events separated by CR (\\r)", () => {
      sse.xhr.responseText = "data: message1\r\rdata: message2\r\r";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener.mock.calls[0][0].data).toBe("message1");
      expect(listener.mock.calls[1][0].data).toBe("message2");
    });

    it("should parse events separated by CRLF (\\r\\n)", () => {
      sse.xhr.responseText =
        "data: message1\r\n\r\ndata: message2\r\n\r\n";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener.mock.calls[0][0].data).toBe("message1");
      expect(listener.mock.calls[1][0].data).toBe("message2");
    });

    it("should handle mixed line endings within a single stream", () => {
      sse.xhr.responseText =
        "data: msg1\n\ndata: msg2\r\rdata: msg3\r\n\r\n";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(3);
      expect(listener.mock.calls[0][0].data).toBe("msg1");
      expect(listener.mock.calls[1][0].data).toBe("msg2");
      expect(listener.mock.calls[2][0].data).toBe("msg3");
    });

    it("should parse fields with CR line endings", () => {
      sse.xhr.responseText = "data: line1\rdata: line2\r\r";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].data).toBe("line1\nline2");
    });

    it("should parse fields with CRLF line endings", () => {
      sse.xhr.responseText = "data: line1\r\ndata: line2\r\n\r\n";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].data).toBe("line1\nline2");
    });
  });

  /**
   * "If the line starts with a U+003A COLON character (:), ignore the line."
   */
  describe("Comment handling", () => {
    let sse;
    let listener;

    beforeEach(() => {
      listener = jest.fn();
      sse = new SSE("http://example.com");
      sse.addEventListener("message", listener);
    });

    it("should ignore lines starting with colon (comments)", () => {
      sse.xhr.responseText = ": this is a comment\ndata: actual data\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].data).toBe("actual data");
    });

    it("should ignore multiple comment lines", () => {
      sse.xhr.responseText =
        ": comment 1\n: comment 2\n: comment 3\ndata: data\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].data).toBe("data");
    });

    it("should handle comment-only events (no event dispatched)", () => {
      sse.xhr.responseText = ": just a comment\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(0);
    });

    it("should handle comments with colons in them", () => {
      sse.xhr.responseText =
        ": comment with: colons: inside\ndata: test\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].data).toBe("test");
    });

    it("should handle empty comments (just colon)", () => {
      sse.xhr.responseText = ":\ndata: test\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].data).toBe("test");
    });
  });

  /**
   * Field parsing rules from spec:
   * - "Collect the characters on the line before the first U+003A COLON character (:),
   *    and let field be that string."
   * - "Collect the characters on the line after the first U+003A COLON character (:),
   *    and let value be that string."
   * - "If value starts with a U+0020 SPACE character, remove it from value."
   */
  describe("Field parsing", () => {
    let sse;
    let listener;

    beforeEach(() => {
      listener = jest.fn();
      sse = new SSE("http://example.com");
      sse.addEventListener("message", listener);
    });

    it("should strip exactly one leading space from field value", () => {
      sse.xhr.responseText = "data: hello\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener.mock.calls[0][0].data).toBe("hello");
    });

    it("should preserve value when no space after colon", () => {
      sse.xhr.responseText = "data:hello\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener.mock.calls[0][0].data).toBe("hello");
    });

    it("should strip only the first space (preserve additional leading spaces)", () => {
      // Per spec: "If value starts with a U+0020 SPACE character, remove it from value"
      // Only ONE space is removed
      sse.xhr.responseText = "data:  two spaces\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener.mock.calls[0][0].data).toBe(" two spaces");
    });

    it("should preserve multiple leading spaces after the first", () => {
      sse.xhr.responseText = "data:    four spaces\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener.mock.calls[0][0].data).toBe("   four spaces");
    });

    it("should handle fields with colons in the value", () => {
      sse.xhr.responseText = "data: time: 12:30:00\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener.mock.calls[0][0].data).toBe("time: 12:30:00");
    });

    it("should use empty string for field with no value (field name only)", () => {
      sse.xhr.responseText = "data\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].data).toBe("");
    });

    it("should handle field with colon but no value", () => {
      sse.xhr.responseText = "data:\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].data).toBe("");
    });

    it("should ignore unknown field names", () => {
      sse.xhr.responseText =
        "unknownfield: ignored\ndata: actual\ncustom: also ignored\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].data).toBe("actual");
    });
  });
});

// =============================================================================
// SSE Spec 9.2.6: Interpreting an event stream
// =============================================================================

describe("SSE Spec 9.2.6: Interpreting an event stream", () => {
  /**
   * "If the line is empty (a blank line), dispatch the event"
   */
  describe("Event dispatch on blank line", () => {
    let sse;
    let listener;

    beforeEach(() => {
      listener = jest.fn();
      sse = new SSE("http://example.com");
      sse.addEventListener("message", listener);
    });

    it("should dispatch event on blank line (LF)", () => {
      sse.xhr.responseText = "data: test\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should dispatch event on blank line (CR)", () => {
      sse.xhr.responseText = "data: test\r\r";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should dispatch event on blank line (CRLF)", () => {
      sse.xhr.responseText = "data: test\r\n\r\n";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should not dispatch incomplete event (no trailing blank line)", () => {
      sse.xhr.responseText = "data: incomplete";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(0);
    });

    it("should dispatch incomplete event on stream end (load)", () => {
      sse.xhr.responseText = "data: completed on load";
      sse.xhr.trigger("load", {});

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].data).toBe("completed on load");
    });
  });

  /**
   * Data field handling:
   * "If the field name is 'data': Append the field value to the data buffer,
   *  then append a single U+000A LINE FEED (LF) character to the data buffer."
   */
  describe("Data field handling", () => {
    let sse;
    let listener;

    beforeEach(() => {
      listener = jest.fn();
      sse = new SSE("http://example.com");
      sse.addEventListener("message", listener);
    });

    it("should concatenate multiple data fields with newlines", () => {
      sse.xhr.responseText = "data: line1\ndata: line2\ndata: line3\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener.mock.calls[0][0].data).toBe("line1\nline2\nline3");
    });

    it("should handle data field with empty value", () => {
      sse.xhr.responseText = "data:\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener.mock.calls[0][0].data).toBe("");
    });

    it("should handle multiple empty data fields (creates newlines)", () => {
      sse.xhr.responseText = "data\ndata\ndata\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener.mock.calls[0][0].data).toBe("\n\n");
    });

    it("should handle mixed empty and non-empty data fields", () => {
      sse.xhr.responseText = "data: first\ndata\ndata: last\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener.mock.calls[0][0].data).toBe("first\n\nlast");
    });

    it("should handle data with only whitespace", () => {
      sse.xhr.responseText = "data:  \n\n";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].data).toBe(" ");
    });

    it("should handle data that is just spaces", () => {
      sse.xhr.responseText = "data:     \n\n";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].data).toBe("    ");
    });

    it("should preserve trailing whitespace in data", () => {
      sse.xhr.responseText = "data: hello   \n\n";
      sse.xhr.trigger("progress", {});

      expect(listener.mock.calls[0][0].data).toBe("hello   ");
    });

    it("should preserve internal whitespace in data", () => {
      sse.xhr.responseText = "data: hello    world\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener.mock.calls[0][0].data).toBe("hello    world");
    });
  });

  /**
   * Event type field handling:
   * "If the field name is 'event': Set the event type buffer to the field value."
   */
  describe("Event type field handling", () => {
    let sse;
    let messageListener;
    let customListener;

    beforeEach(() => {
      messageListener = jest.fn();
      customListener = jest.fn();
      sse = new SSE("http://example.com");
      sse.addEventListener("message", messageListener);
      sse.addEventListener("custom", customListener);
    });

    it("should use 'message' as default event type", () => {
      sse.xhr.responseText = "data: test\n\n";
      sse.xhr.trigger("progress", {});

      expect(messageListener).toHaveBeenCalledTimes(1);
      expect(messageListener.mock.calls[0][0].type).toBe("message");
    });

    it("should use custom event type when specified", () => {
      sse.xhr.responseText = "event: custom\ndata: test\n\n";
      sse.xhr.trigger("progress", {});

      expect(messageListener).toHaveBeenCalledTimes(0);
      expect(customListener).toHaveBeenCalledTimes(1);
      expect(customListener.mock.calls[0][0].type).toBe("custom");
    });

    it("should reset event type to default after dispatch", () => {
      sse.xhr.responseText =
        "event: custom\ndata: first\n\ndata: second\n\n";
      sse.xhr.trigger("progress", {});

      expect(customListener).toHaveBeenCalledTimes(1);
      expect(messageListener).toHaveBeenCalledTimes(1);
      expect(messageListener.mock.calls[0][0].data).toBe("second");
    });

    it("should use last event type if multiple specified", () => {
      sse.xhr.responseText =
        "event: ignored\nevent: custom\ndata: test\n\n";
      sse.xhr.trigger("progress", {});

      expect(customListener).toHaveBeenCalledTimes(1);
    });

    it("should handle empty event type (fallback to message)", () => {
      sse.xhr.responseText = "event:\ndata: test\n\n";
      sse.xhr.trigger("progress", {});

      expect(messageListener).toHaveBeenCalledTimes(1);
    });

    it("should handle event type with spaces", () => {
      const spaceListener = jest.fn();
      sse.addEventListener("my event", spaceListener);

      sse.xhr.responseText = "event: my event\ndata: test\n\n";
      sse.xhr.trigger("progress", {});

      expect(spaceListener).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * ID field handling:
   * "If the field name is 'id': If the field value does not contain U+0000 NULL,
   *  then set the last event ID buffer to the field value. Otherwise, ignore the field."
   */
  describe("ID field handling", () => {
    let sse;
    let listener;

    beforeEach(() => {
      listener = jest.fn();
      sse = new SSE("http://example.com");
      sse.addEventListener("message", listener);
    });

    it("should set lastEventId from id field", () => {
      sse.xhr.responseText = "id: 123\ndata: test\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener.mock.calls[0][0].lastEventId).toBe("123");
      expect(sse.lastEventId).toBe("123");
    });

    it("should persist lastEventId across events", () => {
      sse.xhr.responseText = "id: abc\ndata: first\n\ndata: second\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener.mock.calls[0][0].lastEventId).toBe("abc");
      expect(listener.mock.calls[1][0].lastEventId).toBe("abc");
    });

    it("should update lastEventId when new id is provided", () => {
      sse.xhr.responseText =
        "id: first\ndata: msg1\n\nid: second\ndata: msg2\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener.mock.calls[0][0].lastEventId).toBe("first");
      expect(listener.mock.calls[1][0].lastEventId).toBe("second");
    });

    it("should reset lastEventId to empty string when id field has no value", () => {
      sse.xhr.responseText =
        "id: initial\ndata: msg1\n\nid\ndata: msg2\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener.mock.calls[0][0].lastEventId).toBe("initial");
      expect(listener.mock.calls[1][0].lastEventId).toBe("");
      expect(sse.lastEventId).toBe("");
    });

    it("should reset lastEventId when id field has empty value (id:)", () => {
      sse.xhr.responseText =
        "id: initial\ndata: msg1\n\nid:\ndata: msg2\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener.mock.calls[0][0].lastEventId).toBe("initial");
      expect(listener.mock.calls[1][0].lastEventId).toBe("");
    });

    it("should ignore id field containing NULL character", () => {
      sse.xhr.responseText =
        "id: valid\ndata: msg1\n\nid: has\0null\ndata: msg2\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener.mock.calls[0][0].lastEventId).toBe("valid");
      expect(listener.mock.calls[1][0].lastEventId).toBe("valid");
      expect(sse.lastEventId).toBe("valid");
    });

    it("should handle id with spaces", () => {
      sse.xhr.responseText = "id: my event id\ndata: test\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener.mock.calls[0][0].lastEventId).toBe("my event id");
    });

    it("should handle numeric id", () => {
      sse.xhr.responseText = "id: 42\ndata: test\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener.mock.calls[0][0].lastEventId).toBe("42");
    });
  });

  /**
   * Retry field handling:
   * "If the field name is 'retry': If the field value consists of only ASCII digits,
   *  then interpret the field value as an integer in base ten, and set the event stream's
   *  reconnection time to that integer. Otherwise, ignore the field."
   */
  describe("Retry field handling", () => {
    let sse;
    let listener;

    beforeEach(() => {
      listener = jest.fn();
      sse = new SSE("http://example.com");
      sse.addEventListener("message", listener);
    });

    it("should update reconnectDelay when retry is valid integer", () => {
      const initialDelay = sse.reconnectDelay;
      sse.xhr.responseText = "retry: 5000\ndata: test\n\n";
      sse.xhr.trigger("progress", {});

      expect(sse.reconnectDelay).toBe(5000);
      expect(sse.reconnectDelay).not.toBe(initialDelay);
    });

    it("should ignore retry field with non-digit characters", () => {
      const initialDelay = sse.reconnectDelay;
      sse.xhr.responseText = "retry: 5000ms\ndata: test\n\n";
      sse.xhr.trigger("progress", {});

      expect(sse.reconnectDelay).toBe(initialDelay);
    });

    it("should ignore retry field with negative number", () => {
      const initialDelay = sse.reconnectDelay;
      sse.xhr.responseText = "retry: -1000\ndata: test\n\n";
      sse.xhr.trigger("progress", {});

      expect(sse.reconnectDelay).toBe(initialDelay);
    });

    it("should ignore retry field with decimal number", () => {
      const initialDelay = sse.reconnectDelay;
      sse.xhr.responseText = "retry: 1000.5\ndata: test\n\n";
      sse.xhr.trigger("progress", {});

      expect(sse.reconnectDelay).toBe(initialDelay);
    });

    it("should handle retry field with zero", () => {
      sse.xhr.responseText = "retry: 0\ndata: test\n\n";
      sse.xhr.trigger("progress", {});

      expect(sse.reconnectDelay).toBe(0);
    });

    it("should handle retry field with large number", () => {
      sse.xhr.responseText = "retry: 999999999\ndata: test\n\n";
      sse.xhr.trigger("progress", {});

      expect(sse.reconnectDelay).toBe(999999999);
    });

    it("should ignore empty retry field", () => {
      const initialDelay = sse.reconnectDelay;
      sse.xhr.responseText = "retry:\ndata: test\n\n";
      sse.xhr.trigger("progress", {});

      expect(sse.reconnectDelay).toBe(initialDelay);
    });

    it("should ignore retry field with only whitespace", () => {
      const initialDelay = sse.reconnectDelay;
      sse.xhr.responseText = "retry:   \ndata: test\n\n";
      sse.xhr.trigger("progress", {});

      expect(sse.reconnectDelay).toBe(initialDelay);
    });
  });

  /**
   * Event dispatch rules from spec:
   * "If the data buffer is an empty string, set the data buffer and the event type
   *  buffer to the empty string and return."
   */
  describe("Event dispatch rules", () => {
    let sse;
    let listener;

    beforeEach(() => {
      listener = jest.fn();
      sse = new SSE("http://example.com");
      sse.addEventListener("message", listener);
    });

    it("should not dispatch event if data buffer is empty", () => {
      sse.xhr.responseText = "event: test\nid: 123\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(0);
    });

    it("should dispatch event with empty string data if data field was present but empty", () => {
      sse.xhr.responseText = "data:\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].data).toBe("");
    });

    it("should dispatch event with empty string data when using data without colon", () => {
      sse.xhr.responseText = "data\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].data).toBe("");
    });

    it("should still update lastEventId even if no event dispatched", () => {
      sse.xhr.responseText = "id: saved-id\n\ndata: test\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(1);
      expect(sse.lastEventId).toBe("saved-id");
    });
  });
});

// =============================================================================
// Edge Cases and Special Scenarios
// =============================================================================

describe("SSE Edge Cases", () => {
  /**
   * Whitespace handling (Issue #108)
   * https://github.com/mpetazzoni/sse.js/issues/108
   */
  describe("Whitespace handling (Issue #108)", () => {
    let sse;
    let listener;

    beforeEach(() => {
      listener = jest.fn();
      sse = new SSE("http://example.com");
      sse.addEventListener("message", listener);
    });

    it("should handle chunk containing only whitespace data", () => {
      sse.xhr.responseText = "data:  \n\n";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].data).toBe(" ");
    });

    it("should handle data that is multiple spaces", () => {
      sse.xhr.responseText = "data:       \n\n";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].data).toBe("      ");
    });

    it("should handle data with tabs", () => {
      sse.xhr.responseText = "data: \t\t\t\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].data).toBe("\t\t\t");
    });

    it("should handle markdown-like content with leading spaces", () => {
      sse.xhr.responseText = "data:     code block\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].data).toBe("    code block");
    });

    it("should handle multiline markdown with preserved indentation", () => {
      sse.xhr.responseText =
        "data: ```\ndata:     indented code\ndata:     more code\ndata: ```\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].data).toBe(
        "```\n    indented code\n    more code\n```"
      );
    });
  });

  describe("Buffering and chunked delivery", () => {
    let sse;
    let listener;

    beforeEach(() => {
      listener = jest.fn();
      sse = new SSE("http://example.com");
      sse.addEventListener("message", listener);
    });

    it("should handle event split across multiple chunks", () => {
      sse.xhr.responseText = "data: hel";
      sse.xhr.trigger("progress", {});
      expect(listener).toHaveBeenCalledTimes(0);

      sse.xhr.responseText = "data: hello\n\n";
      sse.xhr.trigger("progress", {});
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].data).toBe("hello");
    });

    it("should handle multiple events in single chunk", () => {
      sse.xhr.responseText =
        "data: first\n\ndata: second\n\ndata: third\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(3);
    });

    it("should handle blank line split across chunks", () => {
      sse.xhr.responseText = "data: test\n";
      sse.xhr.trigger("progress", {});
      expect(listener).toHaveBeenCalledTimes(0);

      sse.xhr.responseText = "data: test\n\n";
      sse.xhr.trigger("progress", {});
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe("BOM handling", () => {
    let sse;
    let listener;

    beforeEach(() => {
      listener = jest.fn();
      sse = new SSE("http://example.com");
      sse.addEventListener("message", listener);
    });

    it("should handle UTF-8 BOM at start of stream", () => {
      sse.xhr.responseText = "\uFEFFdata: after bom\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalled();
      expect(listener.mock.calls[0][0].data).toBe("after bom");
    });
  });

  describe("Field order independence", () => {
    let sse;
    let listener;

    beforeEach(() => {
      listener = jest.fn();
      sse = new SSE("http://example.com");
      sse.addEventListener("message", listener);
    });

    it("should handle id before data", () => {
      sse.xhr.responseText = "id: 1\ndata: test\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener.mock.calls[0][0].id).toBe("1");
      expect(listener.mock.calls[0][0].data).toBe("test");
    });

    it("should handle data before id", () => {
      sse.xhr.responseText = "data: test\nid: 1\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener.mock.calls[0][0].id).toBe("1");
      expect(listener.mock.calls[0][0].data).toBe("test");
    });

    it("should handle event type at any position", () => {
      const customListener = jest.fn();
      sse.addEventListener("myevent", customListener);

      sse.xhr.responseText =
        "data: first\nevent: myevent\ndata: second\nid: 1\n\n";
      sse.xhr.trigger("progress", {});

      expect(customListener).toHaveBeenCalledTimes(1);
      expect(customListener.mock.calls[0][0].data).toBe("first\nsecond");
    });
  });

  describe("Unicode and special characters", () => {
    let sse;
    let listener;

    beforeEach(() => {
      listener = jest.fn();
      sse = new SSE("http://example.com");
      sse.addEventListener("message", listener);
    });

    it("should handle Unicode in data", () => {
      sse.xhr.responseText = "data: Hello \u4e16\u754c\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener.mock.calls[0][0].data).toBe("Hello \u4e16\u754c");
    });

    it("should handle emoji in data", () => {
      sse.xhr.responseText = "data: Hello \uD83D\uDE00\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener.mock.calls[0][0].data).toBe("Hello \uD83D\uDE00");
    });
  });

  describe("Complex real-world scenarios", () => {
    let sse;
    let listener;

    beforeEach(() => {
      listener = jest.fn();
      sse = new SSE("http://example.com");
      sse.addEventListener("message", listener);
    });

    it("should handle JSON data with special characters", () => {
      const json = '{"key": "value", "nested": {"a": 1}}';
      sse.xhr.responseText = `data: ${json}\n\n`;
      sse.xhr.trigger("progress", {});

      expect(listener.mock.calls[0][0].data).toBe(json);
      expect(() => JSON.parse(listener.mock.calls[0][0].data)).not.toThrow();
    });

    it("should handle multiline JSON data", () => {
      sse.xhr.responseText =
        'data: {"line1": "value1",\ndata:  "line2": "value2"}\n\n';
      sse.xhr.trigger("progress", {});

      const expectedJson = '{"line1": "value1",\n "line2": "value2"}';
      expect(listener.mock.calls[0][0].data).toBe(expectedJson);
    });

    it("should handle SSE keep-alive comments", () => {
      sse.xhr.responseText = ": keep-alive\ndata: actual\n\n";
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].data).toBe("actual");
    });

    it("should handle rapid successive events", () => {
      for (let i = 0; i < 100; i++) {
        sse.xhr.responseText += `data: event${i}\n\n`;
      }
      sse.xhr.trigger("progress", {});

      expect(listener).toHaveBeenCalledTimes(100);
    });

    it("should handle events with all fields", () => {
      const customListener = jest.fn();
      sse.addEventListener("custom", customListener);

      sse.xhr.responseText =
        "id: evt-1\nevent: custom\nretry: 1000\ndata: full event\n\n" +
        "id: evt-2\nevent: custom\nretry: 2000\ndata: another\n\n";
      sse.xhr.trigger("progress", {});

      expect(customListener).toHaveBeenCalledTimes(2);
      expect(sse.lastEventId).toBe("evt-2");
      expect(sse.reconnectDelay).toBe(2000);
    });
  });
});

// =============================================================================
// WHATWG Specification Examples
// =============================================================================

describe("SSE WHATWG Specification Examples", () => {
  let sse;

  beforeEach(() => {
    sse = new SSE("http://example.com");
  });

  it("should handle spec example: stock ticker", () => {
    const listener = jest.fn();
    sse.addEventListener("message", listener);

    sse.xhr.responseText = "data: YHOO\ndata: +2\ndata: 10\n\n";
    sse.xhr.trigger("progress", {});

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].data).toBe("YHOO\n+2\n10");
  });

  it("should handle spec example: add/remove events", () => {
    const addListener = jest.fn();
    const removeListener = jest.fn();
    sse.addEventListener("add", addListener);
    sse.addEventListener("remove", removeListener);

    sse.xhr.responseText =
      "event: add\ndata: 73857293\n\n" +
      "event: remove\ndata: 2153\n\n" +
      "event: add\ndata: 113411\n\n";
    sse.xhr.trigger("progress", {});

    expect(addListener).toHaveBeenCalledTimes(2);
    expect(removeListener).toHaveBeenCalledTimes(1);
    expect(addListener.mock.calls[0][0].data).toBe("73857293");
    expect(removeListener.mock.calls[0][0].data).toBe("2153");
    expect(addListener.mock.calls[1][0].data).toBe("113411");
  });

  it("should handle spec example: test stream with comment and id", () => {
    const listener = jest.fn();
    sse.addEventListener("message", listener);

    sse.xhr.responseText =
      ": test stream\n\n" +
      "data: first event\nid: 1\n\n" +
      "data:second event\nid\n\n" +
      "data:  third event\n\n";
    sse.xhr.trigger("progress", {});

    expect(listener).toHaveBeenCalledTimes(3);
    expect(listener.mock.calls[0][0].data).toBe("first event");
    expect(listener.mock.calls[0][0].lastEventId).toBe("1");
    expect(listener.mock.calls[1][0].data).toBe("second event");
    expect(listener.mock.calls[1][0].lastEventId).toBe("");
    expect(listener.mock.calls[2][0].data).toBe(" third event");
  });

  it("should handle spec example: events firing on data fields", () => {
    const listener = jest.fn();
    sse.addEventListener("message", listener);

    sse.xhr.responseText = "data\n\ndata\ndata\n\n";
    sse.xhr.trigger("progress", {});

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener.mock.calls[0][0].data).toBe("");
    expect(listener.mock.calls[1][0].data).toBe("\n");
  });

  it("should handle spec example: space after colon", () => {
    const listener = jest.fn();
    sse.addEventListener("message", listener);

    sse.xhr.responseText = "data:test\n\ndata: test\n\n";
    sse.xhr.trigger("progress", {});

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener.mock.calls[0][0].data).toBe("test");
    expect(listener.mock.calls[1][0].data).toBe("test");
  });
});
