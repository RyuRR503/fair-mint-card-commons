import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AgentStatus } from "@/components/site/AgentJourney";
import { Section, Panel } from "@/components/site/Section";
import { TokenChip } from "@/components/site/TokenChip";
import { getLegendary } from "@/lib/game.functions";
import { LEGENDARY_RADIUS_M } from "@/lib/geo";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/legendary")({
  head: () => ({
    meta: [
      { title: "CATCH — 传奇活动与限时领取规则" },
      {
        name: "description",
        content:
          "Every day a full SPCXB share sits at one spot for 120 minutes. Announced 24 hours ahead. Planned eligibility requires GPS within 25 metres and an Agent Wallet; live claims are pending.",
      },
      { property: "og:title", content: "CATCH legendary drop" },
      {
        property: "og:description",
        content: "One whole share. One place. One winner. Agent-only claims are planned; live integration is pending.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
      <Section hero
        eyebrow={t("the legendary", "传奇掉落")}
        title={t("Legendary event: one full share", "传奇活动：一整股限时领取")}
        lead={t(
          "Under the planned rules, a daily legendary event offers one full SPCXB share at a designated location for 120 minutes. Live Agent claims are not available yet.",
          "按计划规则，传奇活动每日在指定地点投放一整股 SPCXB，开放 120 分钟。真实 Agent 领取功能尚未开放。",

        )}
        className="mt-10"
      />

      <section className="mx-auto max-w-6xl px-5 py-6"><AgentStatus /></section>

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
                "活动地点与开始时间提前 24 小时公开，便于用户安排参与。",
              ),
            ],
            [
              t(`${LEGENDARY_RADIUS_M} metre radius`, `${LEGENDARY_RADIUS_M} 米半径`),
              t(
                "Tighter than a normal signal. You have to be at the spot, not near it.",
                "传奇活动采用更严格的距离要求，用户须进入指定点位的验证范围。",
              ),
            ],
            [
              t("Stricter GPS check", "更严格的定位校验"),
              t(
                "No venue code is needed. After stricter GPS checks, the planned flow issues an AI command for the Agent Wallet.",
                "无需现场验证码。接入完成后，用户抵达现场并通过定位验证，即可获取一次性指令，由 Agent 钱包提交领取。",
              ),
            ],
            [
              t("First valid Agent claim wins", "首个有效 Agent 领取者获胜"),
              t(
                "Planned rule: the first valid Agent Wallet claim wins. Arriving alone does not reserve a prize. Live Agent claims are not connected.",
                "计划规则：首笔有效 Agent 钱包领取获胜，单纯到场不代表预留奖品；真实领取尚未接通。",
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
