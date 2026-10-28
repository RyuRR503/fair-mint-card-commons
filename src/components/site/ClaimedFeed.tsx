import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getClaimedFeed } from "@/lib/game.functions";
import { TokenChip } from "@/components/site/TokenChip";

type Row = Awaited<ReturnType<typeof getClaimedFeed>>[number];

function ago(iso: string, zh: boolean) {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 60) return zh ? `${m} 分钟前` : `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return zh ? `${h} 小时前` : `${h}h ago`;
  return zh ? `${Math.round(h / 24)} 天前` : `${Math.round(h / 24)}d ago`;
}

/** Network-wide list of on-chain confirmed claims; each row links to BscScan. */
export function ClaimedFeed({ zh }: { zh: boolean }) {
  const load = useServerFn(getClaimedFeed);
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => {
    let alive = true;
    const run = () => load().then((r) => alive && setRows(r)).catch(() => {});
    run();
    const id = window.setInterval(run, 60_000);
    return () => { alive = false; window.clearInterval(id); };
  }, [load]);

  return (
    <div>
      <h2 className="label-caps text-xs text-muted-foreground">{zh ? "全网已领取（链上已到账）" : "Claimed network-wide (on-chain)"}</h2>
      {rows == null ? (
        <p className="mt-3 text-xs text-muted-foreground">{zh ? "加载中…" : "Loading…"}</p>
      ) : rows.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">{zh ? "暂时还没有到账记录。" : "No confirmed claims yet."}</p>
      ) : (
        <ul className="mt-3 max-h-72 divide-y divide-border/60 overflow-y-auto">
          {rows.map((r) => (
            <li key={r.tx}>
              <a href={`https://bscscan.com/tx/${r.tx}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 py-3 text-sm opacity-85 hover:opacity-100">
                <TokenChip symbol={r.symbol} size={28} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate"><span className="font-mono text-primary">{r.wallet}</span> · {r.amount} {r.symbol}</span>
                  <span className="label-caps block truncate text-[10px] text-muted-foreground">{r.city} · {r.place}</span>
                </span>
                <span className="text-right font-mono text-[11px] text-muted-foreground">{ago(r.at, zh)}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
