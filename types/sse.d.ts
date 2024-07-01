export type SSE = {
  /** Constructor. */
  new (url: string, options?: SSEOptions): SSE;

  /**
   * - headers
   */
  headers: SSEHeaders;
  /**
   * - payload as a Blob, ArrayBuffer, Dataview, FormData, URLSearchParams, or string
   */
  payload?: Blob | ArrayBuffer | DataView | FormData | URLSearchParams | string;
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
  FIELD_SEPARATOR: string;
  listeners: Record<string, Function[]>;
  xhr: XMLHttpRequest | null;
  readyState: number;
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
  onload: OnLoad;
  onreadystatechange: OnReadystatechange;
  onerror: OnError;
  onabort: OnAbort;
};
export type SSEHeaders = {
  [key: string]: string;
};
export type SSEOptions = {
  /**
   * - headers
   */
  headers?: SSEHeaders;
  /**
   * - payload as a Blob, ArrayBuffer, Dataview, FormData, URLSearchParams, or string
   */
  payload?: Blob | ArrayBuffer | DataView | FormData | URLSearchParams | string;
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
export type AddEventListener = (type: string, listener: Function) => void;
export type RemoveEventListener = (type: string, listener: Function) => void;
export type DispatchEvent = (type: string, listener: Function) => boolean;
export type Stream = () => void;
export type Close = () => void;
export type OnMessage = (event: SSEvent) => void;
export type OnOpen = (event: SSEvent) => void;
export type OnLoad = (event: SSEvent) => void;
export type OnReadystatechange = (event: ReadyStateEvent) => void;
export type OnError = (event: SSEvent) => void;
export type OnAbort = (event: SSEvent) => void;
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
