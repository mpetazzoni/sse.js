export type SSEHeaders = {
    [key: string]: string;
};
export type SSEOptions = {
    /**
     * - headers
     */
    headers?: SSEHeaders;
    /**
     * - payload as a string
     */
    payload?: string;
    /**
     * - HTTP Method
     */
    method?: string;
    /**
     * - flag, if credentials needed
     */
    withCredentials?: boolean;
    /**
     * - flag, if streaming should start automatically
     */
    start?: boolean;
    /**
     * - debugging flag
     */
    debug?: boolean;
};
export type _SSEvent = {
    id: string;
    data: string;
};
export type _ReadyStateEvent = {
    readyState: number;
};
export type SSEvent = Event & _SSEvent;
export type ReadyStateEvent = SSEvent & _ReadyStateEvent;
export type Stream = () => void;
export type Close = () => void;
export type OnOpen = (event: SSEvent) => void;
export type OnLoad = (event: SSEvent) => void;
export type OnReadyStateChange = (event: ReadyStateEvent) => void;
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
 */
/**
 * @typedef { {[key: string]: string} } SSEHeaders
 */
/**
 * @typedef {Object} SSEOptions
 * @property {SSEHeaders} [headers] - headers
 * @property {string} [payload] - payload as a string
 * @property {string} [method] - HTTP Method
 * @property {boolean} [withCredentials] - flag, if credentials needed
 * @property {boolean} [start] - flag, if streaming should start automatically
 * @property {boolean} [debug] - debugging flag
 */
/**
 * @typedef {Object} _SSEvent
 * @property {string} id
 * @property {string} data
 */
/**
 * @typedef {Object} _ReadyStateEvent
 * @property {number} readyState
 */
/**
 * @typedef {Event & _SSEvent} SSEvent
 */
/**
 * @typedef {SSEvent & _ReadyStateEvent} ReadyStateEvent
 */
/**
 * @callback Stream
 * @returns {void}
 */
/**
 * @callback Close
 * @returns {void}
 */
/**
 * @callback OnOpen
 * @param {SSEvent} event
 * @returns {void}
 */
/**
 * @callback OnLoad
 * @param {SSEvent} event
 * @returns {void}
 */
/**
 * @callback OnReadyStateChange
 * @param {ReadyStateEvent} event
 * @returns {void}
 */
/**
 * @callback {OnError}
 * @param {SSEEvent} event
 * @returns {void}
 */
/**
 * @callback {OnAbort}
 * @param {SSEEvent} event
 * @returns {void}
 */
/**
 * @callback {OnMessage}
 * @param {SSEEvent} event
 * @returns {void}
 */
/**
 * @type {SSE}
 * @property {SSEHeaders} headers
 * @property {string} payload - Payload to send in the XHR request
 * @property {string} method - HTTP Method
 * @property {boolean} withCredentials - flag, if credentials needed
 * @property {boolean} debug - debugging flag
 * @property {string} FIELD_SEPARATOR
 * @property {Record<string, Function[]>} listeners
 * @property {XMLHttpRequest | null} xhr
 * @property {number} readyState
 * @property {number} progress
 * @property {string} chunk
 * @property {string} lastEventId
 * @property {-1} INITIALIZING
 * @property {0} CONNECTING
 * @property {1} OPEN
 * @property {2} CLOSED
 * @property {Stream} stream
 * @property {Close} close
 * @property {OnOpen} onopen
 * @property {OnLoad} onload
 * @property {OnReadyStateChange} onreadystatechange
 * @property {OnError} onerror
 * @property {OnAbort} onabort
 * @property {OnMessage} onmessage
 */
export function SSE(url: any, options: any): any;
export class SSE {
    constructor(url: any, options: any);
    /** @type {number} */
    INITIALIZING: number;
    /** @type {number} */
    CONNECTING: number;
    /** @type {number} */
    OPEN: number;
    /** @type {number} */
    CLOSED: number;
    /** @type {string} */
    url: string;
    headers: any;
    payload: any;
    method: any;
    withCredentials: any;
    debug: any;
    /** @type {string} */
    FIELD_SEPARATOR: string;
    /** @type { {[key: string]: [EventListener]} } */
    listeners: {
        [key: string]: [EventListener];
    };
    /** @type {XMLHttpRequest} */
    xhr: XMLHttpRequest;
    /** @type {number} */
    readyState: number;
    /** @type {number} */
    progress: number;
    /** @type {string} */
    chunk: string;
    /** @type {string} */
    lastEventId: string;
    /**
     * @param {string} type
     * @param {EventListener} listener
     * @returns {void}
     */
    addEventListener: any;
    /**
     * @param {string} type
     * @param {EventListener} listener
     * @returns {void}
     */
    removeEventListener: any;
    /**
     * @param {Event} e
     * @returns {boolean}
     */
    dispatchEvent: any;
    /** @private */
    private _setReadyState;
    /** @private */
    private _onStreamFailure;
    /** @private */
    private _onStreamAbort;
    /** @private */
    private _onStreamProgress;
    /** @private */
    private _onStreamLoaded;
    /**
     * @private
     *
     * Parse a received SSE event chunk into a constructed event object.
     * Reference: https://html.spec.whatwg.org/multipage/server-sent-events.html#dispatchMessage
     */
    private _parseEventChunk;
    /** @private */
    private _checkStreamClosed;
    /**
     * Starts the streaming; only needed if the start option was set to false.
     * @type {Stream}
     */
    stream: Stream;
    /**
     * Closes the stream
     * @type {Close}
     */
    close: Close;
}
//# sourceMappingURL=sse.d.ts.map