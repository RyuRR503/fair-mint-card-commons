import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight, Check, CheckCheck, ChevronRight, Layers, Minus, Plus, ShieldCheck, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FagentLogo } from "@/components/agent-cards/FagentLogo";
import { AgentCardArt } from "@/components/agent-cards/AgentCardArt";
import { AgentCommands } from "@/components/agent-cards/AgentCommands";
import { MarketBook } from "@/components/agent-cards/MarketBook";
import { batchForCard, CARD_RULES, mintRemaining, PREVIEW_LISTINGS, previewSupply, type PreviewCard } from "@/lib/agent-card-model";

import { CardNavigation } from "@/components/agent-cards/CardNavigation";
export type CardPage = "mint" | "market" | "commands" | "vault";
type Action = { kind: "mint" | "buy" | "claim" | "redeem" | "bid" | "list"; card?: PreviewCard; price?: number };
export function CardExperience({ page = "mint" }: { page?: CardPage }) {
  const [connected, setConnected] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [action, setAction] = useState<Action | null>(null);
  const [owned, setOwned] = useState<PreviewCard[]>([]);
  const [used, setUsed] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [query, setQuery] = useState("");
  const [batch, setBatch] = useState("all");
  const [sort, setSort] = useState("id");
  const [price, setPrice] = useState("0.003");
  const [quantity, setQuantity] = useState(1);
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
    setCompleted(true);
  }

  return (
    <div className="ac-page">
      <header className="ac-header">
        <div className="ac-container flex h-20 items-center justify-between gap-4">
          <Link to="/" aria-label="FAGENT 首页" className="min-w-0 shrink"><FagentLogo /></Link>
          <CardNavigation className="hidden items-center gap-7 md:flex" />
          <Button variant="outline" className="h-10 border-primary/40 text-primary" onClick={() => setWalletOpen(true)}><Wallet />{connected ? "体验钱包" : "Agent 钱包"}<ArrowUpRight /></Button>
        </div>
      </header>

      <main className="ac-container">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-4 text-[11px] text-muted-foreground"><span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-primary" />BNB CHAIN <span className="mx-1 text-border">/</span> GENESIS COLLECTION</span><span className="flex items-center gap-2"><ShieldCheck className="size-3.5" />体验版 · 尚未连接新金库</span></div>

        {page === "mint" && <><section className="ac-intro">
          <div className="ac-intro-copy">
            <p className="mb-5 flex items-center gap-2 font-mono text-xs text-primary"><span className="h-px w-7 bg-primary" /> FAIR MINT · 公平铸造 · 币安 Agent 钱包专属</p>
            <h1 className="py-2"><FagentLogo square={false} className="h-auto w-44 sm:w-52" /></h1>
            <h2 className="mt-5 text-xl font-bold sm:text-2xl">一张卡，接住 .AI 时代的每一笔税收。</h2>
            <div className="mt-4 max-w-md space-y-3 text-sm leading-7 text-muted-foreground"><p><span className="block">交易在发生，税收在累积。</span><span className="block text-foreground">而这张卡，替你记下属于你的那一份。</span></p><p>持有，就参与每一次分配；销毁，就兑换卡上记下的代币。</p></div>
            <div className="mt-7 flex flex-wrap items-center gap-3"><Button className="h-11 px-6" onClick={() => { document.getElementById("card-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>开始铸造<ArrowUpRight /></Button><Button asChild variant="ghost" className="h-11 text-muted-foreground"><Link to="/rules">合约规则<ChevronRight /></Link></Button></div>
            <div className="mt-8 flex items-center gap-3 text-xs text-muted-foreground"><ShieldCheck className="size-4 text-primary" /><span>仅币安 Agent 钱包（Agent ID）可铸造</span><span className="text-border">/</span><span>市场交易不限身份</span></div>
          </div>
          <div className="ac-collectible"><div className="ac-edition"><span>EDITION 001</span><span>THE GENESIS</span></div><AgentCardArt /><div className="ac-art-caption"><span aria-hidden="true" /><span className="text-primary">FAGENT ↗</span></div></div>
          <div className="ac-side-code" aria-hidden>77 BATCHES / ONE COLLECTION</div>
        </section>

        <p className="mb-3 text-xs text-muted-foreground">模拟数据 · 非真实链上销量</p>
        <section className="ac-stats" aria-label="合约固定参数">{[{ value: CARD_RULES.supply.toLocaleString(), unit: "张", label: "总发行量" }, { value: supply.minted.toLocaleString(), unit: "张", label: "已铸造 · 模拟" }, { value: supply.remaining.toLocaleString(), unit: "张", label: "剩余可发行 · 模拟" }, { value: String(CARD_RULES.mintPriceBnb), unit: "BNB", label: "单张铸造价格" }].map(s => <div key={s.label}><p className="flex flex-wrap items-baseline gap-2"><span className="font-poster text-4xl sm:text-5xl">{s.value}</span><span className="text-xs text-primary">{s.unit}</span></p><p className="mt-3 text-xs text-muted-foreground">{s.label}</p></div>)}</section></>}

        <section id="card-workspace" className="scroll-mt-6 pb-16 pt-9">
          <div className="md:hidden"><CardNavigation className="ac-tabs" compact /></div>
          {page !== "mint" && <div className="mb-8 border-b border-border pb-6 pt-7"><p className="mb-3 font-mono text-xs text-primary">FAGENT / {page.toUpperCase()}</p><h1 className="text-3xl font-bold">{page === "market" ? "卡牌市场" : page === "commands" ? "Agent 指令" : "金库账本"}</h1></div>}
          <div className="pt-7">
            {page === "mint" && <div className="ac-mint-grid">
              <div><div className="mb-7 flex items-end justify-between gap-4"><div><p className="mb-2 font-mono text-[10px] text-muted-foreground">TOTAL SUPPLY</p><h3 className="text-xl">创世铸造 · 总发行量</h3></div><span className="text-xs text-muted-foreground">共 {CARD_RULES.batches} 批</span></div>
                <div className="flex flex-wrap items-baseline gap-2"><span className="font-poster text-4xl">{CARD_RULES.supply.toLocaleString()}</span><span className="text-sm text-primary">张 · 77 万张</span></div>
                <div className="mt-5 flex flex-wrap justify-between gap-3 text-sm"><span>已铸造 <strong className="font-mono text-primary">{supply.minted.toLocaleString()}</strong> 张</span><span>剩余 <strong className="font-mono text-primary">{supply.remaining.toLocaleString()}</strong> 张</span></div>
                <progress className="ac-progress mt-4" value={supply.minted} max={CARD_RULES.supply} aria-label="模拟总发行进度" />
                <p className="mt-3 text-xs text-muted-foreground">模拟进度 {(supply.minted / CARD_RULES.supply * 100).toFixed(2)}% · 第 {supply.batch} / 77 批 · 本批付费卡 {supply.batchPaid.toLocaleString()} / 9,500 张</p>
                <div className="mt-5 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground"><p>分 77 批发行，每批共 10,000 张。</p><p>其中 9,500 张公开铸造，500 张团队自留；均包含在 77 万张总量内。</p><p>每批 9,500 张公开铸造售满，即结算一次。</p></div>
                <div className="mt-8 grid grid-cols-2 gap-6 border-t border-border pt-6"><div><p className="font-poster text-3xl text-primary">80%</p><p className="mt-2 text-sm">买入项目代币</p><p className="mt-1 text-xs text-muted-foreground">每张 0.0016 BNB</p></div><div><p className="font-poster text-3xl">20%</p><p className="mt-2 text-sm">运营费用</p><p className="mt-1 text-xs text-muted-foreground">每张 0.0004 BNB</p></div></div>
              </div>
              <div className="ac-mint-tool"><div className="mb-6 flex items-center justify-between"><span className="flex items-center gap-2 text-sm"><Layers className="size-4 text-primary" />铸造 FAGENT</span><span className="font-mono text-xs text-muted-foreground">× 1</span></div><div className="flex items-baseline gap-2"><strong className="font-poster text-5xl">0.002</strong><span className="text-primary">BNB</span></div><div className="my-6 space-y-3 border-y border-border py-4 text-xs"><div className="flex items-start justify-between gap-4"><span className="shrink-0 text-muted-foreground">铸造资格</span><span className="max-w-48 text-right leading-5">{connected ? "体验币安 Agent 钱包身份" : "币安 Agent 钱包的 Agent ID"}</span></div><div className="flex justify-between"><span className="text-muted-foreground">终身剩余名额</span><span className="font-mono">{connected ? mintRemaining(used) : "—"} / 7</span></div><div className="flex justify-between"><span className="text-muted-foreground">网络费用</span><span className="text-muted-foreground">另计</span></div></div><Button className="h-12 w-full" disabled={connected && mintRemaining(used) === 0} onClick={() => openAction({ kind: "mint" })}>{connected ? mintRemaining(used) === 0 ? "铸造名额已用完" : "铸造一张卡牌" : "使用 Agent 钱包"}<ArrowUpRight /></Button><p className="mt-3 text-center text-[11px] text-muted-foreground">体验操作不会扣款，也不会发送链上交易</p></div>
            </div>}

            {page === "market" && <MarketBook listings={listings} onBuy={card => openAction({ kind: "buy", card })} onBid={() => openAction({ kind: "bid" })} onSell={() => setNotice("卡牌保存在你的 Agent 钱包里，网站无法读取；挂单出售请使用「Agent 指令」")} />}

            {page === "commands" && <AgentCommands />}
            {page === "vault" && <div className="ac-mint-grid"><div><h3 className="text-xl">BNB 税收账本</h3><p className="mb-5 mt-2 text-xs text-muted-foreground">未连接新金库，实时金额暂不显示。</p>{["累计收到税收", "待分配税收", "未领取分红", "求购托管金额", "已支付分红"].map(label => <div key={label} className="flex justify-between border-b border-border py-4 text-sm"><span className="text-muted-foreground">{label}</span><span className="font-mono">— BNB</span></div>)}</div><div className="border-l border-border pl-6"><p className="font-mono text-[10px] text-primary">DISTRIBUTION LOGIC</p><h3 className="mt-3 text-xl">税收先累积，批次售满再分配。</h3><p className="mt-4 text-sm leading-7 text-muted-foreground">77 批全部售完之前，每次有一批售满，累积的 BNB 税收才会分配给当时所有有效、未销毁的卡牌。不是实时到账，也不是固定收益。</p><p className="mt-4 text-sm leading-7 text-muted-foreground">例如第 1 批累积 10 BNB 税收，9,500 张付费卡售满后，连同 500 份团队权益共 10,000 份，每份约记入 0.001 BNB，需主动领取。团队未铸卡也计入份数。全部售完后，后续税收经同步等操作分配；销毁卡牌不再参与。</p><Button asChild variant="link" className="mt-5 px-0"><Link to="/rules">查看完整规则<ArrowUpRight /></Link></Button></div></div>}
          </div>
        </section>

        <section className="ac-flow"><div className="mb-8 flex items-center justify-between"><h2 className="text-xl">从交易税，到卡牌权益。</h2><span className="hidden font-mono text-[10px] text-muted-foreground sm:block">THE CARD CYCLE</span></div><div className="grid gap-8 md:grid-cols-3">{[{ n: "01", title: "铸造 · 买入", text: "0.002 BNB 铸造一张卡，80% 通过 Flap 买入项目代币，按批次记账。" }, { n: "02", title: "持有 · 分税", text: "每张有效卡牌等权。批次售满触发税收分配，已分到卡上的 BNB 可单独领取。" }, { n: "03", title: "交易 · 兑换", text: "卡牌自由挂单交易。本批售满后，可销毁兑换本批对应代币及未领分红。" }].map(item => <div key={item.n} className="border-t border-border pt-5"><span className="font-mono text-xs text-primary">{item.n} /</span><h3 className="mb-3 mt-4 text-base">{item.title}</h3><p className="text-xs leading-6 text-muted-foreground">{item.text}</p></div>)}</div></section>
        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border py-7 text-xs text-muted-foreground"><FagentLogo square={false} className="h-auto w-32" /><span>独立合约体验 · 无固定收益承诺 · 数字资产存在风险</span><Button asChild variant="ghost" size="sm"><Link to="/rules">合约规则<ArrowUpRight /></Link></Button></footer>
      </main>

      <Dialog open={walletOpen} onOpenChange={setWalletOpen}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>Agent 钱包</DialogTitle><DialogDescription>新金库地址尚未提供，当前只开放页面体验；不会连接或扣取真实资产。</DialogDescription></DialogHeader><div className="flex items-center gap-4 border-y border-border py-5"><Wallet className="size-8 text-primary" /><div><p className="text-sm">币安 Agent 钱包</p><p className="mt-1 text-xs text-muted-foreground">付费铸造需持有币安 Agent 钱包的 Agent ID</p></div></div><Button onClick={() => { if (!connected) setConnected(true); setWalletOpen(false); }}>进入体验钱包<ArrowUpRight /></Button>{connected && <Button variant="ghost" onClick={() => { setConnected(false); setWalletOpen(false); }}>退出体验钱包</Button>}</DialogContent></Dialog>

      <Dialog open={action !== null} onOpenChange={open => { if (!open) setAction(null); }}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>{completed ? "体验操作已完成" : action?.kind === "mint" ? "铸造确认" : action?.kind === "buy" ? "购买卡牌" : action?.kind === "claim" ? "领取 BNB 分红" : action?.kind === "redeem" ? "销毁并兑换" : action?.kind === "bid" ? "发布求购" : "挂单出售"}</DialogTitle><DialogDescription>{completed ? "只有页面中的示例资产发生变化，没有发送真实交易。" : "此操作为体验预览，不会花费 BNB。"}</DialogDescription></DialogHeader>{completed ? <div className="flex flex-col items-center py-7"><CheckCheck className="mb-5 size-12 text-primary" /><p className="text-sm">{action?.kind === "redeem" ? "示例卡牌已销毁，不再参与分红" : action?.kind === "bid" ? "示例求购已创建，未托管真实资金" : "体验状态仅保存在当前页面，卡牌实际在你的 Agent 钱包中"}</p></div> : <><div className="space-y-4 border-y border-border py-5 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">网络</span><span>BNB Chain · 56</span></div>{action?.card && <div className="flex justify-between"><span className="text-muted-foreground">卡牌</span><span className="font-mono">#{action.card.id}</span></div>}{action?.kind === "mint" && <div className="flex justify-between"><span className="text-muted-foreground">铸造价格</span><span>0.002 BNB + 网络费</span></div>}{action?.kind === "buy" && <div className="flex justify-between"><span className="text-muted-foreground">购买价格</span><span>{action.card?.price} BNB</span></div>}{action?.kind === "claim" && <div className="flex justify-between"><span className="text-muted-foreground">示例可领</span><span>{action.card?.dividend} BNB</span></div>}{action?.kind === "redeem" && <p className="text-sm text-primary">销毁不可撤销。兑换项目代币及未领分红，随后失去这张卡的分红权。示例不填造代币数量。</p>}{(action?.kind === "bid" || action?.kind === "list") && <label className="block text-muted-foreground">单张价格（BNB）<input type="number" min="0.000001" step="0.001" value={price} onChange={e => setPrice(e.target.value)} className="mt-2 h-11 w-full border border-input bg-background px-3 font-mono text-foreground" /></label>}{action?.kind === "bid" && <div className="flex items-center justify-between"><span className="text-muted-foreground">求购数量</span><div className="flex items-center gap-3"><Button variant="outline" size="icon" aria-label="减少数量" disabled={quantity <= 1} onClick={() => setQuantity(n => n - 1)}><Minus /></Button><span className="w-7 text-center font-mono">{quantity}</span><Button variant="outline" size="icon" aria-label="增加数量" onClick={() => setQuantity(n => n + 1)}><Plus /></Button></div></div>}</div><Button className="h-11" disabled={(action?.kind === "bid" || action?.kind === "list") && !(Number(price) > 0)} onClick={confirmAction}>确认体验<Check /></Button></>}{completed && <Button onClick={() => setAction(null)}>完成<ArrowUpRight /></Button>}</DialogContent></Dialog>

      {notice && <div role="status" className="fixed bottom-6 left-1/2 z-50 flex max-w-[90%] -translate-x-1/2 items-center gap-4 border border-border bg-popover px-4 py-3 text-sm">{notice}<Button variant="ghost" size="icon" aria-label="关闭提示" onClick={() => setNotice("")}><X /></Button></div>}
    </div>
  );
}