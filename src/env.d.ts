/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// Type declarations for environment variables
interface ImportMetaEnv {
  readonly SITE: string;
  readonly BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
