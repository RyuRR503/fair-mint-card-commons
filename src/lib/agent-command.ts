/** Builds the claim instruction a user pastes to the AI behind their Binance Agentic Wallet. */
export type AgentCommandInput = {
  lang: "zh" | "en";
  code: string;
  api: string; // absolute URL of /api/public/agent-claim
  amount: number;
  symbol: string;
  place: string;
  deadline: number; // unix seconds
  chainId: number;
};

function clock(deadline: number, lang: "zh" | "en") {
  return new Date(deadline * 1000).toLocaleTimeString(lang === "zh" ? "zh-CN" : "en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function buildAgentCommand(c: AgentCommandInput): string {
  const req = `curl -s -X POST ${c.api} -H "content-type: application/json" -d '{"code":"${c.code}","wallet":"<AGENT_WALLET>"}'`;
  if (c.lang === "zh") {
    return [
      `请用我的币安 Agent 钱包领取 CATCH 奖励：在 ${c.place} 领取 ${c.amount} ${c.symbol}，领取码 ${c.code}（${clock(c.deadline, "zh")} 前有效，只能用一次）。`,
      `1. 用 baw 查出我在 BSC（链 ID ${c.chainId}）上的 Agent 钱包地址，替换下面的 <AGENT_WALLET>，发送请求换取领取数据：`,
      req,
      `2. 返回结果里的 next 就是 contract-call preview 命令。确认已在币安 App 开启开发者模式后执行预览，把结果给我看，我确认后再 execute。`,
    ].join("\n");
  }
  return [
    `Claim my CATCH reward with my Binance Agentic Wallet: ${c.amount} ${c.symbol} at ${c.place}. Claim code ${c.code} (valid until ${clock(c.deadline, "en")}, single use).`,
    `1. Use baw to get my Agent Wallet address on BSC (chain ${c.chainId}), put it in place of <AGENT_WALLET>, and send this request to get the claim data:`,
    req,
    `2. The "next" field in the reply is the contract-call preview command. Check Developer Mode is on in the Binance App, run the preview, show me the result, and execute only after I confirm.`,
  ].join("\n");
}
