import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Snapshot } from "@/lib/fagent/chain.server";
import { commandHead } from "@/lib/fagent/commands";
import { CommandDialog } from "./ChainTools";

const manageCommand = `${commandHead}
先读取我的地址持有的全部卡牌（逐张查询 ownerOf 或按铸造记录核对）。然后问我要做什么，按我的选择执行：
1. 领取分红：调用 claim(卡号)，取出已分配未领取的 BNB。
2. 提取卖卡收入：读取 proceedsOwed(我的地址)，大于 0 时调用 withdrawProceeds(我的地址)。
3. 下架挂单：调用 unlist([卡号])。
4. 销毁换代币：确认本批已售满或满 7 天后，调用 redeem(卡号)，不可撤销。
每步先展示交易预览，等我确认后再发送。`;

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
    ["累计收到税收", data.taxReceived],
    ["NFT 待分配税收", data.undistributed],
    ["未领取分红", data.dividendLiability],
    ["已支付分红", data.dividendsPaid],
  ];
  return (
    <>
      <div className="ac-mint-grid">
        <section>
          <h3 className="text-xl">BNB 税收账本</h3>
          <p className="mt-2 text-xs text-muted-foreground">链上数据</p>
          {rows.map(([label, value]) => (
            <div key={label} className="flex flex-wrap justify-between gap-2 border-b border-border py-4 text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="break-all font-mono">{formatEther(BigInt(value ?? "0"))} BNB</span>
            </div>
          ))}
          <h3 className="mt-10 text-lg">各批还没领的代币</h3>
          <div className="border-b border-border py-4 text-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <span className="text-muted-foreground">第 {data.batch} 批还没领的代币</span>
              <span className="break-all font-mono">{Number(data.batchInventory).toLocaleString("en-US", { maximumFractionDigits: 4 })} 枚</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">本批还没售满，代币先堆在这一批，售满后销毁卡牌才能领走。</p>
          </div>
        </section>
        <section className="space-y-5 border-l border-border pl-6">
          <p className="font-mono text-[10px] text-primary">DISTRIBUTION LOGIC</p>
          <h3 className="text-xl">税收先累积，批次售满再分配。</h3>
          <div className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>77 批全部售完之前，每次有一批售满，累积的 BNB 税收才会分配给当时所有有效、未销毁的卡牌。不是实时到账，也不是固定收益。</p>
            <p>如果某一批从第一张付费卡铸出起 7 天还没卖满，攒着的税会分给当时有效的卡牌，不会一直锁在金库里。</p>
            <p>例如第 1 批累积 10 BNB 税收，9,500 张付费卡售满后，连同 500 份团队权益共 10,000 份，每份约记入 0.001 BNB，需主动领取。团队未铸卡也计入份数。全部售完后，后续税收经同步等操作分配；销毁卡牌不再参与。</p>
          </div>
          <Button asChild variant="link" className="px-0 text-primary">
            <Link to="/rules">查看完整规则<ArrowUpRight /></Link>
          </Button>
          <div className="border border-border p-6">
            <h3 className="text-lg">管理我的卡</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">铸造之后的事都用这一条：领分红、提取卖卡收入、下架、销毁换代币。Agent 会先读出你的卡，再问你要做什么。</p>
            <Button variant="outline" className="mt-5 w-full" onClick={() => setCommand(manageCommand)}>
              <Copy />复制管理指令
            </Button>
          </div>
        </section>
      </div>
      <CommandDialog text={command} onClose={() => setCommand(null)} />
    </>
  );
}
