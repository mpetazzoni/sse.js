sse.js
======

``sse.js`` is a flexible ``EventSource`` replacement for JavaScript designed to
consume Server Side Events streams with more control and options than the
standard ``EventSource``. The main limitations of ``EventSource`` are that it
only supports no-payload GET requests, and does not support specifying
additional custom headers to the HTTP request.

This package is designed to provide a usable replace to ``EventSource`` that
makes all of this possible: ``SSE``.

Usage
-----

The most simple way to use ``SSE`` is to create the ``SSE`` object, attach one
or more listeners, and activate the stream:

.. code:: javascript

    var source = new SSE(url);
    source.addEventListener('message', function(data) {
      // Assuming we receive JSON-encoded data payloads:
      var payload = JSON.parse(data);
      console.log(payload);
    });
    source.stream();

Listening for specific event types
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The Server Side Events specification allows for arbitrary event types, as the
``event`` field of the event. The default event type is ``message``, so you'll
most likely want to register a listener for this kind of events. If you expect
another type of events, simply register your callback with the appropriate
event type:

.. code:: javascript

    var source = new SSE(url);
    source.addEventListener('status', function(data) {
      console.log('System status is now: ' + data);
    });
    source.stream();

Passing custom headers
~~~~~~~~~~~~~~~~~~~~~~

.. code:: javascript

    var source = new SSE(url, {headers: {'Authorization': 'Bearer 0xdeadbeef'}});

Making a POST request
~~~~~~~~~~~~~~~~~~~~~

To make a HTTP POST request, simply specify a ``payload`` in the options:

.. code:: javascript

    var source = new SSE(url, {headers: {'Content-Type': 'text/plain'},
                               payload: 'Hello, world!'});

TODOs and caveats
-----------------

- XmlHttpRequest error handling
- Automatically reconnect with ``Last-Event-ID``
