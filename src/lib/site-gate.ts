import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHost } from "@tanstack/react-start/server";

/** Public (published) hosts only see the coming-soon map; preview/dev hosts see everything. */
export function isPreviewHost(host: string) {
  const h = host.toLowerCase().split(":")[0] ?? "";
  return (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h.startsWith("id-preview--") ||
    h.startsWith("preview--") ||
    h.endsWith(".lovableproject.com")
  );
}

export const currentHost = createIsomorphicFn()
  .server(() => getRequestHost())
  .client(() => window.location.host);

export const COMING_SOON_PATH = "/coming-soon";
