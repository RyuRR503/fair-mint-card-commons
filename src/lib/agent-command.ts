/** Builds the claim instruction a user pastes to the AI behind their Binance Agentic Wallet. */
export type AgentCommandInput = {
  lang: "zh" | "en";
  wallet: string;
  vault: string;
  inputData: string;
  amount: number;
  symbol: string;
  place: string;
  deadline: number; // unix seconds
  chainId: number;
};

function clock(deadline: number, lang: "zh" | "en") {
  const d = new Date(deadline * 1000);
  return d.toLocaleTimeString(lang === "zh" ? "zh-CN" : "en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function buildAgentCommand(c: AgentCommandInput): string {
  const cli = `baw contract-call preview --binanceChainId ${c.chainId} --from ${c.wallet} --to ${c.vault} --value 0 --inputData ${c.inputData} --json`;
  if (c.lang === "zh") {
    return [
      `请用我的币安 Agent 钱包领取 CATCH 奖励：在 ${c.place} 领取 ${c.amount} ${c.symbol}。`,
      `在 BSC（链 ID ${c.chainId}）上调用 CATCH 金库 ${c.vault} 的 claimGameVoucher，发送 0 BNB。`,
      `先预览交易并把结果给我看，我确认后再执行。本指令 ${clock(c.deadline, "zh")} 前有效，只能由钱包 ${c.wallet} 使用一次。`,
      cli,
    ].join("\n");
  }
  return [
    `Claim my CATCH reward with my Binance Agentic Wallet: ${c.amount} ${c.symbol} at ${c.place}.`,
    `Call claimGameVoucher on the CATCH vault ${c.vault} on BSC (chain ${c.chainId}), sending 0 BNB.`,
    `Preview the transaction first and show me the result; execute only after I confirm. Valid until ${clock(c.deadline, "en")}, single use, only from wallet ${c.wallet}.`,
    cli,
  ].join("\n");
}
