export type SSE = {
    /**
     * - headers
     */
    headers: string;
    /**
     * - payload as a string
     */
    payload: string;
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
export type SSEHeader = {
    [key: string]: string;
};
export type SSEOptions = {
    /**
     * - headers
     */
    headers: SSEHeader;
    /**
     * - payload as a string
     */
    payload: string;
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
 * Copyright (C) 2016-2023 Maxime Petazzoni <maxime.petazzoni@bulix.org>.
 * All rights reserved.
 */
/**
 * @type SSE
 * @param {string} url
 * @param {SSEOptions} options
 * @return {SSE}
 */
export var SSE: SSE;
//# sourceMappingURL=sse.d.ts.map