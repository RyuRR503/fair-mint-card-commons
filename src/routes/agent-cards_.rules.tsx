import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FagentLogo } from "@/components/agent-cards/FagentLogo";
import { CARD_RULES } from "@/lib/agent-card-model";

export const Route = createFileRoute("/agent-cards_/rules")({
  head: () => ({ meta: [
    { title: "FAGENT — 卡牌规则" },
    { name: "description", content: "FAGENT 的发行数量、铸造价格、税收分配、交易与兑换规则。" },
    { property: "og:title", content: "FAGENT — 卡牌规则" },
    { property: "og:description", content: "77 万张卡牌的铸造、持有、交易与兑换规则。" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ], links: ["16x16", "32x32", "64x64"].map(sizes => ({ rel: "icon", type: "image/png", sizes, href: "/favicon-fagent-approved.png" })) }),
  component: CardRulesPage,
});

const sections = [
  { title: "Fair Mint 公平铸造", paragraphs: [
    "全系列共 77 批，每批 10,000 张：9,500 张公开铸造，500 张团队自留。公开铸造售满 9,500 张，即视为本批满额。",
    "每满一批，结算一次：自代币开始收税起累积的交易税，按卡等权分配。每张卡所得相同，持有几张，即得几份。",
    "铸造费的 80% 用于回购项目代币，回购所得记在 NFT 名下；同一批次内，每张卡记到的代币数量一致。",
    "持续持有，即持续参与分红；若不再需要分红权，可销毁 NFT，换回记在卡上的代币，并一并领走未领分红。销毁后，该卡永久退出分配。",
  ] },
  { title: "铸造资格：币安 Agent 钱包专属", paragraphs: [
    `付费铸造仅面向持有 Agent ID 的币安 Agent 钱包。每张 ${CARD_RULES.mintPriceBnb} BNB，网络费用另计；每个地址终身最多付费铸造 7 张，转让或销毁均不恢复名额。`,
    "Agent ID 是钱包的链上身份，并非 SPACE ID 域名，也不等同于拥有币安账户。合约将核验发起地址是否持有指定的 Agent ID NFT；正式上线前，仍会核实该身份合约与币安 Agent 钱包的对应关系。市场交易不设此门槛。",
  ] },
  { title: "批次机制", paragraphs: [
    "77 万张为发行上限，分为 77 批。每批含 9,500 张付费卡与 500 张团队卡，共 10,000 份权益；团队卡包含在总量之内，并非额外增发。全系列合计 731,500 张付费卡、38,500 张团队卡。",
    "以第 1 批为例：付费卡铸至第 9,500 张时，本批自动结算，下一位铸造者即进入第 2 批。批次进度取决于销量，没有固定周期，也不会按日自动分红。",
  ] },
  { title: "团队权益", paragraphs: [
    "每批含 500 张团队自留卡，包含在 10,000 份总量之内，与付费卡享有同等的分红与兑换权益。",
  ] },
  { title: "铸造费的去向", paragraphs: [
    "每张 0.002 BNB：其中 0.0016 BNB（80%）即时通过 Flap 买入项目代币，累计计入本批；0.0004 BNB（20%）为运营费用。买入随铸造逐笔发生，并非待批次数满后统一执行。",
    "一批 9,500 张付费卡共计 19 BNB，其中 15.2 BNB 用于回购，3.8 BNB 用于运营。实际购得的代币数量取决于逐笔成交价，不保证与投入等值；团队卡无需付费，但享有同等份额。",
  ] },
  { title: "交易税的来源", paragraphs: [
    "交易税来自项目税币的交易行为，征税范围、税率及转入卡牌金库的比例，由税币与 Flap 的配置决定。本合约未写死税率，因此 1% 或 20% 均不应被理解为交易税率。",
    "进入金库的税收以 BNB 形式留存，不再买入代币。在 77 批付费卡全部售完之前，税收先记为待分配，待下一批售满时统一结算；没有新批次结算，分配不会仅因时间经过而发生。直接转入的 BNB 也可能被合约记入此项收入。",
  ] },
  { title: "批次结算时发生什么", paragraphs: [
    "第 9,500 张付费卡铸造成功的同一笔交易内，合约将完成三件事：结束本批；将本批购得的项目代币按 10,000 份记账，并开启本批卡牌的销毁兑换；将累积的 BNB 税收分配给当时全项目所有已激活、未销毁的权益。随后开放下一批铸造。",
    "以第 1 批为例：假设结算时累积 10 BNB 税收，10,000 份权益每份约记入 0.001 BNB，其中包含尚未铸出的团队权益。分红先记在卡上，不会自动转入钱包，需由持卡人主动领取。",
    "第 2 批结算时，假设再累积 10 BNB 且第 1 批无卡销毁，则分红由两批共 20,000 份平分，每份约 0.0005 BNB——旧卡继续参与，而非只分给新一批。分配按结算时的份数等权计算，不按持有时长加权；微小的舍入余数可能留存于金库。",
  ] },
  { title: "卡上记录的两项权益", paragraphs: [
    "第一项是「可兑换项目代币数量」——不是 BNB 存款，也不是卡牌售价。例如一批实际购得 1,000,000 枚代币，结算后每份记入 100 枚；销毁本批卡牌时即可领取。代币市值随价格波动，合约不承诺固定价值。",
    "第二项是「未领 BNB 分红」——已分配给该卡、但尚未提取的 BNB。例如卡上记有 100 枚代币份额与 0.001 BNB 分红：单独领取分红，仅取出 0.001 BNB，卡牌与代币兑换权均保留；销毁兑换，则一并取出 100 枚代币与全部未领分红，卡牌随之销毁，永久退出后续分配。",
    "因此，持有不销毁，即可持续参与后续批次的税收分配；要取出代币，必须销毁卡牌。本批售满前不可销毁兑换。市场中的挂牌价是卖家报价，与这两项权益相互独立。",
  ] },
  { title: "全部售完以后", paragraphs: [
    "731,500 张付费卡全部售完后，不再发行新卡。后续税收无须等待批次结算，而是在同步等操作触发时，按当时仍有效的权益分配；直接转入的 BNB 会先记账，可能仍需有人触发同步。",
    "分红仍需主动领取，销毁仍会减少分红份数；若全部有效权益均已销毁，后续税收归运营。税收多寡取决于实际交易收入，不保本，亦不承诺固定回报。",
  ] },
  { title: "交易与转让中的分红归属", paragraphs: [
    "合约市场的成交手续费为 1%，与税币的交易税是两回事。成交时，该卡此前的未领分红先结算给卖家，买家自成交起参与后续分红；代币兑换权随卡转移。普通钱包转账则令未领分红随卡一并转移。",
    "求购资金由合约托管，未成交部分可撤单退回。购买卡牌不消耗付费铸造名额，也不要求 Agent ID。",
  ] },
  { title: "权限与风险", paragraphs: [
    "Flap Guardian 可升级合约实现，或将升级永久锁定。按当前合约规则，紧急提取仅限账外资产，不得动用已记账的税收、分红、求购押金或回购代币。数字资产、合约与升级均存在风险。文中的数字示例仅用于说明计算方式，不代表真实收入，亦不构成收益预测。",
  ] },
];

function CardRulesPage() {
  return <div className="ac-page">
    <header className="ac-header"><div className="ac-container flex min-h-20 flex-wrap items-center justify-between gap-4 py-4">
      <Link to="/agent-cards" aria-label="FAGENT 首页"><FagentLogo /></Link>
      <nav aria-label="卡牌导航" className="flex flex-wrap gap-2"><Button asChild variant="ghost"><Link to="/agent-cards">铸造卡牌 / 卡牌市场 / Agent 指令</Link></Button><Button asChild variant="ghost" className="text-primary"><Link to="/agent-cards/rules" aria-current="page">规则</Link></Button></nav>
    </div></header>
    <main className="ac-container py-10 sm:py-14">
      <Button asChild variant="ghost" className="mb-8 px-0 text-muted-foreground"><Link to="/agent-cards"><ArrowLeft />返回卡牌</Link></Button>
      <p className="mb-3 font-mono text-xs text-primary">FAGENT / RULES</p>
      <h1 className="text-4xl font-bold">卡牌规则</h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">依据本项目上传的卡牌金库合约。当前页面中的数量与操作为模拟展示，不代表真实销量或链上资产。</p>
      <div className="mt-10 max-w-3xl">{sections.map((section, i) => <section key={section.title} className="grid grid-cols-[32px_1fr] gap-4 border-t border-border py-7 sm:gap-8"><span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span><div className="min-w-0"><h2 className="mb-3 text-xl">{section.title}</h2><div className="space-y-3">{section.paragraphs.map(paragraph => <p key={paragraph} className="text-sm leading-7 text-muted-foreground">{paragraph}</p>)}</div></div></section>)}</div>
      <Button asChild className="mt-6"><Link to="/agent-cards">返回铸造<ArrowUpRight /></Link></Button>
    </main>
  </div>;
}