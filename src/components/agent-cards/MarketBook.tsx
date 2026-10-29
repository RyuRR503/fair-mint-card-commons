import { useMemo, useState } from "react";
import { ChevronDown, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentCardArt } from "@/components/agent-cards/AgentCardArt";
import { batchForCard, CARD_RULES, type PreviewCard } from "@/lib/agent-card-model";

type View = "overview" | "bids" | "history";
const views: { key: View; label: string }[] = [{ key: "overview", label: "概览" }, { key: "bids", label: "我的求购" }, { key: "history", label: "成交记录" }];

// 示例数据，仅用于预览
const MOCK_LEVELS = [
  { price: 0.0022, size: 14, n: 3 }, { price: 0.0025, size: 9, n: 2 }, { price: 0.0029, size: 21, n: 4 }, { price: 0.0034, size: 6, n: 1 },
];
const MOCK_TRADES = [
  { id: 8812, price: 0.0024, time: "10-29 15:48", from: "0x8a…21f3", to: "0x3c…9e10" },
  { id: 627, price: 0.0026, time: "10-29 15:12", from: "0x51…0bd2", to: "0x8a…21f3" },
  { id: 4410, price: 0.0023, time: "10-29 14:37", from: "0xe9…77a1", to: "0x12…c4a8" },
  { id: 1884, price: 0.0027, time: "10-29 13:05", from: "0x0f…3e66", to: "0x51…0bd2" },
];
const fmt = (n: number) => n.toFixed(4);

export function MarketBook({ listings, onBuy, onBid }: { listings: PreviewCard[]; onBuy: (c: PreviewCard) => void; onBid: () => void }) {
  const [view, setView] = useState<View>("overview");
  const [open, setOpen] = useState<number | null>(null);
  const levels = useMemo(() => {
    const map = new Map<number, PreviewCard[]>();
    listings.forEach(c => map.set(c.price, [...(map.get(c.price) ?? []), c]));
    const real = [...map.entries()].map(([price, cards]) => ({ price, size: cards.length, n: cards.length, cards }));
    const all = [...real, ...MOCK_LEVELS.filter(m => !map.has(m.price)).map(m => ({ ...m, cards: [] as PreviewCard[] }))].sort((a, b) => a.price - b.price);
    let total = 0;
    return all.map(l => ({ ...l, total: (total += l.size) }));
  }, [listings]);
  const best = levels[0];
  const bestCard = best?.cards[0] ?? listings[0];
  const feePct = CARD_RULES.marketFeeBps ? CARD_RULES.marketFeeBps / 100 : 1;

  return (
    <div>
      <div className="mb-6 flex gap-6 border-b border-border">{views.map(v => <button key={v.key} type="button" onClick={() => setView(v.key)} className={`-mb-px border-b px-1 pb-3 text-sm ${view === v.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{v.label}</button>)}</div>

      {view === "overview" && <>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div><h3 className="text-2xl">FAGENT 卡牌</h3><p className="mt-1 text-xs text-muted-foreground">卖家挂单，买家按价格直接成交 · 示例数据</p></div>
          <Button onClick={onBid}><Plus />发布求购</Button>
        </div>
        <div className="grid grid-cols-2 gap-6 border-y border-border py-6 md:grid-cols-4">
          {[
            { label: "最低售价", value: best ? fmt(best.price) : "—", sub: `${levels.reduce((s, l) => s + l.n, 0)} 个挂单`, gold: true },
            { label: "最近成交", value: fmt(MOCK_TRADES[0]!.price), sub: MOCK_TRADES[0]!.time },
            { label: "累计成交额", value: "38.6420", sub: "14,207 张已成交" },
            { label: "求购托管", value: "2.1150", sub: "在挂求购单中" },
          ].map(s => <div key={s.label}><p className="text-xs text-muted-foreground">{s.label}</p><p className={`mt-2 font-mono text-2xl ${s.gold ? "text-primary" : ""}`}>{s.value} <span className="text-xs text-muted-foreground">BNB</span></p><p className="mt-1 text-xs text-muted-foreground">{s.sub}</p></div>)}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="mb-4 flex items-end justify-between"><div><h4 className="text-lg">挂单簿</h4><p className="text-xs text-muted-foreground">卖单 · 每张 BNB 价格 · 展开价格档位选择卡牌</p></div><span className="text-xs text-primary">{levels.length} 个档位</span></div>
            <div className="grid grid-cols-[1fr_70px_80px_60px] border-b border-border pb-2 text-xs text-muted-foreground"><span>价格 (BNB)</span><span className="text-right">数量</span><span className="text-right">累计</span><span className="text-right">挂单</span></div>
            {levels.map((l, i) => <div key={l.price} className="border-b border-border">
              <button type="button" onClick={() => setOpen(open === l.price ? null : l.price)} className="grid w-full grid-cols-[1fr_70px_80px_60px] items-center py-3 text-sm hover:bg-muted/30">
                <span className="flex items-center gap-2 font-mono text-primary"><ChevronDown className={`size-3.5 transition-transform ${open === l.price ? "rotate-180" : ""}`} />{fmt(l.price)}{i === 0 && <span className="border border-primary px-1.5 text-[10px]">最低</span>}</span>
                <span className="text-right font-mono">{l.size}</span><span className="text-right font-mono">{l.total}</span><span className="text-right font-mono">{l.n}</span>
              </button>
              {open === l.price && <div className="grid gap-2 pb-4 sm:grid-cols-2">
                {l.cards.length === 0 && <p className="col-span-full py-2 text-xs text-muted-foreground">示例档位，暂无可预览的卡牌</p>}
                {l.cards.map(c => <div key={c.id} className="flex items-center gap-3 border border-border p-2">
                  <div className="w-12 shrink-0"><AgentCardArt id={c.id} compact /></div>
                  <div className="min-w-0 flex-1"><p className="font-mono text-sm">#{String(c.id).padStart(6, "0")}</p><p className="text-[10px] text-muted-foreground">第 {String(batchForCard(c.id)).padStart(2, "0")} 批 · {c.closed ? "可兑换" : "批次未售满"}</p></div>
                  <Button size="sm" variant="outline" onClick={() => onBuy(c)}>买入</Button>
                </div>)}
              </div>}
            </div>)}
          </div>

          <aside className="h-fit border border-border p-5">
            <h4 className="text-lg">快速买入</h4><p className="text-xs text-muted-foreground">按当前最低价成交</p>
            <p className="mt-6 text-xs text-muted-foreground">最低可买价格</p>
            <p className="mt-1 font-mono text-3xl text-primary">{best ? fmt(best.price) : "—"} <span className="text-sm text-muted-foreground">BNB</span></p>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">卡牌</span><span className="font-mono">{bestCard ? `#${String(bestCard.id).padStart(6, "0")}` : "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">成交手续费</span><span>{feePct}%（卖家承担）</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">成交前未领分红</span><span>归卖家</span></div>
            </div>
            <Button className="mt-6 w-full" disabled={!bestCard} onClick={() => bestCard && onBuy(bestCard)}><ShoppingBag />按最低价买入</Button>
          </aside>
        </div>
      </>}

      {view === "bids" && <div className="py-16 text-center"><p className="text-muted-foreground">你还没有求购单</p><Button className="mt-4" onClick={onBid}><Plus />发布求购</Button></div>}

      {view === "history" && <div>
        <div className="grid grid-cols-[90px_1fr_1fr_1fr_110px] border-b border-border pb-2 text-xs text-muted-foreground"><span>卡牌</span><span>价格</span><span>卖家</span><span>买家</span><span className="text-right">时间</span></div>
        {MOCK_TRADES.map(t => <div key={t.id + t.time} className="grid grid-cols-[90px_1fr_1fr_1fr_110px] border-b border-border py-3 text-sm"><span className="font-mono">#{String(t.id).padStart(6, "0")}</span><span className="font-mono text-primary">{fmt(t.price)}</span><span className="font-mono text-muted-foreground">{t.from}</span><span className="font-mono text-muted-foreground">{t.to}</span><span className="text-right text-xs text-muted-foreground">{t.time}</span></div>)}
        <p className="mt-4 text-xs text-muted-foreground">示例成交记录</p>
      </div>}
    </div>
  );
}
