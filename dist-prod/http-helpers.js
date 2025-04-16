"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports._handleRefreshTokenFailure=exports._refreshToken=exports._setupInterceptors=exports._logResponse=exports._logRequest=exports._prepareHeaders=exports._waitForRetry=exports._isRetryableError=exports._handleRetry=exports._executeWithRetry=exports._processResponse=exports._executeRequest=exports._handleError=exports.retryHandler=exports.responseProcessor=exports.requestExecutor=exports.errorHandler=exports.logger=void 0,exports.logRequest=logRequest,exports.logResponse=logResponse,exports.prepareHeaders=prepareHeaders,exports.setupInterceptors=setupInterceptors,exports.refreshToken=refreshToken,exports.handleRefreshTokenFailure=handleRefreshTokenFailure,exports.initialize=initialize;const tslib_1=require("tslib"),axios_1=tslib_1.__importStar(require("axios")),http_errors_1=require("./http-errors"),http_config_1=require("./http-config"),http_logger_1=require("./http-logger");function logRequest(e,r,t,o){if(!http_config_1.debugConfig.logRequests||http_config_1.debugConfig.level<http_config_1.DebugLevel.INFO)return;const s={...t};s.Authorization&&(s.Authorization=s.Authorization.replace(/Bearer .+/,"Bearer [REDACTED]")),exports.logger.info(`${e} ${r}`,{headers:s,body:o&&http_config_1.debugConfig.prettyPrintJSON?JSON.parse(JSON.stringify(o)):o})}function logResponse(e){if(!http_config_1.debugConfig.logResponses)return;("error"===(e.status>=400?"error":"info")?exports.logger.error.bind(exports.logger):exports.logger.info.bind(exports.logger))(`Respuesta ${e.status} ${e.config.url}`,{status:e.status,headers:e.headers,data:e.data})}function prepareHeaders(e,r){const t={"Content-Type":"application/json",...e};if(r)try{const e=require("./http-auth").getAccessToken();e&&(t.Authorization=`Bearer ${e}`)}catch(e){const r=localStorage.getItem("token");r&&(t.Authorization=`Bearer ${r}`)}return t}function setupInterceptors(){const e=require("axios").default;e.interceptors.request.use((e=>e),(e=>Promise.reject(e))),e.interceptors.response.use((e=>e),(async r=>{if(r.response&&401===r.response.status)try{const t=require("./http-auth");if(t.authState.refreshToken&&t.currentAuthConfig.endpoints.refresh)try{const o=await t.refreshToken();if(o){const t=r.config;return t.headers.Authorization=`Bearer ${o}`,e(t)}}catch(e){await t.handleRefreshTokenFailure()}else await t.handleRefreshTokenFailure()}catch(e){console.warn("Error al manejar token expirado",e)}return Promise.reject(r)}))}async function refreshToken(){return Promise.resolve("")}async function handleRefreshTokenFailure(){return Promise.resolve()}async function initialize(){setupInterceptors();try{const e=localStorage.getItem("auth_config");if(e){const r=require("./http-auth"),t=JSON.parse(e);r.configureAuth(t)}}catch(e){console.warn("Error al cargar configuración de autenticación",e)}return Promise.resolve()}exports.logger={error(e,r){http_config_1.debugConfig.level>=http_config_1.DebugLevel.ERROR&&this._log("error",e,r)},warn(e,r){http_config_1.debugConfig.level>=http_config_1.DebugLevel.WARNING&&this._log("warning",e,r)},info(e,r){http_config_1.debugConfig.level>=http_config_1.DebugLevel.INFO&&this._log("info",e,r)},debug(e,r){http_config_1.debugConfig.level>=http_config_1.DebugLevel.DEBUG&&this._log("debug",e,r)},_log(e,r,t){const o=`color: ${http_config_1.debugConfig.colors[e]||http_config_1.debugConfig.colors.default}; font-weight: bold;`,s=(new Date).toISOString(),n=`[HTTP:${e.toUpperCase()}] [${s}]`;console.group(`%c${n} ${r}`,o),void 0!==t&&(http_config_1.debugConfig.prettyPrintJSON&&"object"==typeof t?(console.log("%cDatos:","font-weight: bold"),console.dir(t,{depth:null,colors:!0})):console.log("%cDatos:","font-weight: bold",t)),console.groupEnd()}},exports.errorHandler={handleError(e){var r,t,o,s,n,i;let a;if(e instanceof http_errors_1.HttpTimeoutError)a={data:null,error:(null===(r=e.details)||void 0===r?void 0:r.description)||http_errors_1.HttpTimeoutError.ERROR_MESSAGES.TIMEOUT,status:408,details:e.details};else if((0,axios_1.isAxiosError)(e)){const r=new http_errors_1.HttpAxiosError;a={data:null,error:(null===(t=r.details)||void 0===t?void 0:t.description)||http_errors_1.HttpAxiosError.ERROR_MESSAGES.AXIOS_ERROR,status:(null===(o=e.response)||void 0===o?void 0:o.status)||0,details:r.details}}else if(e instanceof http_errors_1.HttpAbortedError)a={data:null,error:(null===(s=e.details)||void 0===s?void 0:s.description)||http_errors_1.HttpAbortedError.ERROR_MESSAGES.ABORTED,status:0,details:e.details};else if(e instanceof Error&&"TokenExpired"===e.message){const e=new http_errors_1.HttpAuthError;a={data:null,error:(null===(n=e.details)||void 0===n?void 0:n.description)||http_errors_1.HttpAuthError.ERROR_MESSAGES.SESSION_EXPIRED,status:401,details:e.details}}else if(e instanceof Error)a={data:null,error:e.message||http_errors_1.HttpNetworkError.ERROR_MESSAGES.NETWORK,status:0,details:e.details};else{const e=new http_errors_1.HttpUnknownError;a={data:null,error:(null===(i=e.details)||void 0===i?void 0:i.description)||http_errors_1.HttpUnknownError.ERROR_MESSAGES.UNKNOWN,status:0,details:e.details}}return http_logger_1.httpLogger.logError(a),a}},exports.requestExecutor={async executeRequest(e,r,t,o,s){const n=`${http_config_1.API_URL}${e}`;return logRequest(r,n,t,o),(0,axios_1.default)({url:n,method:r,headers:t,data:o,withCredentials:!0,signal:s})}},exports.responseProcessor={processResponse(e){if(logResponse(e),e.status>=400){const r=e.data;return{data:null,error:(null==r?void 0:r.message)||e.statusText,status:e.status}}return{data:e.data,error:null,status:e.status}}},exports.retryHandler={async executeWithRetry(e,r,t,o,s,n){const i=new AbortController,a=setTimeout((()=>i.abort()),s);try{const s=await exports.requestExecutor.executeRequest(e,r,t,o,i.signal);return clearTimeout(a),exports.responseProcessor.processResponse(s)}catch(i){return clearTimeout(a),this.handleRetry(i,(()=>this.executeWithRetry(e,r,t,o,s,n-1)),n)}},async handleRetry(e,r,t){if(this.isRetryableError(e)&&t>0)return await this.waitForRetry(t),r();throw e},isRetryableError:e=>!!axios_1.default.isAxiosError(e)&&(!e.response||e.response.status>=500),async waitForRetry(e){const r=1e3*Math.pow(2,3-e);await new Promise((e=>setTimeout(e,r)))}},exports._handleError=exports.errorHandler.handleError,exports._executeRequest=exports.requestExecutor.executeRequest,exports._processResponse=exports.responseProcessor.processResponse,exports._executeWithRetry=exports.retryHandler.executeWithRetry.bind(exports.retryHandler),exports._handleRetry=exports.retryHandler.handleRetry.bind(exports.retryHandler),exports._isRetryableError=exports.retryHandler.isRetryableError,exports._waitForRetry=exports.retryHandler.waitForRetry,exports._prepareHeaders=prepareHeaders,exports._logRequest=logRequest,exports._logResponse=logResponse,exports._setupInterceptors=setupInterceptors,exports._refreshToken=refreshToken,exports._handleRefreshTokenFailure=handleRefreshTokenFailure;