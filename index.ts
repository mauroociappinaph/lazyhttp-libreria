export { generateCurl, ensureSuccess } from './http/utils';

function calculateResponseTime(startTime: number, endTime: number): number {
    return endTime - startTime;
}

interface RequestMetrics {
    responseTime: number;
    statusCode: number;
    contentLength: number;
}

function analyzeRequest(response: any, startTime: number, endTime: number): RequestMetrics {
    return {
        responseTime: calculateResponseTime(startTime, endTime),
        statusCode: response.status || 200,
        contentLength: response.data ? JSON.stringify(response.data).length : 0
    };
}

export { calculateResponseTime, analyzeRequest, RequestMetrics };
