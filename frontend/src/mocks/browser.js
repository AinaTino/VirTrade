import { setupWorker } from 'msw';
import { handlers } from './handlers.js';

export const worker = setupWorker(...handlers);

export function setupMocks() {
  if (typeof window === 'undefined') return;
  if (!window.isSecureContext && !/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)) {
    console.warn('[MSW] Secure context not available. Skipping service worker startup.');
    return;
  }

  worker.start({ onUnhandledRequest: 'bypass' }).catch((err) => {
    console.warn('[MSW] Failed to start the service worker. API mocking will be disabled.', err);
  });
}
