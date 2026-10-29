import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

// 金库合约尚未部署，部署后替换这里
export const FAGENT_VAULT = "（金库合约待部署）";

const HEAD = `你是我的币安 Agent 钱包助手。链：BNB Chain（BSC）。FAGENT 金库合约：${FAGENT_VAULT}。每笔交易先给我看预览（函数、参数、BNB 金额、gas），我确认后再发送；任何一步失败就停下来告诉我原因。`;

type Cmd = { group: string; title: string; fn: string; desc: string; text: string };
const CMDS: Cmd[] = [
  { group: "铸造", title: "铸造卡牌", fn: "mint()", desc: "每张 0.002 BNB，每个地址终身最多铸 7 张付费卡。", text: `${HEAD}\n任务：铸造 FAGENT 卡牌 【1】 张。\n每张单独调用一次 mint()，每次附带正好 0.002 BNB。\n开始前先确认：钱包有 Agent ID、余额够付铸造费和 gas、本地址付费铸造未超过 7 张。完成后告诉我每张的卡牌编号。` },
  { group: "买", title: "买入挂单卡牌（吃卖单）", fn: "buy(tokenIds, maxPrices)", desc: "直接买别人挂出的卡，可设最高价，多付的 BNB 自动退回。", text: `${HEAD}\n任务：买入 FAGENT 卡牌。\n卡牌编号：【#000627】；每张最高愿付：【0.0030】 BNB。\n调用 buy([编号], [最高价，换算成 wei])，附带的 BNB = 各卡最高价之和。价格变了超过最高价会自动跳过，多付的 BNB 合约会退回。完成后告诉我实际买到哪几张、花了多少。` },
  { group: "买", title: "发布求购（买单）", fn: "placeBid(price, quantity, batchPlusOne)", desc: "先托管 BNB，按你的出价等别人卖给你。", text: `${HEAD}\n任务：发布 FAGENT 求购单。\n出价：每张 【0.0020】 BNB；数量：【5】 张；批次：【不限】（不限填 0，只收第 N 批填 N+1）。\n调用 placeBid(出价 wei, 数量, 批次参数)，附带 BNB = 出价 × 数量，必须正好相等。完成后告诉我求购单编号 bidId。` },
  { group: "买", title: "撤销求购", fn: "cancelBids(bidIds)", desc: "撤掉还没成交的求购，退回剩余 BNB。", text: `${HEAD}\n任务：撤销我的 FAGENT 求购单 【bidId】。\n调用 cancelBids([bidId])，完成后告诉我退回了多少 BNB。` },
  { group: "卖", title: "挂单出售（卖单）", fn: "list(tokenIds, prices)", desc: "卡留在你钱包里，挂单期间照样分红。", text: `${HEAD}\n任务：挂单出售 FAGENT 卡牌。\n卡牌编号：【#000627】；售价：【0.0035】 BNB。\n先确认这张卡在我钱包里，然后调用 list([编号], [售价 wei])。重复调用可以改价。完成后告诉我挂单情况。` },
  { group: "卖", title: "卖给求购（成交买单）", fn: "sellToBid(bidId, tokenIds)", desc: "直接卖给已托管 BNB 的买家，到手 = 出价 − 1% + 未领分红。", text: `${HEAD}\n任务：把我的 FAGENT 卡牌卖给当前最高的求购单。\n卡牌编号：【#000627】；最低接受价：【0.0020】 BNB。\n先找出价最高、还有剩余数量、批次符合的求购单；出价低于最低接受价就停下问我。然后调用 sellToBid(bidId, [编号])，完成后告诉我到手多少 BNB。` },
  { group: "卖", title: "下架挂单", fn: "unlist(tokenIds)", desc: "取消卖单，卡不动。", text: `${HEAD}\n任务：下架我挂单的 FAGENT 卡牌 【#000627】。调用 unlist([编号])。` },
  { group: "收益", title: "领取分红", fn: "claim(tokenId)", desc: "把这张卡的未领 BNB 分红领到钱包。", text: `${HEAD}\n任务：领取我所有 FAGENT 卡牌的 BNB 分红。\n先列出我钱包里每张卡的未领分红，大于 0 的逐张调用 claim(编号)。完成后告诉我一共领到多少。` },
  { group: "收益", title: "销毁兑换", fn: "redeem(tokenId)", desc: "批次售满后可用；销毁卡，换回代币和未领分红，不可撤销。", text: `${HEAD}\n任务：销毁兑换 FAGENT 卡牌 【#000627】。\n先告诉我这张卡能换到多少代币和多少 BNB 分红、它所在批次是否已售满；销毁不可撤销，必须等我再次确认，再调用 redeem(编号)。` },
  { group: "收益", title: "提取卖卡收入", fn: "withdrawProceeds(to)", desc: "卖卡收入没有直接到账时，从这里提出来。", text: `${HEAD}\n任务：查我在 FAGENT 金库里有没有待提取的卖卡收入，有的话调用 withdrawProceeds(我的地址) 提出来，告诉我金额。` },
];

export function AgentCommands() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (c: Cmd) => { await navigator.clipboard.writeText(c.text).catch(() => {}); setCopied(c.title); setTimeout(() => setCopied(null), 1800); };
  return (
    <div>
      <div className="mb-6"><h3 className="text-xl">Agent 指令</h3><p className="mt-2 text-sm text-muted-foreground">所有操作都由你的币安 Agent 钱包完成。复制指令，改掉【】里的内容，发给 Agent 钱包即可。金库合约地址部署后会自动填进指令。</p></div>
      {["铸造", "买", "卖", "收益"].map(g => <section key={g} className="mb-8">
        <p className="mb-3 font-mono text-xs text-primary">{g === "买" ? "买入 · 买单" : g === "卖" ? "卖出 · 卖单" : g}</p>
        <div className="grid gap-3 md:grid-cols-2">{CMDS.filter(c => c.group === g).map(c => <article key={c.title} className="flex flex-col border border-border p-4">
          <div className="flex items-start justify-between gap-3"><h4 className="text-base">{c.title}</h4><code className="shrink-0 text-[10px] text-muted-foreground">{c.fn}</code></div>
          <p className="mt-2 flex-1 text-xs leading-6 text-muted-foreground">{c.desc}</p>
          <Button size="sm" variant="outline" className="mt-4 w-full" onClick={() => copy(c)}>{copied === c.title ? <Check /> : <Copy />}{copied === c.title ? "已复制" : "复制指令"}</Button>
        </article>)}</div>
      </section>)}
    </div>
  );
}
