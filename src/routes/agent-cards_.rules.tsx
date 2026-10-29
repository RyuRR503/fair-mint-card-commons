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
  { title: "谁能铸造？币安 Agent 钱包的 Agent ID", paragraphs: [
    `付费铸造面向持有 Agent ID 的币安 Agent 钱包。每张 ${CARD_RULES.mintPriceBnb} BNB，网络费用另计；每地址终身最多付费铸造 7 张，卖掉或销毁也不会恢复名额。`,
    "这里的 Agent ID 是钱包的链上身份，不是普通 SPACE ID 域名，也不是有币安账户就能铸造。合约实际检查发起交易的地址是否持有指定 Agent ID NFT；新项目上线前仍需核实该身份合约与币安 Agent 钱包的对应关系。市场买卖不要求这个身份。",
  ] },
  { title: "批次是什么？不是每天，也不是每月", paragraphs: [
    "77 万张是整个项目的发行上限，分成 77 组，每组叫一批。每批包含 9,500 张付费卡和 500 张免费团队卡，共 10,000 份权益；团队卡不是额外增发。全部合计 731,500 张付费卡、38,500 张团队卡。",
    "例如第 1 批：大家按顺序铸造，付费卡到 9,499 张时还没结束；第 9,500 张付费卡成功铸造时，本批自动结算。下一个人铸造就进入第 2 批。它取决于销量，没有固定结束日期，也不会每天自动分红。",
  ] },
  { title: "团队不铸造行不行？可以，但权益不会消失", paragraphs: [
    "团队可以暂时不把团队卡铸到钱包里，不影响用户铸造、批次结算或税收分配。结算看的是 9,500 张付费卡售满，不是钱包里实际已有 10,000 张卡。",
    "每付费铸造 19 张，本批就激活 1 份团队权益；到 9,500 张时，500 份全部激活，即使团队还没铸卡，也照样计入分红份数并保留代币兑换份额。暂时不铸造不等于放弃，也不会把这 500 份分给用户。",
    "团队之后可免费铸卡，每次最多 100 张，仍需网络费；要领取已记账的分红、兑换代币或出售，必须先把对应卡铸到团队钱包里。",
  ] },
  { title: "铸造费怎么用？和交易税是两笔钱", paragraphs: [
    "每张 0.002 BNB：0.0016 BNB（80%）立即通过 Flap 买入项目代币，实际买到的数量累计在本批；0.0004 BNB（20%）归运营。不是等一批卖完才统一买入。",
    "一批 9,500 张付费卡共支付 19 BNB，其中 15.2 BNB 用来买代币、3.8 BNB 用于运营。买到多少代币取决于每次成交价，并不保证能兑换回 19 BNB；团队卡不付铸造费，但有同等份额。",
  ] },
  { title: "交易税怎么收？", paragraphs: [
    "交易税来自项目税币的交易，由税币和 Flap 的配置决定哪些交易收税、税率多少、多少转进卡牌金库。这份卡牌合约没有写死税币买卖税率，因此不能把 1% 或 20% 当成交易税率。",
    "进入金库的这笔税收保留为 BNB，不拿去买项目代币。77 批付费卡尚未全部售完时，先记为待分配税收，等下一批付费卡售满再分配；没有新批次售满，就不会仅因过了一天而分配。直接转入的额外 BNB 也可能被合约记入这笔收入。",
  ] },
  { title: "一批满了，具体发生什么？", paragraphs: [
    "第 9,500 张付费卡成功铸造时，同一笔交易会完成三件事：结束本批；把本批实际买到的项目代币按 10,000 份记账，开启本批卡牌的销毁兑换；把目前积累的 BNB 税收分给全项目当时所有已激活、未销毁的卡牌权益。随后开放下一批铸造。",
    "例如第 1 批结算时，假设积累 10 BNB 税收，10,000 份权益每份约记入 0.001 BNB，其中包括尚未铸出的团队权益。分红先记在卡上，不会自动打进钱包，持卡人要主动领取。",
    "第 2 批结算时，假设又积累 10 BNB，且第 1 批没有卡销毁，分红由两批共 20,000 份平分，每份约 0.0005 BNB；不是只分给第 2 批。旧卡能继续参与，销毁的卡不再参与。本次待分配税收按结算时的份数平分，不按持有天数加权；微小舍入余数可能留在金库。",
  ] },
  { title: "卡牌里记的钱，究竟是什么？", paragraphs: [
    "第一项是「可兑换项目代币数量」，不是 BNB 存款，也不是卡牌售价。例如一批实际买到 1,000,000 枚项目代币，结算后每份记入 100 枚。持有本批卡牌，销毁时就能领这份代币；价格涨跌会改变它的市值，合约不保证固定美元价值。",
    "第二项是「未领 BNB 分红」：已经分配给这张卡、但还没取走的 BNB。例如卡上有 100 枚代币兑换份额和 0.001 BNB 分红，单独领分红只拿走 0.001 BNB，卡和代币兑换权都保留；销毁兑换则拿到 100 枚代币及剩余未领 BNB，同时卡牌消失，永久停止后续分红。",
    "因此，持卡不销毁可以继续参加以后批次的税收分配；想取出对应项目代币，就必须销毁卡牌。本批尚未售满时不能销毁兑换。页面中的市场售价是卖家的报价，与这两项权益是不同的数字。",
  ] },
  { title: "77 批全部售完以后", paragraphs: [
    "当全部 731,500 张付费卡售完，不再发行新付费卡。后续税收不用再等批次结束，而是在同步等操作触发结算时，按当时仍有效的卡牌权益分配；普通 BNB 转入会先记账，仍可能需要有人触发同步。",
    "分红仍需主动领取，销毁仍会减少分红份数；若所有有效权益都已销毁，后续税收归运营。税收多少取决于实际收入，不保本、不承诺固定回报。",
  ] },
  { title: "买卖和转账，分红归谁？", paragraphs: [
    "合约市场成交手续费为 1%，与税币交易税不是一回事。成交时，这张卡之前的未领分红先付给卖家，买家接手后参与后续分红；代币兑换权随卡交给买家。普通钱包转账则让未领分红随卡一起转移。",
    "求购的 BNB 由合约托管，未成交部分可撤单退回。购买卡牌不消耗付费铸造名额，也不要求 Agent ID。",
  ] },
  { title: "权限与风险", paragraphs: [
    "Flap Guardian 可升级实现或锁定升级。按这份合约当前规则，紧急提取只允许取账外资产，不得提走已记账税收、分红、求购押金或回购代币。数字资产、合约和升级均有风险。以上数字例子只解释计算方式，不代表真实收入或预测收益。",
  ] },
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
      <div className="mt-10 max-w-3xl">{sections.map((section, i) => <section key={section.title} className="grid grid-cols-[32px_1fr] gap-4 border-t border-border py-7 sm:gap-8"><span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span><div className="min-w-0"><h2 className="mb-3 text-xl">{section.title}</h2><div className="space-y-3">{section.paragraphs.map(paragraph => <p key={paragraph} className="text-sm leading-7 text-muted-foreground">{paragraph}</p>)}</div></div></section>)}</div>
      <Button asChild className="mt-6"><Link to="/agent-cards">返回铸造<ArrowUpRight /></Link></Button>
    </main>
  </div>;
}