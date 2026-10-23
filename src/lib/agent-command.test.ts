import { describe, it as test } from "node:test";
import assert from "node:assert/strict";
import { buildAgentCommand } from "./agent-command";

const base = {
  wallet: "0x1111111111111111111111111111111111111111",
  vault: "0x699ffc34719d992fa14b2b6e3da1ebd083797beb",
  inputData: "0xabcdef",
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
  test("both carry the real wallet, vault, calldata and BSC chain", () => {
    for (const lang of ["zh", "en"] as const) {
      const s = buildAgentCommand({ ...base, lang });
      assert.ok(s.includes(`--from ${base.wallet} --to ${base.vault} --value 0 --inputData 0xabcdef`));
      assert.ok(s.includes("--binanceChainId 56"));
    }
  });
});
