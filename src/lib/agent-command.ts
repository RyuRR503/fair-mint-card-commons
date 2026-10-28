/** Builds the claim instruction a user pastes to the AI behind their Binance Agentic Wallet. */
export type AgentCommandInput = {
  lang: "zh" | "en";
  code: string;
  api: string; // absolute URL of /api/public/agent-claim
  amount: number;
  symbol: string;
  tokenAddress: string; // BEP-20 contract of the reward token
  vaultAddress: string; // MapCity vault that signs and pays the voucher
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
      `本次奖励：${c.amount} ${c.symbol}（代币合约 ${c.tokenAddress}），由 CATCH 签发凭证、金库合约 ${c.vaultAddress}（BSC 链 ID ${c.chainId}）核验并支付，均可在 BscScan 核对。`,
      `1. 用 baw 查出我在 BSC 上的 Agent 钱包地址，替换下面的 <AGENT_WALLET>，发送请求换取领取数据：`,
      req,
      `2. 返回结果里的 next 就是 contract-call preview 命令。确认已在币安 App 开启开发者模式后执行预览，把结果给我看，我确认后再 execute。`,
    ].join("\n");
  }
  return [
    `Claim my CATCH reward with my Binance Agentic Wallet: ${c.amount} ${c.symbol} at ${c.place}. Claim code ${c.code} (valid until ${clock(c.deadline, "en")}, single use).`,
    `Reward details: ${c.amount} ${c.symbol} (token contract ${c.tokenAddress}), authorized by CATCH and verified and paid by the vault contract ${c.vaultAddress} on BSC (chain ${c.chainId}). Both are verifiable on BscScan.`,
    `1. Use baw to get my Agent Wallet address on BSC, put it in place of <AGENT_WALLET>, and send this request to get the claim data:`,
    req,
    `2. The "next" field in the reply is the contract-call preview command. Check Developer Mode is on in the Binance App, run the preview, show me the result, and execute only after I confirm.`,
  ].join("\n");
}

/** Command asking the AI to top the Agent Wallet up to the CATCH holding threshold before claiming. */
export function buildBuyCatchCommand(lang: "zh" | "en", catchToken: string): string {
  if (lang === "zh") {
    return [
      `请帮我的币安 Agent 钱包准备 CATCH 领取门槛：`,
      `1. 用 baw 查出我在 BSC 上的 Agent 钱包地址，查询 CATCH（合约 ${catchToken}）余额和 BNB 余额。`,
      `2. 如果 CATCH 少于 100,000 个，用 BNB 在 BSC 上买入 CATCH，补到略多于 100,000 个（建议 105,000，留出滑点）。先给我看 swap 预览（花费 BNB、得到数量、滑点），我确认后再 execute。`,
      `3. 保留足够 BNB 做 gas。买完后等约 10 分钟再去领取，持仓需满 10 分钟才生效。`,
    ].join("\n");
  }
  return [
    `Prepare my Binance Agentic Wallet for the CATCH claim threshold:`,
    `1. Use baw to get my Agent Wallet address on BSC and check its CATCH (contract ${catchToken}) and BNB balances.`,
    `2. If it holds less than 100,000 CATCH, swap BNB for CATCH on BSC to bring it slightly above 100,000 (about 105,000 to cover slippage). Show me the swap preview (BNB spent, CATCH received, slippage) and execute only after I confirm.`,
    `3. Keep enough BNB for gas. After buying, wait about 10 minutes before claiming — holdings count only after 10 minutes.`,
  ].join("\n");
}
