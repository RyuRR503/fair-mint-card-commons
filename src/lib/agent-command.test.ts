import { describe, it as test } from "node:test";
import assert from "node:assert/strict";
import { buildAgentCommand } from "./agent-command";

const base = {
  code: "CATCH-ABC234",
  api: "https://catch.fun/api/public/agent-claim",
  amount: 0.00942,
  symbol: "NVDAB",
  place: "网吧",
  deadline: 1_800_000_000,
  chainId: 56,
};

describe("Agent claim command", () => {
  test("Chinese command is in Chinese", () => {
    const s = buildAgentCommand({ ...base, lang: "zh" });
    assert.ok(s.includes("请用我的币安 Agent 钱包"));
    assert.ok(!s.includes("Claim my CATCH"));
  });
  test("English command is in English", () => {
    const s = buildAgentCommand({ ...base, lang: "en" });
    assert.ok(s.includes("Claim my CATCH reward"));
    assert.ok(!s.includes("请用"));
  });
  test("user never types a wallet: the AI fills its own address", () => {
    for (const lang of ["zh", "en"] as const) {
      const s = buildAgentCommand({ ...base, lang });
      assert.ok(s.includes('"wallet":"<AGENT_WALLET>"'));
      assert.ok(s.includes('"code":"CATCH-ABC234"'));
      assert.ok(s.includes(base.api));
    }
  });
});
