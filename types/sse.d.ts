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
};
export type SSEHeader = {
    [key: string]: string;
};
export type SSEOptions = {
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
};
/**
 * Copyright (C) 2016-2023 Maxime Petazzoni <maxime.petazzoni@bulix.org>.
 * All rights reserved.
 */
/**
 * @typedef { {[key: string]: string} } SSEHeader
 */
/**
 * @typedef {Object} SSEOptions
 * @property {string} headers - headers
 * @property {string} payload - payload as a string
 * @property {string} method - HTTP Method
 * @property {boolean} withCredentials - flag, if credentials needed
 * @property {boolean} debug - debugging flag
 */
/**
 * @typedef {Object} SSE
 * @property {string} headers - headers
 * @property {string} payload - payload as a string
 * @property {string} method - HTTP Method
 * @property {boolean} withCredentials - flag, if credentials needed
 * @property {boolean} debug - debugging flag
 */
/**
 * @type SSE
 * @param {string} url
 * @param {SSEOptions} options
 * @return {SSE}
 */
export var SSE: SSE;
//# sourceMappingURL=sse.d.ts.map