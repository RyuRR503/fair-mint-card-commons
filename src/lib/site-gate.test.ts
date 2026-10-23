import { describe, expect, it } from "vitest";
import { isPreviewHost } from "./site-gate";
describe("site gate", () => {
  it("published domain is gated", () => expect(isPreviewHost("catch.fun")).toBe(false));
  it("published lovable url is gated", () => expect(isPreviewHost("catch.lovable.app")).toBe(false));
  it("preview stays open", () => expect(isPreviewHost("id-preview--abc.lovable.app")).toBe(true));
  it("local dev stays open", () => expect(isPreviewHost("localhost:8080")).toBe(true));
});
