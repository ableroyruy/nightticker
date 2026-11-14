import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

// Pages are prerendered at build time; live market data uses uncached API routes.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
