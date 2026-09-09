import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Section, Panel } from "@/components/site/Section";
import { TokenChip } from "@/components/site/TokenChip";
import { getLegendary } from "@/lib/game.functions";
import { LEGENDARY_RADIUS_M } from "@/lib/geo";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/legendary")({
  head: () => ({
    meta: [
      { title: "The legendary drop — one whole share, one place, one winner" },
      {
        name: "description",
        content:
          "Every day a full SPCXON share sits at one spot for one hour. Announced 24 hours ahead. Be within 25 metres and find the code.",
      },
      { property: "og:title", content: "CATCH legendary drop" },
      {
        property: "og:description",
        content: "One whole share. One hour. One winner. Bring shoes.",
      },
    ],
  }),
  component: Legendary,
});

type Ev = {
  symbol: string;
  amount: number;
  place: string;
  city: string;
  starts_at: string;
  duration_min: number;
  winner_wallet?: string | null;
};

function useCountdown(target?: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!target) return null;
  const ms = new Date(target).getTime() - now;
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0, live: true };
  return {
    d: Math.floor(ms / 86400000),
    h: Math.floor(ms / 3600000) % 24,
    m: Math.floor(ms / 60000) % 60,
    s: Math.floor(ms / 1000) % 60,
    live: false,
  };
}

function Legendary() {
  const t = useT();
  const load = useServerFn(getLegendary);
  const [next, setNext] = useState<Ev | null>(null);
  const [past, setPast] = useState<Ev[]>([]);

  useEffect(() => {
    let alive = true;
    load()
      .then((r: any) => {
        if (!alive || !r?.ok) return;
        setNext(r.next ?? null);
        setPast(r.past ?? []);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [load]);

  const cd = useCountdown(next?.starts_at);

  return (
    <>
      <Section
        eyebrow={t("the legendary", "传奇掉落")}
        title={t("One whole share. One hour. One winner.", "一整股。一小时。一个赢家。")}
        lead={t(
          "Fragments are the everyday loot. Once a month, a full share sits at exactly one spot on earth for sixty minutes.",
          "碎片是日常掉落。每天一次，一整股会在某个确切地点停留六十分钟。",
        )}
        className="mt-10"
      />

      <Section title={next ? t("Next drop", "下一次投放") : t("No drop scheduled", "暂无安排")}>
        <Panel className="mt-6 flex flex-wrap items-center justify-between gap-8">
          {next ? (
            <>
              <div>
                <p className="label-caps text-xs text-muted-foreground">
                  {next.place} · {next.city}
                </p>
                <p className="mt-2 font-display text-3xl">
                  {next.amount} {next.symbol}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {new Date(next.starts_at).toLocaleString()} · {t(`open for ${next.duration_min} minutes`, `开放 ${next.duration_min} 分钟`)}
                </p>
                {cd && (
                  <div className="mt-6 flex gap-3">
                    {cd.live ? (
                      <span className="label-caps rounded-md bg-primary px-5 py-3 text-xs text-primary-foreground">
                        {t("live now", "正在进行")}
                      </span>
                    ) : (
                      ([
                        [t("days", "天"), cd.d],
                        [t("hrs", "时"), cd.h],
                        [t("min", "分"), cd.m],
                        [t("sec", "秒"), cd.s],
                      ] as [string, number][]).map(([l, v]) => (
                        <span
                          key={l}
                          className="w-20 rounded-md border border-border bg-card px-3 py-3 text-center shadow-[var(--shadow-pop)]"
                        >
                          <span className="block font-display text-2xl tabular-nums">
                            {String(v).padStart(2, "0")}
                          </span>
                          <span className="label-caps text-[9px] text-muted-foreground">{l}</span>
                        </span>
                      ))
                    )}
                  </div>
                )}
              </div>
              <TokenChip symbol={next.symbol} size={150} float />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t(
                "The next legendary is announced 24 hours ahead, here and on X.",
                "下一场传奇会提前 24 小时在这里和 X 上公布。",
              )}
            </p>
          )}
        </Panel>
      </Section>

      <Section title={t("The rules", "规则")}>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            [
              t("24 hours notice", "提前 24 小时公布"),
              t(
                "The exact spot and the exact minute go public a day early. Everybody gets the same head start.",
                "确切地点和确切时间提前一天公开，所有人起跑线相同。",
              ),
            ],
            [
              t(`${LEGENDARY_RADIUS_M} metre radius`, `${LEGENDARY_RADIUS_M} 米半径`),
              t(
                "Tighter than a normal signal. You have to be at the spot, not near it.",
                "比普通信号更严格。你必须站在点上，而不是附近。",
              ),
            ],
            [
              t("A physical code", "现场验证码"),
              t(
                "A code is posted at the spot when the hour starts. You type it in. No code, no share — which is why spoofing a legendary is pointless.",
                "整点时验证码会张贴在现场，你需要手动输入。没有码就没有股票——所以伪造定位毫无意义。",
              ),
            ],
            [
              t("First valid claim wins", "首个有效领取者获胜"),
              t(
                "The winner slot is locked the instant a valid claim lands. Everybody else gets a consolation fragment.",
                "第一笔有效领取到达时锁定获胜名额，其他人获得安慰碎片。",
              ),
            ],
          ].map(([h, p]) => (
            <Panel key={h}>
              <h3 className="label-caps text-xs text-primary">{h}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p}</p>
            </Panel>
          ))}
        </div>
      </Section>

      {past.length > 0 && (
        <Section title={t("Previous legendaries", "往期传奇")}>
          <Panel className="mt-6">
            <ul className="divide-y divide-border/60">
              {past.map((e, i) => (
                <li key={i} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                  <TokenChip symbol={e.symbol} size={28} />
                  <span>
                    {e.amount} {e.symbol} — {e.place}, {e.city}
                  </span>
                  <span className="ml-auto font-mono text-xs text-muted-foreground">
                    {e.winner_wallet ?? t("unclaimed", "无人领取")}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </Section>
      )}
    </>
  );
}
