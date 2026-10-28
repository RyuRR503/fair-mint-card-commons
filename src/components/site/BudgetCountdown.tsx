import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { getBudget } from "@/lib/game.functions";

type B = Awaited<ReturnType<typeof getBudget>>;

function fmt(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return (h ? `${h}:` : "") + `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

/** Display only: live site-wide budget with a ticking countdown to the next refill. */
export function BudgetCountdown({ zh }: { zh: boolean }) {
  const [b, setB] = useState<B>(null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    let live = true;
    const load = () => getBudget().then((v) => live && setB(v)).catch(() => {});
    load();
    const poll = setInterval(load, 30_000);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => { live = false; clearInterval(poll); clearInterval(tick); };
  }, []);
  useEffect(() => {
    const f = [b?.hour.freesAtMs, b?.day.freesAtMs].filter((x): x is number => !!x);
    if (f.some((x) => x <= now)) getBudget().then(setB).catch(() => {});
  }, [now, b]);
  if (!b) return null;
  const row = (label: string, s: NonNullable<B>["hour"]) => {
    const left = Math.max(0, s.capUsd - s.spentUsd);
    return (
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-muted-foreground">{label}</span>
        {s.freesAtMs ? (
          <span className="font-mono text-primary">{zh ? "额度用完 · " : "Used up · "}{fmt(s.freesAtMs - now)}{zh ? " 后恢复" : " to refill"}</span>
        ) : (
          <span className="font-mono">{zh ? "剩余" : "Left"} ${left.toFixed(0)} / ${s.capUsd}</span>
        )}
      </div>
    );
  };
  return (
    <div className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold"><Timer className="size-4 text-primary" />{zh ? "全站领取额度" : "Site-wide claim budget"}</h3>
      {row(zh ? "本小时" : "This hour", b.hour)}
      {row(zh ? "24 小时" : "24 hours", b.day)}
      <p className="text-[11px] text-muted-foreground">{zh ? "额度用完时倒计时结束即可再领，每 30 秒自动刷新。" : "When used up, claims reopen as the countdown ends. Refreshes every 30s."}</p>
    </div>
  );
}
