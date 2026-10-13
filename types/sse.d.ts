export type SSE = {
  /** Constructor. */
  new (url: string, options?: SSEOptions): SSE;

    /**
     * - URL
     */
    url: string;
    /**
     * - headers
     */
    headers: SSEHeaders;
    /**
     * - payload
     */
    payload?: SSEPayload;
    /**
     * - HTTP Method
     */
    method: string;
    /**
     * - flag, if credentials needed
     */
    withCredentials: boolean;
    /**
     * - debugging flag
     */
    debug: boolean;
    /**
     * - flag, if connection should auto-reconnect
     */
    autoReconnect: boolean;
    /**
     * - delay in ms before reconnecting
     */
    reconnectDelay: number;
    /**
     * - maximum number of reconnect attempts
     */
    maxRetries: number | null;
    /**
     * - flag, if Last-Event-ID header should be sent
     */
    useLastEventId: boolean;
    FIELD_SEPARATOR: string;
    listeners: Record<string, Function[]>;
    xhr: XMLHttpRequest | null;
    readyState: -1 | 0 | 1 | 2;
    progress: number;
    chunk: string;
    INITIALIZING: -1;
    CONNECTING: 0;
    OPEN: 1;
    CLOSED: 2;
    addEventListener: AddEventListener;
    removeEventListener: RemoveEventListener;
    dispatchEvent: DispatchEvent;
    stream: Stream;
    close: Close;
    onmessage: OnMessage;
    onopen: OnOpen;
    onreadystatechange: OnReadystatechange;
    onerror: OnError;
    onabort: OnAbort;
};
export type SSEHeaders = {
    [key: string]: string;
};
export type SSEPayload = Blob | ArrayBuffer | DataView | FormData | URLSearchParams | string | null;
export type SSEOptions = {
    /**
     * - headers
     */
    headers?: SSEHeaders;
    /**
     * - payload
     */
    payload?: SSEPayload;
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
    /**
     * - flag, if connection should auto-reconnect on disconnect/error
     */
    autoReconnect?: boolean;
    /**
     * - delay in ms before reconnecting
     */
    reconnectDelay?: number;
    /**
     * - maximum number of reconnect attempts
     */
    maxRetries?: number | null;
    /**
     * - flag, if Last-Event-ID header should be sent
     */
    useLastEventId?: boolean;
};
export type _ReadyStateEvent = {
    readyState: -1 | 0 | 1 | 2;
};
export type _MessageEvent = {
    id?: string;
    data: string;
    lastEventId?: string;
};
export type _ErrorEvent = {
    data: string;
    responseCode: number;
};
export type _OpenEvent = {
    responseCode: number;
    headers?: {
        [x: string]: string[];
    };
};
export type _CommonEventProperties = CustomEvent & {
    source: SSE;
};
export type ReadyStateEvent = _CommonEventProperties & _ReadyStateEvent;
export type OpenEvent = _CommonEventProperties & _OpenEvent;
export type MessageEvent = _CommonEventProperties & _MessageEvent;
export type ErrorEvent = _CommonEventProperties & _ErrorEvent;
export type AbortEvent = _CommonEventProperties;
export type SSEvent = ReadyStateEvent | OpenEvent | MessageEvent | ErrorEvent | AbortEvent;
export type _AddReadyStateChangeEventListener = (type: "readystatechange", listener: (event: MessageEvent | ReadyStateEvent) => void) => void;
export type _AddOpenEventListener = (type: "open", listener: (event: MessageEvent | OpenEvent) => void) => void;
export type _AddMessageEventListener = (type: string, listener: (event: MessageEvent) => void) => void;
export type _AddErrorEventListener = (type: "error", listener: (event: MessageEvent | ErrorEvent) => void) => void;
export type _AddAbortEventListener = (type: "abort", listener: (event: MessageEvent | AbortEvent) => void) => void;
export type AddEventListener = _AddReadyStateChangeEventListener & _AddOpenEventListener & _AddMessageEventListener & _AddErrorEventListener & _AddAbortEventListener;
export type RemoveEventListener = (type: string, listener: (event: SSEvent) => void) => void;
export type DispatchEvent = (event: CustomEvent | null) => boolean;
export type Stream = () => void;
export type Close = () => void;
export type OnMessage = (event: MessageEvent) => void;
export type OnOpen = (event: OpenEvent | MessageEvent) => void;
export type OnReadystatechange = (event: ReadyStateEvent | MessageEvent) => void;
export type OnError = (event: ErrorEvent | MessageEvent) => void;
export type OnAbort = (event: AbortEvent | MessageEvent) => void;
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
 * @type SSE
 * @param {string} url
 * @param {SSEOptions} options
 * @return {SSE}
 */
export var SSE: SSE;
//# sourceMappingURL=sse.d.ts.map