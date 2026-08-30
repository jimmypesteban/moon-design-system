/// <reference types="node" />

/**
 * Auto-detect the dashboard app's URL based on environment.
 * Works in both client and server contexts.
 *
 * Consuming apps that know their dashboard URL should pass it explicitly or
 * set NEXT_PUBLIC_DASHBOARD_URL; the fallbacks below cover local development
 * (where the dashboard conventionally runs on port 3000) and same-origin
 * deployments.
 */
export function getDashboardUrl(explicitUrl?: string): string {
  if (explicitUrl) return explicitUrl;

  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_DASHBOARD_URL) {
    return process.env.NEXT_PUBLIC_DASHBOARD_URL;
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }
    return `${protocol}//${hostname}`;
  }

  return 'http://localhost:3000';
}
