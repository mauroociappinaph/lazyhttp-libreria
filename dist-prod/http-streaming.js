"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.streamingManager=exports.HttpStreamingManager=void 0;const tslib_1=require("tslib"),axios_1=tslib_1.__importDefault(require("axios")),https_proxy_agent_1=require("https-proxy-agent"),socks_proxy_agent_1=require("socks-proxy-agent"),http_helpers_1=require("./http-helpers");class HttpStreamingManager{constructor(){this.defaultTimeout=1e4}configure(e){e.streamConfig&&(this.defaultStreamConfig=e.streamConfig),e.proxyConfig&&(this.proxyConfig=e.proxyConfig),e.baseUrl&&(this.baseUrl=e.baseUrl),e.timeout&&(this.defaultTimeout=e.timeout)}async stream(e,t={}){const r={enabled:!0,chunkSize:8192,...this.defaultStreamConfig,...t.stream};if(!r.enabled)throw new Error("Streaming no está habilitado para esta petición");const o=t.proxy||this.proxyConfig,n=this.createProxyAgent(o);!1===(null==o?void 0:o.rejectUnauthorized)&&(process.env.NODE_TLS_REJECT_UNAUTHORIZED="0");const s={method:"GET",url:this.buildUrl(e),responseType:"stream",headers:this.prepareHeaders(t),timeout:t.timeout||this.defaultTimeout,proxy:!1,httpsAgent:n};try{const e=(await(0,axios_1.default)(s)).data;return r.onChunk&&e.on("data",(e=>{r.onChunk(e)})),r.onEnd&&e.on("end",(()=>{r.onEnd()})),r.onError&&e.on("error",(e=>{r.onError(e)})),e}catch(e){throw r.onError&&r.onError(e),e}finally{!1===(null==o?void 0:o.rejectUnauthorized)&&(process.env.NODE_TLS_REJECT_UNAUTHORIZED="1")}}createProxyAgent(e){if(!e)return;const{url:t,protocol:r="http",auth:o,rejectUnauthorized:n=!1}=e,s=new URL(t);o&&(s.username=o.username,s.password=o.password);const a=s.toString();return"socks"===r?new socks_proxy_agent_1.SocksProxyAgent(a):(process.env.NODE_TLS_REJECT_UNAUTHORIZED=n?"1":"0",new https_proxy_agent_1.HttpsProxyAgent(a))}buildUrl(e){return this.baseUrl?`${this.baseUrl}${e}`:e}prepareHeaders(e){return(0,http_helpers_1.prepareHeaders)(e.headers||{},e.withAuth||!1)}}exports.HttpStreamingManager=HttpStreamingManager,exports.streamingManager=new HttpStreamingManager;