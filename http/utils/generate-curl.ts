import { FullResponseMetadata } from "../types/core/response.types";

interface GenerateCurlOptions {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
}

/**
 * Generates a cURL command from request config and optional response metadata
 */
export function generateCurl(
  options: GenerateCurlOptions,
  meta?: FullResponseMetadata
): string {
  const method = options.method?.toUpperCase() || "GET";
  const url = options.url;
  const headers = meta?.requestHeaders || options.headers || {};
  const body = options.body;

  let curl = `curl -X ${method}`;

  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    curl += ` -H '${key}: ${value}'`;
  });

  // Add body
  if (body) {
    const isJson = typeof body === "object" && !(body instanceof Buffer);
    const data = isJson ? JSON.stringify(body) : String(body);
    curl += ` --data '${data}'`;
  }

  curl += ` '${url}'`;
  return curl;
}
