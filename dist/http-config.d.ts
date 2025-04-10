/**
 * Niveles de depuración para el cliente HTTP
 */
export declare enum DebugLevel {
    NONE = 0,// Sin logs
    ERROR = 1,// Solo errores
    WARNING = 2,// Errores y advertencias
    INFO = 3,// Información general
    DEBUG = 4
}
/**
 * Configuración de depuración
 */
export declare const debugConfig: {
    /**
     * Nivel de depuración actual
     * @default DebugLevel.ERROR
     */
    level: DebugLevel;
    /**
     * Registrar detalles de peticiones HTTP
     * @default true
     */
    logRequests: boolean;
    /**
     * Registrar detalles de respuestas HTTP
     * @default true
     */
    logResponses: boolean;
    /**
     * Mostrar JSON formateado en consola
     * @default true en desarrollo, false en producción
     */
    prettyPrintJSON: boolean;
    /**
     * Colores para los diferentes niveles de log
     */
    colors: {
        error: string;
        warning: string;
        info: string;
        debug: string;
        default: string;
    };
};
/**
 * Configuración base para todas las peticiones HTTP
 */
export declare const API_URL: string;
export declare const DEFAULT_TIMEOUT = 10000;
export declare const DEFAULT_RETRIES = 0;
/**
 * Configuración para almacenamiento de tokens
 */
export declare const AUTH_STORAGE: {
    TOKEN_KEY: string;
    REFRESH_TOKEN_KEY: string;
};
/**
 * Endpoints para autenticación
 */
export declare const AUTH_ENDPOINTS: {
    LOGIN: string;
    REGISTER: string;
    REFRESH_TOKEN: string;
    LOGOUT: string;
};
/**
 * Crea una instancia configurada de Axios
 */
export declare function createAxiosInstance(): import("axios").AxiosInstance;
/**
 * Instancia global de Axios
 */
export declare const axiosInstance: import("axios").AxiosInstance;
