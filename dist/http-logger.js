"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLogger = exports.HttpLogger = void 0;
const http_config_1 = require("./http-config");
class HttpLogger {
    constructor() {
        this.config = {
            enabled: true,
            level: http_config_1.DebugLevel.ERROR,
            format: 'console',
            colors: true
        };
    }
    static getInstance() {
        if (!HttpLogger.instance) {
            HttpLogger.instance = new HttpLogger();
        }
        return HttpLogger.instance;
    }
    configure(config) {
        this.config = { ...this.config, ...config };
    }
    logError(response) {
        if (!this.config.enabled || this.config.level < http_config_1.DebugLevel.ERROR)
            return;
        const { error, status, details } = response;
        if (!error)
            return;
        const errorInfo = {
            message: error,
            status,
            details: details ? {
                description: details.description,
                cause: details.cause,
                solution: details.solution
            } : undefined
        };
        if (this.config.format === 'json') {
            console.error(JSON.stringify(errorInfo, null, 2));
        }
        else {
            this.logFormattedError(errorInfo);
        }
    }
    logFormattedError(errorInfo) {
        const { message, status, details } = errorInfo;
        const prefix = this.config.colors ? '\x1b[31m' : '';
        const suffix = this.config.colors ? '\x1b[0m' : '';
        console.error(`${prefix}Error (${status}):${suffix} ${message}`);
        if (details) {
            console.error(`${prefix}Description:${suffix} ${details.description}`);
            console.error(`${prefix}Cause:${suffix} ${details.cause}`);
            console.error(`${prefix}Solution:${suffix} ${details.solution}`);
        }
    }
}
exports.HttpLogger = HttpLogger;
exports.httpLogger = HttpLogger.getInstance();
