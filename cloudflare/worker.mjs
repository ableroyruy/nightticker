import application from '../.open-next/worker.js';
import { createApiCachingFetch } from './api-cache.mjs';

export * from '../.open-next/worker.js';

const worker = {
  fetch: createApiCachingFetch(application, () => caches.open('nightticker-api-v1')),
};

export default worker;
