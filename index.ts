export { generateCurl, ensureSuccess } from './http/utils';

function calculateResponseTime(startTime: number, endTime: number): number {
    return endTime - startTime;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

export { calculateResponseTime, analyzeRequest, RequestMetrics, formatBytes };
