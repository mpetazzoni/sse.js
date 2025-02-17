export type SSE = {
    /** Constructor. */
    new (url: string, options?: SSEOptions): SSE;

    /**
     * - headers
     */
    headers: SSEHeaders;
    /**
     * - Payload to send in the XHR request
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
    stream: Stream;
    close: Close;
    onmessage: OnMessage;
    onopen: OnOpen;
    onload: OnLoad;
    onreadystatechange: OnReadyStateChange;
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
export type _ErrorEVent = {
    responseCode: number;
    data: string;
};
export type SSEvent = Event & _SSEvent;
export type ReadyStateEvent = SSEvent & _ReadyStateEvent;
export type ErrorEvent = SSEvent & _ErrorEVent;
export type Stream = () => void;
export type Close = () => void;
export type OnMessage = (event: SSEvent) => void;
export type OnOpen = (event: SSEvent) => void;
export type OnLoad = (event: SSEvent) => void;
export type OnReadyStateChange = (event: ReadyStateEvent) => void;
export type OnError = (event: ErrorEvent) => void;
export type OnAbort = (event: SSEvent) => void;

export var SSE: SSE;
//# sourceMappingURL=sse.d.ts.map