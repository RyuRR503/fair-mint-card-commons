import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FAGENT, explorer } from "@/lib/fagent/config";
import type { Snapshot } from "@/lib/fagent/chain.server";
import { agentCommands } from "@/lib/fagent/commands";
import { CardCheck, CommandDialog, WalletCheck } from "./ChainTools";

export function BatchClock({ data }: { data: Snapshot }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => { setElapsed(0); const timer = setInterval(() => setElapsed(n => n + 1), 1000); return () => clearInterval(timer); }, [data.block]);
  if (data.paid === 731500) return <p className="text-primary">全部售完 · 后续税收经同步等操作分配</p>;
  if (!data.openedAt || data.batchPaid === 0) return <p className="text-muted-foreground">本批尚未开始，7 天计时从第一张付费卡铸出起计算。</p>;
  const remaining = Math.max(0, data.openedAt + data.releaseSeconds - data.chainTime - elapsed);
  const days = Math.floor(remaining / 86400);
  const hours = Math.floor(remaining % 86400 / 3600);
  const minutes = Math.floor(remaining % 3600 / 60);
  return <p className="font-mono text-xs text-primary">{remaining === 0 ? "本批已满 7 天 · 可通过同步等操作提前分配与兑换" : `本批提前分配倒计时 ${days}天 ${hours}时 ${minutes}分 ${remaining % 60}秒`}</p>;
}
export function VaultLedger({ data }: { data: Snapshot }) {
  const [command, setCommand] = useState<string | null>(null);
  const rows = [
    ["金库 BNB 余额", data.balance], ["已登记税收总额", data.taxReceived], ["待分配税收（含尚未登记收入）", data.undistributed],
    ["已分配未领取分红", data.dividendLiability], ["已支付分红", data.dividendsPaid], ["求购托管金额", data.bidEscrow],
    ["累计市场手续费", data.marketFees], ["待付市场手续费", data.marketFeeOwed], ["待付运营费", data.opsOwed], ["待付卖卡收入", data.proceedsLiability],
  ];
  return <><div className="ac-mint-grid"><section><h3 className="text-xl">BNB 税收账本</h3><p className="mt-2 text-xs text-muted-foreground">区块 {data.block} · 同一区块读取</p>{rows.map(([label, value]) => <div key={label} className="flex flex-wrap justify-between gap-2 border-b border-border py-4 text-sm"><span className="text-muted-foreground">{label}</span><span className="break-all font-mono">{formatEther(BigInt(value ?? "0"))} BNB</span></div>)}<p className="mt-4 text-xs leading-6 text-muted-foreground">金库余额包含分红、求购托管及待付款，不等同于全部可分税收；以上账目不可相加作为额外收入。</p></section><section className="space-y-5 border-l border-border pl-6"><p className="font-mono text-[10px] text-primary">DISTRIBUTION LOGIC</p><h3 className="text-xl">批次售满，或本批满 7 天。</h3><BatchClock data={data} /><div className="space-y-3 text-sm"><p>第 {data.batch} / 77 批 · 付费铸造 {data.batchPaid} / 9,500</p><p>有效权益：{data.weight.toLocaleString()} 份</p><p>已激活团队权益：{data.activatedTeam.toLocaleString()} 份 · 已铸团队卡：{data.teamMinted.toLocaleString()} 张</p><p className="break-all">本批代币库存：{data.batchInventory} FAGENT</p><p className="break-all">本批结算每份代币：{data.batchAccounted ? data.batchCredit : "尚未售满结算"}</p></div><p className="text-sm leading-7 text-muted-foreground">每批售满会自动结算；本批自首张付费卡铸出满 7 天仍未售满，可在同步、领取、销毁或市场成交时触发税收分配。之后继续持有的有效权益参与分配，下一批开始时重新计时。</p><Button variant="outline" onClick={() => setCommand(agentCommands.find(c => c.fn === "sync()")?.text ?? null)}>生成同步指令<ArrowUpRight /></Button><Button asChild variant="link" className="px-0"><Link to="/rules">完整规则<ArrowUpRight /></Link></Button><div className="space-y-2 break-all font-mono text-xs"><p>CA：<a href={explorer(FAGENT.token)} className="text-primary" target="_blank" rel="noreferrer">{FAGENT.token}</a></p><p>Vault：<a href={explorer(FAGENT.vault)} className="text-primary" target="_blank" rel="noreferrer">{FAGENT.vault}</a></p></div></section></div><section className="mt-10 max-w-xl border-t border-border pt-7"><h3 className="mb-4 text-lg">钱包账目查询</h3><WalletCheck /><Button variant="outline" className="mt-4" onClick={() => setCommand(agentCommands.find(c => c.fn === "withdrawProceeds(to)")?.text ?? null)}>提取待付卖卡款</Button></section><CardCheck /><CommandDialog text={command} onClose={() => setCommand(null)} /></>;
}