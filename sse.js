/**
 * Copyright (C) 2016 Maxime Petazzoni <maxime.petazzoni@bulix.org>.
 * All rights reserved.
 */

exports.SSE = function (url, options) {
  if (!(this instanceof SSE)) {
    return new SSE(url, options);
  }

  this.url = url;

  options = options || {};
  this.headers = options.headers || {};
  this.payload = options.payload;
  this.method = this.payload && 'POST' || 'GET';

  this.fieldSeparator = ':';
  this.listeners = {};

  this.xhr = null;
  this.progress = 0;

  this.addEventListener = function(type, callback) {
    if (this.listeners[type] === undefined) {
      this.listeners[type] = [];
    }

    this.listeners[type].push(callback);
  };

  this.dispatch = function(e) {
    if (!(e.event in this.listeners)) {
      console.log('no listeners for ' + e.event + ' events');
      return;
    }

    this.listeners[e.event].forEach(function(c) { c(e.data); });
  };

  this.onProgress = function(e) {
    var data = this.xhr.responseText.substring(this.progress);
    this.progress = e.loaded;

    data.split('\n\n').forEach(function(chunk) {
      var e = {'id': null, 'retry': null, 'data': '', 'event': 'message'};
      chunk.split('\n').forEach(function(line) {
        line = line.trim();
        var index = line.indexOf(this.fieldSeparator);
        if (index <= 0) {
          // Line was either empty, or started with a separator and is a comment.
          // Either way, ignore.
          return;
        }

        var field = line.substring(0, index);
        if (!(field in e)) {
          return;
        }

        var value = line.substring(index + 1).trimLeft();
        if (field === 'data') {
          e[field] += value;
        } else {
          e[field] = value;
        }
      }.bind(this));
      this.dispatch(e);
    }.bind(this));
  };

  this.stream = function() {
    this.xhr = new XMLHttpRequest();
    this.xhr.addEventListener('progress', this.onProgress.bind(this));
    this.xhr.addEventListener('load', this.onProgress.bind(this));
    this.xhr.open(this.method, this.url);
    for (var header in this.headers) {
      this.xhr.setRequestHeader(header, this.headers[header]);
    }
    this.xhr.send(this.payload);
  };
}
