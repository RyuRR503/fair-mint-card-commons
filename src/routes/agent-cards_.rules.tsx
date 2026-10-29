import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CARD_RULES } from "@/lib/agent-card-model";

export const Route = createFileRoute("/agent-cards_/rules")({
  head: () => ({ meta: [
    { title: "Agent Card — 卡牌规则" },
    { name: "description", content: "Agent Card 的发行数量、铸造价格、税收分配、交易与兑换规则。" },
    { property: "og:title", content: "Agent Card — 卡牌规则" },
    { property: "og:description", content: "77 万张卡牌的铸造、持有、交易与兑换规则。" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: CardRulesPage,
});

const sections = [
  { title: "发行数量", text: "总量 770,000 张，分 77 批发行，每批 10,000 张：9,500 张付费卡和 500 张团队卡。团队卡包含在总量内，并非额外增发。" },
  { title: "铸造价格与资格", text: `每张 ${CARD_RULES.mintPriceBnb} BNB，网络费用另计。付费铸造需持有 SPACE ID Agent ID；每地址终身最多铸造 7 张，卖掉或销毁不会恢复名额。每付费铸造 19 张，激活 1 张团队卡。` },
  { title: "铸造资金去向", text: "铸造款的 80% 通过 Flap 买入项目代币，20% 用于运营。每张分别为 0.0016 BNB 和 0.0004 BNB。" },
  { title: "BNB 税收分配", text: "77 批全部售完之前，税收先累积；每次一批付费卡售满，分配给当时所有有效、未销毁的卡牌，每张等权。全部售完后，新税收随收到分配。已分到卡上的 BNB 可单独领取，不是固定收益。" },
  { title: "销毁与兑换", text: "批次售满后，本批买入的项目代币平均记到本批 10,000 张卡上。销毁卡牌可兑换对应代币及未领 BNB，之后停止参与分红。销毁不可撤销。" },
  { title: "卡牌市场", text: "市场买卖不限 Agent ID，成交手续费 1%。成交时未领分红付给卖家，买家从成交后参与分红；普通转账则让未领分红随卡转移。求购资金由合约托管，未成交部分可撤单退回。" },
  { title: "权限与风险", text: "Flap Guardian 可升级实现或锁定升级。紧急提取仅限账外资产，不得提走已记账税收、分红、求购押金或回购代币。数字资产、合约和升级均有风险，收入取决于实际交易税，不保证收益。" },
];

function CardRulesPage() {
  return <div className="ac-page">
    <header className="ac-header"><div className="ac-container flex min-h-20 flex-wrap items-center justify-between gap-4 py-4">
      <Link to="/agent-cards" className="flex items-center gap-3"><div className="ac-brand-icon"><Layers className="size-6" /></div><span className="font-poster text-3xl">AGENT CARD<span className="text-primary">.</span></span></Link>
      <nav aria-label="卡牌导航" className="flex flex-wrap gap-2"><Button asChild variant="ghost"><Link to="/agent-cards">铸造卡牌 / 卡牌市场 / 我的卡牌</Link></Button><Button asChild variant="ghost" className="text-primary"><Link to="/agent-cards/rules" aria-current="page">规则</Link></Button></nav>
    </div></header>
    <main className="ac-container py-10 sm:py-14">
      <Button asChild variant="ghost" className="mb-8 px-0 text-muted-foreground"><Link to="/agent-cards"><ArrowLeft />返回卡牌</Link></Button>
      <p className="mb-3 font-mono text-xs text-primary">AGENT CARD / RULES</p>
      <h1 className="text-4xl font-bold">卡牌规则</h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">依据上传的 AgentCardVault 合约。当前页面中的数量与操作为模拟展示，不代表真实销量或链上资产。</p>
      <div className="mt-10 max-w-3xl">{sections.map((section, i) => <section key={section.title} className="grid grid-cols-[32px_1fr] gap-4 border-t border-border py-7 sm:gap-8"><span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span><div><h2 className="mb-3 text-xl">{section.title}</h2><p className="text-sm leading-7 text-muted-foreground">{section.text}</p></div></section>)}</div>
      <Button asChild className="mt-6"><Link to="/agent-cards">返回铸造<ArrowUpRight /></Link></Button>
    </main>
  </div>;
}