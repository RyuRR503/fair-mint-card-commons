import { test } from "node:test";
import assert from "node:assert/strict";
import { binanceMint, binanceCard, getBinanceCommands, SIGNATURES } from "./binance";
import { getAgentCommands } from "./commands";
import { vaultAbi } from "./vault-abi";

test("mint 7 sends 0.014 BNB", () => {
  const t = binanceMint(7);
  assert.ok(t.includes("function mint(uint256 count) payable"));
  assert.ok(t.includes("14000000000000000 wei"));
  assert.ok(t.startsWith("你是我的币安 Agent 钱包助手"));
});

test("list converts price to wei with zero value", () => {
  const t = binanceCard("list", 500, "0.003");
  assert.ok(t.includes("[3000000000000000]"));
  assert.ok(t.includes("- value：0"));
});

test("covers every general command", () => {
  assert.equal(getBinanceCommands("en").length, getAgentCommands("en").length);
});

test("signatures match the vault ABI", () => {
  for (const sig of Object.values(SIGNATURES)) {
    const [, name, args] = sig.match(/function (\w+)\((.*?)\)/)!;
    const fn = (vaultAbi as unknown as any[]).find(f => f.type === "function" && f.name === name);
    assert.deepEqual(
      (args ?? "").split(",").filter(Boolean).map(a => a.trim().split(" ")[0]),
      fn.inputs.map((i: any) => i.type),
    );
    assert.equal(sig.endsWith("payable"), fn.stateMutability === "payable");
  }
});
