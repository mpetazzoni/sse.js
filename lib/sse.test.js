import { SSE } from 'sse.js';

// Setup Mocking for XMLHttpRequest
function createMockXHR() {
  const eventHandlers = {};

  const mockXHR = {
    open: jest.fn(),
    send: jest.fn(),
    abort: jest.fn(),
    setRequestHeader: jest.fn(),
    responseText: '',
    status: 200,
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

// Reset the Mock before each test
beforeEach(() => {
  global.XMLHttpRequest = jest.fn(createMockXHR);
});



describe('SSE Initialization', () => {
  
  it('should initialize with default options', () => {
    const sse = new SSE('http://example.com');
    expect(sse.method).toBe('GET');
    expect(sse.url).toBe('http://example.com');
    expect(sse.payload).toBe('')
    expect(sse.headers).toStrictEqual({})
    expect(sse.readyState).toBe(sse.CONNECTING)
    expect(sse.listeners).toStrictEqual({})
    expect(sse.chunk).toBe('')
  });

  it('should initialize with custom headers', () => {
    const options = { method: 'POST', headers: { 'X-Custom-Header': 'value' } };
    const sse = new SSE('http://example.com', options);
    expect(sse.method).toBe('POST');
    expect(sse.headers['X-Custom-Header']).toBe('value');
  });

  it('should initialize with explicit POST', () => {
    const options = { method: 'POST' };
    const sse = new SSE('http://example.com', options);
    expect(sse.method).toBe('POST');
  });

  it('should initialize with implicit POST', () => {
    const options = { payload: '{"mydata": "something"}' };
    const sse = new SSE('http://example.com', options);
    expect(sse.method).toBe('POST');
    expect(sse.payload).toBe('{"mydata": "something"}')
  });

});


describe('SSE Lifecycle', () => {
  let sse;

  beforeEach(() => {
    sse = new SSE('http://example.com', { start: false });
  });

  it('should start in an initializing state', () => {
    expect(sse.readyState).toBe(sse.INITIALIZING);
  });

  it('should start a connection when stream method is called', () => {
    sse.stream();
    expect(sse.xhr.open).toHaveBeenCalledWith('GET', 'http://example.com');
    expect(sse.xhr.send).toHaveBeenCalledWith('');
    expect(sse.readyState).toBe(sse.CONNECTING);
  });

  it('should become ready on receiving data', () => {
    sse.stream();
    sse.xhr.trigger('progress', {});
    expect(sse.readyState).toBe(sse.OPEN);
  });

  it('should handle a normal connection close', () => {
    sse.stream();
    sse.xhr.trigger('progress', {});
    sse.xhr.readyState = XMLHttpRequest.DONE;
    sse.xhr.trigger('readystatechange', {});
    expect(sse.readyState).toBe(sse.CLOSED);
  });

  it('should handle connection close due to error', () => {
    sse.stream();
    const mockErrorEvent = {
      currentTarget: {
        response: 'Error message or response data'
      }
    };
    sse.xhr.trigger('error', mockErrorEvent);
    expect(sse.readyState).toBe(sse.CLOSED);
  });

  it('should handle connection close due to abort', () => {
    sse.stream();
    sse.xhr.trigger('abort', {});
    expect(sse.readyState).toBe(sse.CLOSED);
  });
});

describe('SSE Event handling and Listeners', () => {
  let sse;
  let listener;
  let customListener;

  beforeEach(() => {
    listener = jest.fn();
    customListener = jest.fn()
    sse = new SSE('http://example.com');
    sse.addEventListener('message', listener);
    sse.addEventListener('customEvent', customListener);
  });

  it('should handle a single data event', () => {
    sse.xhr.responseText = 'data: Test message\n\n';
    sse.xhr.trigger('progress', {});

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].data).toBe('Test message');
    expect(listener.mock.calls[0][0].event).toBe(undefined);
    expect(listener.mock.calls[0][0].id).toBe(null);
  })

  it('should handle events with ids', () => {
    sse.xhr.responseText = 'id: 1\ndata: Test message\n\n';
    sse.xhr.trigger('progress', {});

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].data).toBe('Test message');
    expect(listener.mock.calls[0][0].event).toBe(undefined);
    expect(listener.mock.calls[0][0].id).toBe("1");
  })  

  it('should handle multiple data events', () => {
    sse.xhr.responseText = 'data: First message\n\n';
    sse.xhr.trigger('progress', {});
    sse.xhr.responseText += 'data: Second message\n\n';
    sse.xhr.trigger('progress', {});

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener.mock.calls[0][0].data).toBe('First message');
    expect(listener.mock.calls[0][0].event).toBe(undefined);
    expect(listener.mock.calls[0][0].id).toBe(null);
    expect(listener.mock.calls[1][0].data).toBe('Second message');
    expect(listener.mock.calls[1][0].event).toBe(undefined);
    expect(listener.mock.calls[1][0].id).toBe(null);
  });

  it('should handle repeat data elements', () => {
    sse.xhr.responseText = 'data: Test message\ndata: more message\n\n';
    sse.xhr.trigger('progress', {});

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].data).toBe('Test message\nmore message');
    expect(listener.mock.calls[0][0].event).toBe(undefined);
    expect(listener.mock.calls[0][0].id).toBe(null);
  })  

  it('should handle an event with a custom event type', () => {
    sse.xhr.responseText = 'event: customEvent\ndata: Custom event data\n\n';
    sse.xhr.trigger('progress', {});

    console.log(customListener.mock.calls[0][0])
    expect(listener).toHaveBeenCalledTimes(0);
    expect(customListener).toHaveBeenCalledTimes(1);
    expect(customListener.mock.calls[0][0].data).toBe('Custom event data');
    expect(customListener.mock.calls[0][0].type).toBe('customEvent');
    expect(customListener.mock.calls[0][0].id).toBe(null);
  });
  
  it('should handle events different field orders', () => {
    sse.xhr.responseText = 'data: Custom event data\nevent: customEvent\nid: 1\n\n';
    sse.xhr.trigger('progress', {});

    expect(listener).toHaveBeenCalledTimes(0);
    expect(customListener).toHaveBeenCalledTimes(1);
    expect(customListener.mock.calls[0][0].data).toBe('Custom event data');
    expect(customListener.mock.calls[0][0].type).toBe('customEvent');
    expect(customListener.mock.calls[0][0].id).toBe("1");
  });

  it('should handle \\r style newlines', () => {
    sse.xhr.responseText = 'event: customEvent\rdata: Custom event data\r\r';
    sse.xhr.trigger('progress', {});
    expect(listener).toHaveBeenCalledTimes(0);
    expect(customListener).toHaveBeenCalledTimes(1);
    expect(customListener.mock.calls[0][0].data).toBe('Custom event data');
    expect(customListener.mock.calls[0][0].type).toBe('customEvent');
  });

  it('should handle \\r\\n style newlines', () => {
    sse.xhr.responseText = 'event: customEvent\r\ndata: Custom event data\r\n\r\n';
    sse.xhr.trigger('progress', {});
    expect(listener).toHaveBeenCalledTimes(0);
    expect(customListener).toHaveBeenCalledTimes(1);
    expect(customListener.mock.calls[0][0].data).toBe('Custom event data');
    expect(customListener.mock.calls[0][0].type).toBe('customEvent');
  });

  it('should remove listeners successfully', () => {
    sse.removeEventListener('message', listener);
    sse.xhr.responseText = 'data: Test message\n\n';
    sse.xhr.trigger('progress', {});
    expect(listener).toHaveBeenCalledTimes(0);
  });

});

