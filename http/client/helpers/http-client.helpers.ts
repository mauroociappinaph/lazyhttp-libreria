// http/client/helpers/http-client.helpers.ts

import { RequestOptions } from '../../types/core.types';
import { ProxyConfig } from '../../types/proxy.types';
import { prepareHeaders } from '../../http-helpers';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';

export function buildUrl(endpoint: string, baseUrl?: string): string {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  if (baseUrl) {
    if (baseUrl.endsWith('/') && endpoint.startsWith('/')) {
      return `${baseUrl}${endpoint.substring(1)}`;
    }
    if (!baseUrl.endsWith('/') && !endpoint.startsWith('/')) {
      return `${baseUrl}/${endpoint}`;
    }
    return `${baseUrl}${endpoint}`;
  }

  return endpoint;
}

export function prepareRequestHeaders(options: RequestOptions): Record<string, string> {
  return prepareHeaders(options.headers || {}, options.withAuth || false);
}

export function createProxyAgent(proxyConfig?: ProxyConfig) {
  if (!proxyConfig) return undefined;

  const { url, protocol = 'http', auth, rejectUnauthorized = false } = proxyConfig;
  const proxyUrl = new URL(url);

  if (auth) {
    proxyUrl.username = auth.username;
    proxyUrl.password = auth.password;
  }

  const proxyString = proxyUrl.toString();

  if (protocol === 'socks') {
    return new SocksProxyAgent(proxyString);
  }

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = rejectUnauthorized ? '1' : '0';
  return new HttpsProxyAgent(proxyString);
}
