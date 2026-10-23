import { it } from "node:test";
import assert from "node:assert/strict";
import { isPreviewHost } from "./site-gate";
it("published domain is gated", () => assert.equal(isPreviewHost("catch.fun"), false));
it("published lovable url is gated", () => assert.equal(isPreviewHost("catch.lovable.app"), false));
it("preview stays open", () => assert.equal(isPreviewHost("id-preview--abc.lovable.app"), true));
it("local dev stays open", () => assert.equal(isPreviewHost("localhost:8080"), true));
