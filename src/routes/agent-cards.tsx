import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Check, CheckCheck, ChevronRight, Copy, Flame, Layers, Minus, Plus, Search, ShieldCheck, ShoppingBag, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FagentLogo } from "@/components/agent-cards/FagentLogo";
import { AgentCardArt } from "@/components/agent-cards/AgentCardArt";
import { AgentCommands } from "@/components/agent-cards/AgentCommands";
import { MarketBook } from "@/components/agent-cards/MarketBook";
import { batchForCard, CARD_RULES, mintRemaining, PREVIEW_LISTINGS, previewSupply, type PreviewCard } from "@/lib/agent-card-model";

export const Route = createFileRoute("/agent-cards")({
  head: () => ({ meta: [
    { title: "FAGENT — Flap 税收分红卡牌" },
    { name: "description", content: "币安 Agent 钱包铸造 FAGENT，参与 Flap BNB 税收分配、卡牌交易与批次代币兑换。" },
    { property: "og:title", content: "FAGENT — 一张卡，连接链上税收" },
    { property: "og:description", content: "77 批黑金卡牌，铸造、持有、交易与兑换。基于 AgentCardVault 合约的独立体验。" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ], links: ["16x16", "32x32", "64x64"].map(sizes => ({ rel: "icon", type: "image/png", sizes, href: "/favicon-fagent-approved.png" })) }),
  component: AgentCards,
});

type Tab = "mint" | "market" | "collection" | "commands" | "vault";
type Action = { kind: "mint" | "buy" | "claim" | "redeem" | "bid" | "list"; card?: PreviewCard; price?: number };
const tabs: { key: Tab; label: string }[] = [{ key: "mint", label: "铸造卡牌" }, { key: "market", label: "卡牌市场" }, { key: "collection", label: "我的卡牌" }, { key: "commands", label: "Agent 指令" }, { key: "vault", label: "金库账本" }];
const previewOwned: PreviewCard = { id: 751, price: 0.002, dividend: 0.00021, closed: true };

function AgentCards() {
  const [tab, setTab] = useState<Tab>("mint");
  const [connected, setConnected] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [action, setAction] = useState<Action | null>(null);
  const [owned, setOwned] = useState<PreviewCard[]>([]);
  const [used, setUsed] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [query, setQuery] = useState("");
  const [batch, setBatch] = useState("all");
  const [sort, setSort] = useState("id");
  const [price, setPrice] = useState("0.003");
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [listed, setListed] = useState<number[]>([]);
  const [notice, setNotice] = useState("");
  const listings = useMemo(() => PREVIEW_LISTINGS.filter(c => !owned.some(o => o.id === c.id) && String(c.id).includes(query) && (batch === "all" || batchForCard(c.id) === Number(batch))).sort((a, b) => sort === "price" ? a.price - b.price : a.id - b.id), [owned, query, batch, sort]);

  const supply = previewSupply(used);

  function openAction(next: Action) {
    if (!connected) { setWalletOpen(true); return; }
    setCompleted(false);
    setAction(next);
  }
  function confirmAction() {
    if (!action) return;
    if (action.kind === "mint" && mintRemaining(used) > 0) {
      setOwned(cards => [...cards, { id: 12950 + used, price: 0.002, dividend: 0, closed: false }]);
      setUsed(n => n + 1);
    }
    if (action.kind === "buy" && action.card) { const card = action.card; setOwned(cards => [...cards, { ...card, dividend: 0 }]); }
    if (action.kind === "claim" && action.card) setOwned(cards => cards.map(c => c.id === action.card?.id ? { ...c, dividend: 0 } : c));
    if (action.kind === "redeem" && action.card) setOwned(cards => cards.filter(c => c.id !== action.card?.id));
    if (action.kind === "list" && action.card) { const id = action.card.id; setListed(ids => [...ids, id]); }
    setCompleted(true);
  }

  return (
    <div className="ac-page">
      <header className="ac-header">
        <div className="ac-container flex h-20 items-center justify-between gap-4">
          <Link to="/agent-cards" aria-label="FAGENT 首页" className="min-w-0 shrink"><FagentLogo /></Link>
          <nav className="hidden items-center gap-7 md:flex" aria-label="卡牌导航">{tabs.slice(0, 4).map(item => <Button key={item.key} variant="ghost" className={`h-10 rounded-none px-0 ${tab === item.key ? "text-primary" : "text-muted-foreground"}`} onClick={() => setTab(item.key)}>{item.label}</Button>)}<Button asChild variant="ghost" className="h-10 rounded-none px-0 text-muted-foreground"><Link to="/agent-cards/rules">规则</Link></Button></nav>
          <Button variant="outline" className="h-10 border-primary/40 text-primary" onClick={() => setWalletOpen(true)}><Wallet />{connected ? "体验钱包" : "Agent 钱包"}<ArrowUpRight /></Button>
        </div>
      </header>

      <main className="ac-container">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-4 text-[11px] text-muted-foreground"><span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-primary" />BNB CHAIN <span className="mx-1 text-border">/</span> GENESIS COLLECTION</span><span className="flex items-center gap-2"><ShieldCheck className="size-3.5" />体验版 · 尚未连接新金库</span></div>

        <section className="ac-intro">
          <div className="ac-intro-copy">
            <p className="mb-5 flex items-center gap-2 font-mono text-xs text-primary"><span className="h-px w-7 bg-primary" /> FAIR MINT · 公平铸造</p>
            <h1 className="py-2"><FagentLogo square={false} className="h-auto w-44 sm:w-52" /></h1>
            <h2 className="mt-5 text-xl font-bold sm:text-2xl">每一笔交易税，最后都记在一张卡上。</h2>
            <div className="mt-4 max-w-md space-y-3 text-sm leading-7 text-muted-foreground"><p><span className="block">Flap 上每发生一笔交易，都会留下一笔税。</span><span className="block text-foreground">FAGENT 把它分给持有卡牌的人。</span></p><p>共 77 批，每批 1 万张（9,500 张公开铸造 + 500 张团队自留）。每满 1 万张结算一次，攒下的交易税按卡平分<span className="text-foreground">，有几张卡，就拿几份</span>。</p><p>铸造费的 80% 用于回购代币，记在 NFT 名下。持有期间，分红照拿；不想要了，燃烧 NFT 换回代币。</p></div>
            <div className="mt-7 flex flex-wrap items-center gap-3"><Button className="h-11 px-6" onClick={() => { setTab("mint"); document.getElementById("card-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>开始铸造<ArrowUpRight /></Button><Button asChild variant="ghost" className="h-11 text-muted-foreground"><Link to="/agent-cards/rules">合约规则<ChevronRight /></Link></Button></div>
            <div className="mt-8 flex items-center gap-3 text-xs text-muted-foreground"><ShieldCheck className="size-4 text-primary" /><span>币安 Agent 钱包的 Agent ID</span><span className="text-border">/</span><span>市场交易不限 Agent ID</span></div>
          </div>
          <div className="ac-collectible"><div className="ac-edition"><span>EDITION 001</span><span>THE GENESIS</span></div><AgentCardArt /><div className="ac-art-caption"><span>每张等权 · 分红不保本</span><span className="text-primary">FAGENT ↗</span></div></div>
          <div className="ac-side-code" aria-hidden>77 BATCHES / ONE COLLECTION</div>
        </section>

        <p className="mb-3 text-xs text-muted-foreground">模拟数据 · 非真实链上销量</p>
        <section className="ac-stats" aria-label="合约固定参数">{[{ value: CARD_RULES.supply.toLocaleString(), unit: "张", label: "总发行量" }, { value: supply.minted.toLocaleString(), unit: "张", label: "已铸造 · 模拟" }, { value: supply.remaining.toLocaleString(), unit: "张", label: "剩余可发行 · 模拟" }, { value: String(CARD_RULES.mintPriceBnb), unit: "BNB", label: "单张铸造价格" }].map(s => <div key={s.label}><p className="flex flex-wrap items-baseline gap-2"><span className="font-poster text-4xl sm:text-5xl">{s.value}</span><span className="text-xs text-primary">{s.unit}</span></p><p className="mt-3 text-xs text-muted-foreground">{s.label}</p></div>)}</section>

        <section id="card-workspace" className="scroll-mt-6 pb-16 pt-9">
          <div className="ac-tabs" role="tablist" aria-label="卡牌操作">{tabs.map(item => <Button key={item.key} id={`tab-${item.key}`} role="tab" aria-selected={tab === item.key} aria-controls="card-panel" variant="ghost" className={`ac-tab ${tab === item.key ? "ac-tab-active" : ""}`} onClick={() => setTab(item.key)}>{item.label}{item.key === "collection" && connected && <span className="font-mono text-xs">{owned.length}</span>}</Button>)}<Button asChild variant="ghost" className="ac-tab"><Link to="/agent-cards/rules">规则</Link></Button><span className="ml-auto hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><span className="size-1 rounded-full bg-primary" />合约驱动</span></div>
          <div id="card-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="pt-7">
            {tab === "mint" && <div className="ac-mint-grid">
              <div><div className="mb-7 flex items-end justify-between gap-4"><div><p className="mb-2 font-mono text-[10px] text-muted-foreground">TOTAL SUPPLY</p><h3 className="text-xl">创世铸造 · 总发行量</h3></div><span className="text-xs text-muted-foreground">共 {CARD_RULES.batches} 批</span></div>
                <div className="flex flex-wrap items-baseline gap-2"><span className="font-poster text-4xl">{CARD_RULES.supply.toLocaleString()}</span><span className="text-sm text-primary">张 · 77 万张</span></div>
                <div className="mt-5 flex flex-wrap justify-between gap-3 text-sm"><span>已铸造 <strong className="font-mono text-primary">{supply.minted.toLocaleString()}</strong> 张</span><span>剩余 <strong className="font-mono text-primary">{supply.remaining.toLocaleString()}</strong> 张</span></div>
                <progress className="ac-progress mt-4" value={supply.minted} max={CARD_RULES.supply} aria-label="模拟总发行进度" />
                <p className="mt-3 text-xs text-muted-foreground">模拟进度 {(supply.minted / CARD_RULES.supply * 100).toFixed(2)}% · 第 {supply.batch} / 77 批 · 本批付费卡 {supply.batchPaid.toLocaleString()} / 9,500 张</p>
                <div className="mt-5 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground"><p>分 77 批发行，每批共 10,000 张。</p><p>其中 9,500 张付费卡，500 份团队权益；均包含在 77 万张总量内。</p><p>每批 9,500 张付费卡售满即结算；团队暂不铸卡也不影响。</p></div>
                <div className="mt-8 grid grid-cols-2 gap-6 border-t border-border pt-6"><div><p className="font-poster text-3xl text-primary">80%</p><p className="mt-2 text-sm">买入项目代币</p><p className="mt-1 text-xs text-muted-foreground">每张 0.0016 BNB</p></div><div><p className="font-poster text-3xl">20%</p><p className="mt-2 text-sm">运营费用</p><p className="mt-1 text-xs text-muted-foreground">每张 0.0004 BNB</p></div></div>
              </div>
              <div className="ac-mint-tool"><div className="mb-6 flex items-center justify-between"><span className="flex items-center gap-2 text-sm"><Layers className="size-4 text-primary" />铸造 FAGENT</span><span className="font-mono text-xs text-muted-foreground">× 1</span></div><div className="flex items-baseline gap-2"><strong className="font-poster text-5xl">0.002</strong><span className="text-primary">BNB</span></div><div className="my-6 space-y-3 border-y border-border py-4 text-xs"><div className="flex items-start justify-between gap-4"><span className="shrink-0 text-muted-foreground">铸造资格</span><span className="max-w-48 text-right leading-5">{connected ? "体验币安 Agent 钱包身份" : "币安 Agent 钱包的 Agent ID"}</span></div><div className="flex justify-between"><span className="text-muted-foreground">终身剩余名额</span><span className="font-mono">{connected ? mintRemaining(used) : "—"} / 7</span></div><div className="flex justify-between"><span className="text-muted-foreground">网络费用</span><span className="text-muted-foreground">另计</span></div></div><Button className="h-12 w-full" disabled={connected && mintRemaining(used) === 0} onClick={() => openAction({ kind: "mint" })}>{connected ? mintRemaining(used) === 0 ? "铸造名额已用完" : "铸造一张卡牌" : "使用 Agent 钱包"}<ArrowUpRight /></Button><p className="mt-3 text-center text-[11px] text-muted-foreground">体验操作不会扣款，也不会发送链上交易</p></div>
            </div>}

            {tab === "market" && <MarketBook listings={listings} onBuy={card => openAction({ kind: "buy", card })} onBid={() => openAction({ kind: "bid" })} onSell={price => owned[0] ? openAction({ kind: "list", card: owned[0], price }) : setTab("collection")} />}

            {tab === "collection" && <>{!connected ? <div className="ac-empty"><Wallet className="mb-4 size-8 text-primary" /><h3 className="text-xl">你的卡牌，你的链上权益。</h3><p className="my-4 text-sm text-muted-foreground">铸造、购买的卡牌，都保留在自己的钱包里。</p><Button onClick={() => setWalletOpen(true)}>使用 Agent 钱包<ArrowUpRight /></Button></div> : <><div className="mb-7 flex flex-wrap items-center justify-between gap-4"><div><h3 className="text-xl">我的收藏 <span className="ml-2 text-primary">{owned.length}</span></h3><p className="mt-2 text-xs text-muted-foreground">体验资产 · 不代表实际钱包余额</p></div><p className="font-mono text-sm">待领分红 <span className="text-primary">{owned.reduce((sum, c) => sum + c.dividend, 0).toFixed(5)} BNB</span></p></div><div className="ac-market-grid">{owned.map(c => <article key={c.id} className="ac-market-card"><AgentCardArt id={c.id} compact /><div className="p-4"><h3 className="font-mono text-sm">#{String(c.id).padStart(6, "0")}</h3><p className="my-3 text-xs text-muted-foreground">未领分红 <span className="text-foreground">{c.dividend.toFixed(5)} BNB</span></p><div className="grid grid-cols-2 gap-2"><Button size="sm" variant="outline" disabled={c.dividend === 0} onClick={() => openAction({ kind: "claim", card: c })}><ArrowDownLeft />领分红</Button><Button size="sm" variant="outline" disabled={!c.closed} onClick={() => openAction({ kind: "redeem", card: c })}><Flame />兑换</Button></div><Button size="sm" variant="ghost" className="mt-2 w-full text-primary" onClick={() => { if (listed.includes(c.id)) { setListed(ids => ids.filter(id => id !== c.id)); setNotice("体验挂单已下架"); } else openAction({ kind: "list", card: c }); }}>{listed.includes(c.id) ? <X /> : <Plus />}{listed.includes(c.id) ? "下架挂单" : "挂单出售"}</Button>{!c.closed && <p className="mt-2 text-[10px] text-muted-foreground">本批售满后可销毁兑换</p>}</div></article>)}</div>{owned.length === 0 && <div className="ac-empty"><Layers className="mb-3 size-8 text-primary" /><p>还没有卡牌</p><Button className="mt-4" onClick={() => setTab("mint")}>去铸造<ArrowUpRight /></Button></div>}</>}</>}

            {tab === "commands" && <AgentCommands />}
            {tab === "vault" && <div className="ac-mint-grid"><div><h3 className="text-xl">BNB 税收账本</h3><p className="mb-5 mt-2 text-xs text-muted-foreground">未连接新金库，实时金额暂不显示。</p>{["累计收到税收", "待分配税收", "未领取分红", "求购托管金额", "已支付分红"].map(label => <div key={label} className="flex justify-between border-b border-border py-4 text-sm"><span className="text-muted-foreground">{label}</span><span className="font-mono">— BNB</span></div>)}</div><div className="border-l border-border pl-6"><p className="font-mono text-[10px] text-primary">DISTRIBUTION LOGIC</p><h3 className="mt-3 text-xl">税收先累积，批次售满再分配。</h3><p className="mt-4 text-sm leading-7 text-muted-foreground">77 批全部售完之前，每次有一批售满，累积的 BNB 税收才会分配给当时所有有效、未销毁的卡牌。不是实时到账，也不是固定收益。</p><p className="mt-4 text-sm leading-7 text-muted-foreground">例如第 1 批累积 10 BNB 税收，9,500 张付费卡售满后，连同 500 份团队权益共 10,000 份，每份约记入 0.001 BNB，需主动领取。团队未铸卡也计入份数。全部售完后，后续税收经同步等操作分配；销毁卡牌不再参与。</p><Button asChild variant="link" className="mt-5 px-0"><Link to="/agent-cards/rules">查看完整规则<ArrowUpRight /></Link></Button></div></div>}
          </div>
        </section>

        <section className="ac-flow"><div className="mb-8 flex items-center justify-between"><h2 className="text-xl">从交易税，到卡牌权益。</h2><span className="hidden font-mono text-[10px] text-muted-foreground sm:block">THE CARD CYCLE</span></div><div className="grid gap-8 md:grid-cols-3">{[{ n: "01", title: "铸造 · 买入", text: "0.002 BNB 铸造一张卡，80% 通过 Flap 买入项目代币，按批次记账。" }, { n: "02", title: "持有 · 分税", text: "每张有效卡牌等权。批次售满触发税收分配，已分到卡上的 BNB 可单独领取。" }, { n: "03", title: "交易 · 兑换", text: "卡牌自由挂单交易。本批售满后，可销毁兑换本批对应代币及未领分红。" }].map(item => <div key={item.n} className="border-t border-border pt-5"><span className="font-mono text-xs text-primary">{item.n} /</span><h3 className="mb-3 mt-4 text-base">{item.title}</h3><p className="text-xs leading-6 text-muted-foreground">{item.text}</p></div>)}</div></section>
        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border py-7 text-xs text-muted-foreground"><FagentLogo square={false} className="h-auto w-32" /><span>独立合约体验 · 无固定收益承诺 · 数字资产存在风险</span><Button asChild variant="ghost" size="sm"><Link to="/agent-cards/rules">合约规则<ArrowUpRight /></Link></Button></footer>
      </main>

      <Dialog open={walletOpen} onOpenChange={setWalletOpen}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>Agent 钱包</DialogTitle><DialogDescription>新金库地址尚未提供，当前只开放页面体验；不会连接或扣取真实资产。</DialogDescription></DialogHeader><div className="flex items-center gap-4 border-y border-border py-5"><Wallet className="size-8 text-primary" /><div><p className="text-sm">币安 Agent 钱包</p><p className="mt-1 text-xs text-muted-foreground">付费铸造需持有币安 Agent 钱包的 Agent ID</p></div></div><Button onClick={() => { if (!connected) { setConnected(true); setOwned([previewOwned]); } setWalletOpen(false); }}>进入体验钱包<ArrowUpRight /></Button>{connected && <Button variant="ghost" onClick={() => { setConnected(false); setWalletOpen(false); }}>退出体验钱包</Button>}</DialogContent></Dialog>

      <Dialog open={action !== null} onOpenChange={open => { if (!open) setAction(null); }}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>{completed ? "体验操作已完成" : action?.kind === "mint" ? "铸造确认" : action?.kind === "buy" ? "购买卡牌" : action?.kind === "claim" ? "领取 BNB 分红" : action?.kind === "redeem" ? "销毁并兑换" : action?.kind === "bid" ? "发布求购" : "挂单出售"}</DialogTitle><DialogDescription>{completed ? "只有页面中的示例资产发生变化，没有发送真实交易。" : "此操作为体验预览，不会花费 BNB。"}</DialogDescription></DialogHeader>{completed ? <div className="flex flex-col items-center py-7"><CheckCheck className="mb-5 size-12 text-primary" /><p className="text-sm">{action?.kind === "redeem" ? "示例卡牌已销毁，不再参与分红" : action?.kind === "bid" ? "示例求购已创建，未托管真实资金" : "可在「我的卡牌」查看体验状态"}</p></div> : <><div className="space-y-4 border-y border-border py-5 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">网络</span><span>BNB Chain · 56</span></div>{action?.card && <div className="flex justify-between"><span className="text-muted-foreground">卡牌</span><span className="font-mono">#{action.card.id}</span></div>}{action?.kind === "mint" && <div className="flex justify-between"><span className="text-muted-foreground">铸造价格</span><span>0.002 BNB + 网络费</span></div>}{action?.kind === "buy" && <div className="flex justify-between"><span className="text-muted-foreground">购买价格</span><span>{action.card?.price} BNB</span></div>}{action?.kind === "claim" && <div className="flex justify-between"><span className="text-muted-foreground">示例可领</span><span>{action.card?.dividend} BNB</span></div>}{action?.kind === "redeem" && <p className="text-sm text-primary">销毁不可撤销。兑换项目代币及未领分红，随后失去这张卡的分红权。示例不填造代币数量。</p>}{(action?.kind === "bid" || action?.kind === "list") && <label className="block text-muted-foreground">单张价格（BNB）<input type="number" min="0.000001" step="0.001" value={price} onChange={e => setPrice(e.target.value)} className="mt-2 h-11 w-full border border-input bg-background px-3 font-mono text-foreground" /></label>}{action?.kind === "bid" && <div className="flex items-center justify-between"><span className="text-muted-foreground">求购数量</span><div className="flex items-center gap-3"><Button variant="outline" size="icon" aria-label="减少数量" disabled={quantity <= 1} onClick={() => setQuantity(n => n - 1)}><Minus /></Button><span className="w-7 text-center font-mono">{quantity}</span><Button variant="outline" size="icon" aria-label="增加数量" onClick={() => setQuantity(n => n + 1)}><Plus /></Button></div></div>}</div><Button className="h-11" disabled={(action?.kind === "bid" || action?.kind === "list") && !(Number(price) > 0)} onClick={confirmAction}>确认体验<Check /></Button></>}{completed && <Button onClick={() => { setAction(null); if (action?.kind !== "bid") setTab("collection"); }}>完成<ArrowUpRight /></Button>}</DialogContent></Dialog>

      <Dialog open={rulesOpen} onOpenChange={setRulesOpen}><DialogContent className="max-h-[85svh] max-w-xl overflow-y-auto"><DialogHeader><DialogTitle>FAGENT 合约规则</DialogTitle><DialogDescription>依据你上传的 AgentCardVault 合约；不是原 CATCH 股票金库。</DialogDescription></DialogHeader><div className="space-y-5 text-sm leading-7">{[{ title: "铸造与供给", text: `总量 ${CARD_RULES.supply.toLocaleString()} 张，77 批，每批 9,500 张付费卡与 500 张团队卡。付费铸造仅限持有 Agent ID 的币安 Agent 钱包，每地址终身最多 7 张；卖掉或销毁不会恢复名额。` }, { title: "税收分配", text: "税收保留为 BNB。全部售完之前，按批次售满触发分配，分给当时所有有效未销毁卡牌。全部售完后，新税收经同步等操作分配。收入取决于实际交易税，不保证收益。" }, { title: "团队与代币兑换", text: "每付费铸造 19 张，激活 1 份团队权益，团队不铸卡也不影响结算和份数。9,500 张付费卡售满后，该批买到的项目代币平均记到本批 10,000 份权益上；这是代币数量，不是 BNB 余额。销毁可兑换该份代币及未领 BNB，之后停止分红。" }, { title: "市场与转让", text: "买卖不限 Agent ID。合约市场手续费 1%；成交时未领分红支付给卖家，买家从成交后参与分红。普通转账则让未领分红随卡转移。求购资金在合约托管，未成交部分可撤单退回。" }, { title: "权限与风险", text: "Flap Guardian 可升级实现或锁定升级。紧急提取限于账外资产，不得提走已记账税收、分红、求购押金或回购代币。合约、交易与升级仍有风险。" }].map(r => <div key={r.title}><h3 className="mb-1 text-primary">{r.title}</h3><p className="text-muted-foreground">{r.text}</p></div>)}</div><Button variant="outline" onClick={async () => { try { await navigator.clipboard.writeText("FAGENT：0.002 BNB/张；每地址终身付费铸造最多7张；80%买入项目代币、20%运营；批次售满触发税收分配；市场手续费1%。"); setCopied(true); } catch { setNotice("复制失败，请手动选择规则文字"); } }}><Copy />{copied ? "规则已复制" : "复制规则摘要"}</Button></DialogContent></Dialog>
      {notice && <div role="status" className="fixed bottom-6 left-1/2 z-50 flex max-w-[90%] -translate-x-1/2 items-center gap-4 border border-border bg-popover px-4 py-3 text-sm">{notice}<Button variant="ghost" size="icon" aria-label="关闭提示" onClick={() => setNotice("")}><X /></Button></div>}
    </div>
  );
}