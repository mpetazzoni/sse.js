export enum SSEOptionsMethod {
    GET = 'GET',
    POST = 'POST',
}

export enum SSEEventSourceState {
    INITIALIZING = -1,
    CONNECTING = 0,
    OPEN = 1,
    CLOSED = 2,
}

type Callback = (e: CustomEvent) => void;

interface SSEOptions {
    headers?: { [key: string]: string };
    method: SSEOptionsMethod;
    payload?: string;
    withCredentials?: boolean;
    start: boolean;
    debug: boolean;
}

interface SseEvent extends Event {
    id: string;
    data: any;
}

interface ReadyStateEvent extends SseEvent {
    readyState: SSEEventSourceState;
}

declare class SSE {
    constructor(url: string, options: SSEOptions);
    onmessage: ((this: SSE, ev: SseEvent) => any) | null;
    onopen: ((this: SSE, ev: SseEvent) => any) | null;
    onload: ((this: SSE, ev: SseEvent) => any) | null;
    onreadystatechange: ((this: SSE, ev: ReadyStateEvent) => any) | null;
    onerror: ((this: SSE, ev: SseEvent) => any) | null;
    onabort: ((this: SSE, ev: SseEvent) => any) | null;

    addEventListener(type: string, listener: Callback): void;

    removeEventListener(type: string, listener: Callback): void;

    dispatchEvent(type: string): boolean;

    stream(): void;

    close(): void;
}

declare module 'sse.js' {
    export = SSE;
}
