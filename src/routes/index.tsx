import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentJourney, AgentStatus } from "@/components/site/AgentJourney";
import cityGold from "@/assets/catch-city-gold.jpg";
import { CitySignals } from "@/components/site/CitySignals";
import { Reveal } from "@/components/site/Reveal";
import { Section, Panel } from "@/components/site/Section";
import { TokenChip } from "@/components/site/TokenChip";
import { type MapPin } from "@/components/site/WorldMap";
import { LiveMap } from "@/components/site/LiveMap";
import { WaitlistForm } from "@/components/site/WaitlistForm";
import { getMapSummary } from "@/lib/map.functions";
import { useMapPoints } from "@/lib/useMapPoints";

import { TOKENS, RARITY_LABEL, rarityVar, CHAIN } from "@/lib/tokens";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CATCH — catch the fun, catch real-world stock fragments" },
      {
        name: "description",
        content:
          "CATCH combines real-world stock hunting with a planned Binance Agentic Wallet claim flow: phone GPS, AI command, Agent-only claims.",
      },
      { property: "og:title", content: "CATCH — catch the fun, catch the market" },
      {
        property: "og:description",
        content:
          "Walk to real stock locations. Preview GPS verification, one-time AI commands, and Agent-only claims on BSC. Live Agent integration is pending.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },

    ],
  }),
  loader: () => getMapSummary(),
  errorComponent: () => (
    <div className="mx-auto max-w-3xl px-5 py-32 text-center text-muted-foreground">
      信号板暂时读不出来，请稍后刷新。
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-5 py-32 text-center text-muted-foreground">页面不存在。</div>
  ),
  component: Home,
});

function Home() {
  const t = useT();
  const summary = Route.useLoaderData();
  const points = useMapPoints();
  const TOTAL_SPAWNS = summary.totalSpawns;
  const TOTAL_CITIES = summary.totalCities;

  const pins: MapPin[] = useMemo(
    () =>
      summary.pins.map((c) => ({
        key: c.key,
        lat: c.lat,
        lng: c.lng,
        label: t(c.name, c.nameZh),
        count: c.count,
        symbols: c.symbols,
        rarity: c.rarity,
      })),
    [summary.pins, t],
  );

  return (
    <>
      {/* ---------------------------------------------------------- hero */}
      <section className="agent-hero relative isolate overflow-hidden px-5 pb-6 pt-6 sm:pt-8">
        <img src={cityGold} alt="" width={1920} height={1024} fetchPriority="high" className="city-cover absolute inset-0 -z-20 size-full object-cover object-[64%_center] sm:object-center" />
        <div aria-hidden className="city-hero-shade absolute inset-0 -z-10" />
        <CitySignals />
        <div className="mx-auto max-w-6xl">
          <div className="reveal-focus flex items-center justify-between gap-6 border-b border-border pb-5">
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="size-2 animate-pulse rounded-full bg-primary" />
              {CHAIN.name} · {t("Map available · Agent integration pending", "地图可浏览 · Agent 接入中")}
            </span>
            <span className="readout hidden sm:block">
              {t("HUMAN GPS × AGENT WALLET", "真人 GPS × Agent 钱包")}
            </span>
          </div>

          <div className="relative py-10 sm:py-12 lg:py-14">
            <div className="reveal-focus min-w-0 max-w-2xl">
              <p className="label-caps text-xs text-primary">
                {t("Real-world stock fragments × Binance Agentic Wallet", "真实世界美股碎片 × 币安 Agent AI 钱包")}
              </p>
              <p
                aria-hidden
                className="agent-wordmark font-poster mt-5 select-none text-[6.5rem] sm:text-[10rem] lg:text-[12rem]"
              >
                CATCH.
              </p>
              <h1 className="mt-5 max-w-xl text-balance text-[1.75rem] leading-[1.3] sm:text-[2.5rem]">
                {t("You explore. Your Agent claims.", "你走进城市，Agent 抓住市场。")}
              </h1>
              <p className="mt-6 max-w-lg border-l-2 border-primary pl-5 text-sm leading-[1.9] text-foreground/75 sm:text-base">
                {t(
                  "Walk to a real venue with your phone. In the planned flow, GPS checks unlock a one-time command for your AI, and only its Agent Wallet can claim the stock fragment.",
                  "真人带手机到店，定位通过后取得一次性指令；把指令交给 AI，由币安 Agent 钱包领取美股碎片。普通钱包不能领，所有稀有度都一样。",
                )}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="btn-arrow agent-cta h-12 rounded-sm px-7 font-bold">
                  <Link to="/app">{t("Explore the Agent map", "打开 Agent 地图")} <ArrowUpRight className="arrow" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 rounded-sm border-foreground/25 bg-background/35 px-7">
                  <Link to="/how-it-works">{t("How it works", "玩法说明")}</Link>
                </Button>
              </div>
            </div>


          </div>

          {/* big numbers */}
          <div className="hero-stats grid grid-cols-3 border-t border-border">
            {[
              { v: String(TOTAL_SPAWNS), l: t("Live drops", "永久掉落点") },
              { v: String(TOTAL_CITIES), l: t("Cities", "座城市") },
              { v: String(TOKENS.length), l: t("Stocks", "种美股代币") },
            ].map((s, i) => (
              <div key={s.l} className={`py-6 sm:py-8 ${i ? "border-l border-border pl-4 sm:pl-8" : ""}`}>
                <p className={`font-poster text-5xl sm:text-7xl ${i === 0 ? "text-primary" : ""}`}>{s.v}</p>
                <p className="mt-2 text-xs text-muted-foreground sm:text-sm">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5"><AgentStatus /></div>

      {/* ------------------------------------------------------ ticker */}
      <div className="stock-ticker overflow-hidden border-b border-border py-5" aria-hidden>
        <div className="marquee-track gap-12">
          {[...TOKENS, ...TOKENS].map((tk, i) => (
            <span key={i} className="flex shrink-0 items-center gap-3 pr-12">
              <TokenChip symbol={tk.symbol} size={28} />
              <span className="font-poster text-3xl">{tk.symbol}</span>
              <span className="text-sm text-muted-foreground">{t(tk.venue, tk.venueZh)}</span>
              <span className="text-primary">✦</span>
            </span>
          ))}
        </div>
      </div>


      <Reveal as="section" className="mx-auto max-w-6xl px-5 py-12 sm:py-16"><AgentJourney /></Reveal>

      {/* ---------------------------------------------------------- map */}
      <section className="mx-auto mt-10 max-w-6xl px-5">
        <div className="mb-8 flex flex-col justify-between gap-5 border-b border-border pb-6 md:flex-row md:items-end">
          <div>
            <span className="label-caps text-[10px] text-primary">Live map</span>
            <h2 className="mt-3 text-[1.75rem] sm:text-4xl">
              {t("Where the signals are right now", "此刻信号在哪里")}
            </h2>
          </div>
          <p className="readout">
            {t(
              `${TOTAL_CITIES} CITIES / ${TOTAL_SPAWNS} SPAWNS / SYNCED`,
              `${TOTAL_CITIES} 城 / ${TOTAL_SPAWNS} 点 / 已同步`,
            )}
          </p>
        </div>

        <div className="ink-frame relative overflow-hidden rounded-md">
          <div className="overflow-hidden rounded-md">
            <LiveMap pins={pins} points={points} />
          </div>
        </div>
      </section>


      {/* ------------------------------------------------------ what is this */}
      <Section
        eyebrow={t("what this is", "这是什么")}
        title={t("A market with coordinates.", "一个有坐标的市场。")}
      >
        <div className="hair-grid mt-10 grid md:grid-cols-3">
          {[
            {
              n: "01 / REAL",
              h: t("Real assets.", "真实资产。"),
              p: t(
                `Not points and not a picture of a stock. Tokenized shares as BEP-20s on ${CHAIN.name} — NVDAB, AAPLB, TSLAB — paid into your Agent Wallet after the integration is connected.`,
                `不是积分，也不是股票截图。而是 ${CHAIN.name} 上的 BEP-20 代币化股票——NVDAB、AAPLB、TSLAB——接通后由 Agent 钱包领取并持有。`,
              ),
            },
            {
              n: "02 / PLACE",
              h: t("Real coordinates.", "真实坐标。"),
              p: t(
                "Signals sit in front of places that actually match the asset. An Apple Store drops AAPLB, an internet café drops NVDAB, a Tesla supercharger drops TSLAB.",
                "信号停在与资产真正匹配的场所门口：Apple 直营店掉 AAPLB，网吧掉 NVDAB，特斯拉超充站掉 TSLAB。",

              ),
            },
            {
              n: "03 / EFFORT",
              h: t("Real distance.", "真实距离。"),
              p: t(
                "You have to physically get there. GPS fix, motion sensors, device and travel-speed checks. Spoofers get a polite refusal and zero shares.",
                "你必须真的走过去。定位采样、运动传感器、设备与移动速度校验。伪造定位的只会收到一句礼貌的拒绝和 0 股。",
              ),
            },
          ].map((c) => (
            <div
              key={c.n}
              className="group bg-background p-8 transition-colors duration-500 hover:bg-primary/10 sm:p-10"
            >
              <span className="label-caps text-[10px] text-primary">{c.n}</span>
              <span className="mt-7 block h-0.5 w-10 bg-primary/60" />
              <h3 className="font-latin mt-7 text-2xl tracking-tight transition-colors group-hover:text-foreground">
                {c.h}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground transition-colors group-hover:text-foreground/75">
                {c.p}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------ how it works */}
      <Section
        eyebrow={t("how it works", "怎么玩")}
        title={t("Human presence. AI command. Agent claim.", "真人到场，AI 接令，Agent 领取。")}
        lead={t(
          "All four rarities follow the same Agent-only claim rule. Live integration is pending.",
          "普通、稀有、史诗、传奇，全部使用同一条 Agent 专属领取规则；真实接入尚未完成。",
        )}
      >
        <div className="mt-10 grid gap-px bg-border md:grid-cols-3">
          {[
            {
              n: "01",
              h: t("Walk to a real venue.", "真人到店。"),
              p: t(
                "Use the map to find a venue, then take your phone there for GPS verification.",
                "先在地图找到真实点位，再带手机到现场完成定位校验。",
              ),
            },
            {
              n: "02",
              h: t("Give your AI the command.", "把指令交给 AI。"),
              p: t(
                "After location and rule checks pass, a one-time claim command will be valid for 15 minutes.",
                "接通后，定位与规则校验通过才会发出一次性指令，有效期 15 分钟。",
              ),
            },
            {
              n: "03",
              h: t("Agent claims on BSC.", "Agent 上链领取。"),
              p: t(
                `The AI uses its Agent Wallet to submit the claim on ${CHAIN.name}. Ordinary wallets are excluded.`,
                `AI 使用 Agent 钱包在 ${CHAIN.name} 上提交领取；普通钱包不具备领取资格。`,
              ),
            },
          ].map((s) => (
            <div key={s.n} className="group bg-card p-8 transition-colors duration-500 hover:bg-secondary sm:p-10">
              <span className="font-poster outline-text block text-8xl">
                {s.n}
              </span>
              <h3 className="mt-6 text-xl transition-colors group-hover:text-primary">{s.h}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.p}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link
            to="/how-it-works"
            className="label-caps text-[11px] text-accent underline underline-offset-8"
          >
            {t("The long version →", "查看完整规则 →")}
          </Link>
        </div>
      </Section>


      {/* ------------------------------------------------------- spawn table */}
      <Section
        eyebrow={t("signal table", "信号表")}
        title={t("One drop rule per token, worldwide.", "每个代币一条掉落规则，全球通用。")}
      >
        <div className="mt-8 divide-y divide-border border-y border-border sm:hidden">
          {TOKENS.map((tk) => (
            <div key={tk.symbol} className="flex items-start gap-3 py-5">
              <TokenChip symbol={tk.symbol} size={36} />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm font-semibold">{tk.symbol}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t(tk.venue, tk.venueZh)}</p>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-xs" style={{ color: rarityVar(tk.rarity) }}>{RARITY_LABEL[tk.rarity]}</span>
                <p className="mt-2 font-mono text-xs">{tk.rarity === "legendary" ? t("1 full share", "1 整股") : tk.fragment}</p>
              </div>
            </div>
          ))}
        </div>
        <Panel className="mt-8 hidden overflow-x-auto p-0 sm:block sm:p-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="label-caps border-b border-border text-[10px] text-muted-foreground">
                <th className="px-6 py-4">{t("Stock", "股票")}</th>
                <th className="px-6 py-4">{t("Appears at", "出现地点")}</th>
                <th className="px-6 py-4">{t("Rarity", "稀有度")}</th>
                <th className="px-6 py-4">{t("Fragment", "碎片")}</th>
              </tr>
            </thead>
            <tbody>
              {TOKENS.map((tk) => (
                <tr key={tk.symbol} className="border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/60">
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-3">
                      <TokenChip symbol={tk.symbol} size={34} />
                      <span className="label-caps text-xs">{tk.symbol}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {t(tk.venue, tk.venueZh)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="label-caps rounded-full px-3 py-1 text-[10px] text-primary-foreground"
                      style={{ background: rarityVar(tk.rarity) }}
                    >
                      {RARITY_LABEL[tk.rarity]}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">
                    {tk.rarity === "legendary" ? t("1 full share", "1 整股") : tk.fragment}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <p className="mt-4 text-sm text-muted-foreground">
          {t(
            `${TOTAL_SPAWNS} permanent drops across ${TOTAL_CITIES} cities. Catch one and it goes on cooldown, then respawns by itself — the map is never empty. A signal only appears if the vault can pay it — `,
            `${TOTAL_CITIES} 座城市共 ${TOTAL_SPAWNS} 个固定掉落点。被捡走后进入冷却，时间一到自动复活，地图永远不会空。只有金库付得起，信号才会出现——`,
          )}
          <Link to="/proof" className="text-primary underline underline-offset-4">
            {t("count the vault yourself", "自己去数金库")}
          </Link>
          .
        </p>
      </Section>

      {/* --------------------------------------------------------- legendary */}
      <Section
        eyebrow={t("legendary", "传奇")}
        title={t("One share. One place. One winner.", "一整股。一个地点。一个人。")}
      >
        <Panel className="mt-8 flex flex-wrap items-center justify-between gap-8">
          <div className="max-w-xl">
            <p className="text-base leading-relaxed text-muted-foreground">
              {t(
                "Every day a whole SPCXB share sits at one spot for 120 minutes, announced 24 hours ahead with a live countdown. Planned eligibility requires on-site GPS and an Agent Wallet; the first valid Agent claim wins. Live claims are pending.",
                "每天一次，一整股 SPCXB 会在某个地点停留 120 分钟，提前 24 小时公布并附实时倒计时。真人进入 25 米范围通过定位后，也需交由 Agent 钱包领取；规则为首个有效 Agent 领取者获胜。真实领取待接通。",
              )}
            </p>
            <Link
              to="/legendary"
              className="label-caps mt-6 inline-block rounded-md border border-accent/60 bg-accent/15 px-6 py-3 text-[11px] text-accent-foreground"
            >
              {t("See the countdown", "查看倒计时")}
            </Link>
          </div>
          <TokenChip symbol="SPCXB" size={140} float />
        </Panel>
      </Section>

      {/* --------------------------------------------------------- catchdex */}
      <Section
        eyebrow={t("the catchdex", "图鉴")}
        title={t(`Collect all ${TOKENS.length}.`, `集齐全部 ${TOKENS.length} 枚。`)}
      >
        <Panel className="mt-8">
          <div className="flex flex-wrap gap-4">
            {TOKENS.map((tk) => (
              <span key={tk.symbol} className="flex w-16 flex-col items-center gap-2 transition-transform duration-500 hover:-translate-y-1.5">
                <TokenChip symbol={tk.symbol} size={52} />
                <span className="label-caps text-[9px] text-muted-foreground">{tk.symbol}</span>
              </span>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            {t(
              `Every token maps to a kind of place you can actually walk into — bank branch, internet café, computer mall, phone shop, supercharger, Apple Store, science museum. Fragments are paid out of the vault on ${CHAIN.short}.`,
              `每一枚代币都对应一类你真的能走进去的场所——银行网点、网吧、电脑城、手机店、超充站、Apple 直营店、科技馆。碎片从 ${CHAIN.short} 上的金库发出。`,

            )}
          </p>
        </Panel>
      </Section>

      {/* --------------------------------------------------------- waitlist */}
      <Section
        eyebrow={t("early access", "抢先体验")}
        title={t("Tell us where to drop next.", "告诉我们下一站投放在哪。")}
      >
        <Panel className="mt-8">
          <WaitlistForm />
        </Panel>
      </Section>
    </>
  );
}
