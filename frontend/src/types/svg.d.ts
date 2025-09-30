import * as React from "react";

declare module "*.svg" {
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement> & {
    title?: string;
  }>;
  const src: string;
  export default src;
}
