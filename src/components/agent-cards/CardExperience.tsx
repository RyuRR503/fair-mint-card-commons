import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { snapshotOptions } from "@/lib/fagent/queries";
import { FAGENT, explorer } from "@/lib/fagent/config";
import { mintCommand } from "@/lib/fagent/commands";
import { CommandDialog, WalletCheck } from "./ChainTools";
import { BatchClock, VaultLedger } from "./VaultLedger";
import { RefreshCw } from "lucide-react";
import { ArrowUpRight, ChevronRight, Layers, Minus, Plus, ShieldCheck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FagentLogo } from "@/components/agent-cards/FagentLogo";
import { AgentCardArt } from "@/components/agent-cards/AgentCardArt";
import { AgentCommands } from "@/components/agent-cards/AgentCommands";
import { MarketBook } from "@/components/agent-cards/MarketBook";
import { CARD_RULES } from "@/lib/agent-card-model";

import { CardNavigation } from "@/components/agent-cards/CardNavigation";
export type CardPage = "mint" | "market" | "commands" | "vault";
export function CardExperience({ page = "mint" }: { page?: CardPage }) {
  const { data: result, refetch, isFetching } = useSuspenseQuery(snapshotOptions());
  const supply = result.data;
  const [walletOpen, setWalletOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [command, setCommand] = useState<string | null>(null);
  return (
    <div className="ac-page">
      <header className="ac-header">
        <div className="ac-container flex h-20 items-center justify-between gap-4">
          <Link to="/" aria-label="FAGENT 首页" className="min-w-0 shrink"><FagentLogo /></Link>
          <CardNavigation className="hidden items-center gap-7 md:flex" />
          <Button variant="outline" className="h-10 border-primary/40 text-primary" onClick={() => setWalletOpen(true)}><Wallet />Agent 钱包<ArrowUpRight /></Button>
        </div>
      </header>

      <main className="ac-container">{result.error && <div role="alert" className="border-b border-border py-4 text-sm text-destructive">{result.error}<Button variant="link" onClick={() => void refetch()}>重试</Button></div>}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-4 text-[11px] text-muted-foreground"><span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-primary" />BNB CHAIN <span className="mx-1 text-border">/</span> GENESIS COLLECTION</span><span className="flex items-center gap-2"><ShieldCheck className="size-3.5" />{supply ? `链上数据 · 区块 ${supply.block}` : "链上读取失败"}<Button variant="ghost" size="icon" aria-label="刷新链上数据" disabled={isFetching} onClick={() => void refetch()}><RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} /></Button></span></div>

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

        <p className="mb-3 text-xs text-muted-foreground">链上数据 · BNB Chain</p>
        <section className="ac-stats" aria-label="合约固定参数">{[{ value: CARD_RULES.supply.toLocaleString(), unit: "张", label: "总发行量" }, { value: supply?.minted.toLocaleString() ?? "—", unit: "张", label: "已铸造" }, { value: supply?.remaining.toLocaleString() ?? "—", unit: "张", label: "剩余可发行" }, { value: supply?.price ?? "—", unit: "BNB", label: "单张铸造价格" }].map(s => <div key={s.label}><p className="flex flex-wrap items-baseline gap-2"><span className="font-poster text-4xl sm:text-5xl">{s.value}</span><span className="text-xs text-primary">{s.unit}</span></p><p className="mt-3 text-xs text-muted-foreground">{s.label}</p></div>)}</section></>}

        <section id="card-workspace" className="scroll-mt-6 pb-16 pt-9">
          <div className="md:hidden"><CardNavigation className="ac-tabs" compact /></div>
          {page !== "mint" && <div className="mb-8 border-b border-border pb-6 pt-7"><p className="mb-3 font-mono text-xs text-primary">FAGENT / {page.toUpperCase()}</p><h1 className="text-3xl font-bold">{page === "market" ? "卡牌市场" : page === "commands" ? "Agent 指令" : "金库账本"}</h1></div>}
          <div className="pt-7">
            {page === "mint" && <div className="ac-mint-grid">
              <div><div className="mb-7 flex items-end justify-between gap-4"><div><p className="mb-2 font-mono text-[10px] text-muted-foreground">TOTAL SUPPLY</p><h3 className="text-xl">创世铸造 · 总发行量</h3></div><span className="text-xs text-muted-foreground">共 {CARD_RULES.batches} 批</span></div>
                <div className="flex flex-wrap items-baseline gap-2"><span className="font-poster text-4xl">{CARD_RULES.supply.toLocaleString()}</span><span className="text-sm text-primary">张 · 77 万张</span></div>
                <div className="mt-5 flex flex-wrap justify-between gap-3 text-sm"><span>已铸造 <strong className="font-mono text-primary">{supply?.minted.toLocaleString() ?? "—"}</strong> 张</span><span>剩余 <strong className="font-mono text-primary">{supply?.remaining.toLocaleString() ?? "—"}</strong> 张</span></div>
                <progress className="ac-progress mt-4" value={supply?.minted ?? 0} max={CARD_RULES.supply} aria-label="链上总发行进度" />
                <p className="mt-3 text-xs text-muted-foreground">铸造进度 {supply ? (supply.minted / CARD_RULES.supply * 100).toFixed(2) : "—"}% · 第 {supply?.batch ?? "—"} / 77 批 · 本批付费卡 {supply?.batchPaid.toLocaleString() ?? "—"} / 9,500 张</p>
                <div className="mt-5 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground"><p>分 77 批发行，每批共 10,000 张。</p><p>其中 9,500 张公开铸造，500 张团队自留；均包含在 77 万张总量内。</p><p>每批 9,500 张公开铸造售满，即结算一次；本批满 7 天仍未售满，可提前分配与兑换。</p>{supply && <BatchClock data={supply} />}</div>
                <div className="mt-8 grid grid-cols-2 gap-6 border-t border-border pt-6"><div><p className="font-poster text-3xl text-primary">80%</p><p className="mt-2 text-sm">买入项目代币</p><p className="mt-1 text-xs text-muted-foreground">每张 0.0016 BNB</p></div><div><p className="font-poster text-3xl">20%</p><p className="mt-2 text-sm">运营费用</p><p className="mt-1 text-xs text-muted-foreground">每张 0.0004 BNB</p></div></div>
              </div>
              <div className="ac-mint-tool"><div className="mb-6 flex items-center justify-between"><span className="flex items-center gap-2 text-sm"><Layers className="size-4 text-primary" />铸造 FAGENT</span><span className="font-mono text-xs text-muted-foreground">× {quantity}</span></div><div className="flex items-baseline gap-2"><strong className="font-poster text-5xl">{supply?.price ?? "—"}</strong><span className="text-primary">BNB / 张</span></div><div className="my-6 space-y-3 border-y border-border py-4 text-xs"><WalletCheck /><div className="flex items-center justify-between"><span className="text-muted-foreground">铸造数量</span><div className="flex items-center gap-3"><Button variant="outline" size="icon" aria-label="减少铸造数量" disabled={quantity <= 1} onClick={() => setQuantity(n => n - 1)}><Minus /></Button><span className="w-6 text-center font-mono">{quantity}</span><Button variant="outline" size="icon" aria-label="增加铸造数量" disabled={quantity >= (supply?.maxMints ?? 7)} onClick={() => setQuantity(n => n + 1)}><Plus /></Button></div></div><div className="flex justify-between"><span className="text-muted-foreground">合计</span><span>{(quantity * Number(supply?.price ?? 0)).toFixed(3)} BNB + 网络费</span></div></div><Button className="h-12 w-full" disabled={!supply || supply.paid >= 731500} onClick={() => setCommand(mintCommand(quantity))}>{supply?.paid === 731500 ? "全部售完" : "生成铸造指令"}<ArrowUpRight /></Button><p className="mt-3 text-center text-[11px] text-muted-foreground">币安 Agent 钱包确认后发送交易</p></div>
            </div>}

            {page === "market" && <MarketBook />}
            {page === "commands" && <AgentCommands />}
            {page === "vault" && supply && <VaultLedger data={supply} />}

          </div>
        </section>

        <section className="ac-flow"><div className="mb-8 flex items-center justify-between"><h2 className="text-xl">从交易税，到卡牌权益。</h2><span className="hidden font-mono text-[10px] text-muted-foreground sm:block">THE CARD CYCLE</span></div><div className="grid gap-8 md:grid-cols-3">{[{ n: "01", title: "铸造 · 买入", text: "0.002 BNB 铸造一张卡，80% 通过 Flap 买入项目代币，按批次记账。" }, { n: "02", title: "持有 · 分税", text: "每张有效卡牌等权。批次售满或本批满 7 天后经同步等操作分配；已分到卡上的 BNB 可单独领取。" }, { n: "03", title: "交易 · 兑换", text: "卡牌自由挂单交易。本批售满或本批满 7 天后，可销毁兑换对应代币及未领分红。" }].map(item => <div key={item.n} className="border-t border-border pt-5"><span className="font-mono text-xs text-primary">{item.n} /</span><h3 className="mb-3 mt-4 text-base">{item.title}</h3><p className="text-xs leading-6 text-muted-foreground">{item.text}</p></div>)}</div></section>
        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border py-7 text-xs text-muted-foreground"><FagentLogo square={false} className="h-auto w-32" /><span>BNB Chain · 无固定收益承诺 · 数字资产存在风险</span><Button asChild variant="ghost" size="sm"><Link to="/rules">合约规则<ArrowUpRight /></Link></Button></footer>
      </main>

      <Dialog open={walletOpen} onOpenChange={setWalletOpen}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>币安 Agent 钱包</DialogTitle><DialogDescription>填写地址查询铸造资格；操作由你的 Agent 钱包确认并发送，无需在网站登录钱包。</DialogDescription></DialogHeader><WalletCheck /><div className="space-y-2 break-all font-mono text-xs text-muted-foreground"><p>CA：<a className="text-primary" href={explorer(FAGENT.token)} target="_blank" rel="noreferrer">{FAGENT.token}</a></p><p>Vault：<a className="text-primary" href={explorer(FAGENT.vault)} target="_blank" rel="noreferrer">{FAGENT.vault}</a></p></div><Button asChild><Link to="/commands" onClick={() => setWalletOpen(false)}>Agent 指令<ArrowUpRight /></Link></Button></DialogContent></Dialog>
      <CommandDialog text={command} onClose={() => setCommand(null)} />

    </div>
  );
}