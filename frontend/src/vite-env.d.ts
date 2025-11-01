/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare module "*.svg?react" {
  import * as React from "react";
  const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  export default ReactComponent;
}

declare module "*.svg" {
  import * as React from "react";
  export const ReactComponent: React.FunctionComponent<React.SVGProps<
    SVGSVGElement
  > & { title?: string }>;
}

// vite-env.d.ts
/// <reference types="vite/client" />

declare module "*.svg?url" {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_PAYPAL_CLIENT_ID: string;
  readonly VITE_AUTH0_DOMAIN: string;
  readonly VITE_AUTH0_CLIENT_ID: string;
  readonly VITE_AUTH0_AUDIENCE: string;
  // Add other custom env vars here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
