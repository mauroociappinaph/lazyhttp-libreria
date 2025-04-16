"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.axiosInstance=exports.AUTH_ENDPOINTS=exports.AUTH_STORAGE=exports.DEFAULT_RETRIES=exports.DEFAULT_TIMEOUT=exports.API_URL=exports.debugConfig=exports.DebugLevel=void 0,exports.createAxiosInstance=createAxiosInstance;const tslib_1=require("tslib"),axios_1=tslib_1.__importDefault(require("axios"));var DebugLevel;function createAxiosInstance(){return axios_1.default.create({baseURL:exports.API_URL,timeout:exports.DEFAULT_TIMEOUT,withCredentials:!0,headers:{"Content-Type":"application/json"}})}!function(e){e[e.NONE=0]="NONE",e[e.ERROR=1]="ERROR",e[e.WARNING=2]="WARNING",e[e.INFO=3]="INFO",e[e.DEBUG=4]="DEBUG"}(DebugLevel||(exports.DebugLevel=DebugLevel={})),exports.debugConfig={level:"development"===process.env.NODE_ENV?DebugLevel.INFO:DebugLevel.ERROR,logRequests:!0,logResponses:!0,prettyPrintJSON:"development"===process.env.NODE_ENV,colors:{error:"#FF6B6B",warning:"#FFD166",info:"#06D6A0",debug:"#118AB2",default:"#073B4C"}},exports.API_URL=process.env.NEXT_PUBLIC_API_URL||"http://localhost:3001/api",exports.DEFAULT_TIMEOUT=1e4,exports.DEFAULT_RETRIES=0,exports.AUTH_STORAGE={TOKEN_KEY:"token",REFRESH_TOKEN_KEY:"refreshToken"},exports.AUTH_ENDPOINTS={LOGIN:"/auth/login",REGISTER:"/auth/register",REFRESH_TOKEN:"/auth/refresh",LOGOUT:"/auth/logout"},exports.axiosInstance=createAxiosInstance();