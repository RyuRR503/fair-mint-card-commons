import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUpRight, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentJourney, AgentStatus } from "@/components/site/AgentJourney";
import cityGold from "@/assets/catch-city-gold.jpg";
import { CityMarketScene } from "@/components/site/CityMarketScene";
import { CitySignals } from "@/components/site/CitySignals";
import { CatchLettering } from "@/components/site/CatchLettering";
import { Section, Panel } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
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
      { title: "CATCH — 真实地点美股碎片，币安 Agent 钱包领取" },
      {
        name: "description",
        content:
          "CATCH 将代币化美股碎片与真实地点连接。规划流程包括定位验证、一次性指令与币安 Agent 钱包链上领取；Agent 领取功能接入中。",
      },
      {
        property: "og:title",
        content: "CATCH — 在真实地点发现代币化美股，由币安 Agent 钱包完成链上领取",
      },
      {
        property: "og:description",
        content:
          "浏览真实点位，了解定位验证与 Agent 专属领取规则。所有稀有度均仅限 Agent 钱包领取，真实领取尚未开放。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...SITE_PREVIEW_META,

    ],
  }),
  loader: () => getMapSummary(),
  errorComponent: () => (
    <div className="mx-auto max-w-3xl px-5 py-32 text-center text-muted-foreground">
      点位信息暂时无法加载，请稍后刷新。
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-5 py-32 text-center text-muted-foreground">页面不存在。</div>
  ),
  component: Home,
});

function Home() {
  const t = useT();
  const [motionPaused, setMotionPaused] = useState(false);
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
    <div className="home-continuum" data-motion-paused={motionPaused}>
      {/* ---------------------------------------------------------- hero */}
      <div className="city-scroll-stage" aria-hidden="true">
        <div className="city-scroll-backdrop">
        <div className="city-depth city-depth--far" data-city-depth="far" aria-hidden="true">
          <img src={cityGold} alt="" width={1920} height={1024} fetchPriority="high" className="city-cover size-full object-cover object-[64%_center] sm:object-center" />
        </div>
        <div aria-hidden className="city-hero-shade absolute inset-0" />
        <CitySignals />
        </div>
      </div>
      <CityMarketScene />
      <section className="agent-hero relative overflow-hidden px-5 pb-6 pt-6 sm:pt-8">
        <div className="mx-auto max-w-6xl">
          <div className="hero-topline flex items-center justify-between gap-6 border-b border-border pb-5">
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              {CHAIN.name} · {t("Map available · Agent integration pending", "地图已开放 · Agent 领取功能接入中")}
            </span>
            <span className="readout hidden sm:block">
              {t("LOCATION VERIFICATION × AGENT WALLET", "定位验证 × Agent 钱包")}
            </span>
          </div>

          <div className="hero-composition relative py-10 sm:py-12 lg:py-14">
            <div className="hero-copy min-w-0 max-w-2xl">
              <p className="hero-kicker label-caps text-xs text-primary">
                {t("Tokenized U.S. stock fragments × Binance Agentic Wallet", "代币化美股碎片 × 币安 Agent 钱包")}
              </p>
              <div className="hero-lettering"><CatchLettering className="mt-6 w-[320px] max-w-full sm:w-[520px]" /></div>
              <h1 className="hero-heading mt-5 max-w-xl text-balance text-[1.75rem] leading-[1.3] sm:text-[2.5rem]">
                {t("Discover tokenized U.S. stocks at real locations.", "在真实地点，发现代币化美股。")}
              </h1>
              <p className="hero-description mt-6 max-w-lg border-l border-primary/50 pl-5 text-sm leading-[1.9] text-foreground/75 sm:text-base">
                {t(
                  "CATCH connects tokenized U.S. stock fragments with real locations. In the planned flow, verified visitors receive a single-use command for a Binance Agent Wallet to submit an on-chain claim. All rarities are Agent-only.",
                  "CATCH 将代币化美股碎片与真实地点连接。用户抵达指定地点并通过定位验证后，可获取一次性领取指令，由币安 Agent 钱包完成链上领取。所有稀有度的碎片均仅限 Agent 钱包领取。",
                )}
              </p>
              <div className="hero-actions mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="btn-arrow agent-cta h-12 rounded-sm px-7 font-bold">
                  <Link to="/app">{t("Browse the map", "浏览地图")} <ArrowUpRight className="arrow" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 rounded-sm border-foreground/25 bg-background/35 px-7">
                  <Link to="/how-it-works">{t("Claim rules", "了解领取规则")}</Link>
                </Button>
              </div>
            </div>


          </div>

          <div className="hero-scene-controls flex items-center justify-between gap-4">
            <a href="#agent-journey" className="hero-scroll-link flex items-center gap-3 text-xs text-muted-foreground"><ArrowDown className="size-4 text-primary" />{t("Claim process", "领取流程")}<span className="font-mono text-primary">01 / 03</span></a>
            <Button variant="ghost" size="icon" className="scene-playback size-9 text-muted-foreground" onClick={() => setMotionPaused((value) => !value)} aria-pressed={motionPaused} aria-label={t(motionPaused ? "Resume animation" : "Pause animation", motionPaused ? "继续动效" : "暂停动效")} title={t(motionPaused ? "Resume animation" : "Pause animation", motionPaused ? "继续动效" : "暂停动效")}>{motionPaused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}</Button>
          </div>

          {/* big numbers */}
          <div className="hero-stats grid grid-cols-3 border-t border-border">
            {[
              { v: String(TOTAL_SPAWNS), l: t("Fixed locations", "固定点位") },
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


      <section id="agent-journey" className="city-handoff mx-auto max-w-6xl px-5 py-12 sm:py-16" data-scroll-shot="journey"><div className="journey-sticky"><Reveal variant="heading"><AgentJourney /></Reveal><div className="journey-scroll-track" aria-hidden="true"><span /></div></div></section>

      {/* ---------------------------------------------------------- map */}
      <section className="city-map-arrival mx-auto mt-10 max-w-6xl px-5" data-scroll-shot="map">
        <Reveal variant="heading" className="mb-8 flex flex-col justify-between gap-5 border-b border-border pb-6 md:flex-row md:items-end">
          <div>
            <span className="label-caps text-[10px] text-primary">Live map</span>
            <h2 className="mt-3 text-[1.75rem] sm:text-4xl">
              {t("Location coverage", "点位分布与覆盖城市")}
            </h2>
          </div>
          <p className="readout">
            {t(
              `${TOTAL_CITIES} CITIES / ${TOTAL_SPAWNS} SPAWNS / SYNCED`,
              `${TOTAL_CITIES} 城 / ${TOTAL_SPAWNS} 点 / 已同步`,
            )}
          </p>
        </Reveal>

        <div className="ink-frame relative overflow-hidden rounded-md">
          <div className="overflow-hidden rounded-md">
            <LiveMap pins={pins} points={points} />
          </div>
        </div>
      </section>


      {/* ------------------------------------------------------ what is this */}
      <Section
        eyebrow={t("about CATCH", "项目介绍")}
        title={t("Real locations. Tokenized assets.", "连接真实地点与代币化资产。")}
      >
        <div className="hair-grid mt-10 grid md:grid-cols-3">
          {[
            {
              n: "01 / REAL",
              h: t("Tokenized U.S. stocks", "代币化美股"),
              p: t(
                `Rewards are BEP-20 tokenized U.S. stock fragments on ${CHAIN.name}, including NVDAB, AAPLB and TSLAB, rather than points. Once integration is complete, eligible Agent Wallets can claim and hold them.`,
                `奖励采用 ${CHAIN.name} 上的 BEP-20 代币化美股碎片，包括 NVDAB、AAPLB、TSLAB，而非平台积分。领取功能接入后，由符合资格的 Agent 钱包领取并持有。`,
              ),
            },
            {
              n: "02 / PLACE",
              h: t("Asset-related locations", "与资产相关的地点"),
              p: t(
                "Each token is associated with relevant venues: AAPLB at Apple Stores, NVDAB at internet cafés, and TSLAB at Tesla superchargers.",
                "各类代币对应与其相关的真实场所：Apple 直营店对应 AAPLB，网吧对应 NVDAB，特斯拉超充站对应 TSLAB。",

              ),
            },
            {
              n: "03 / EFFORT",
              h: t("On-site verification", "现场位置验证"),
              p: t(
                "Users must be physically present. Verification considers location samples, motion data, device information and travel speed; requests that fail the checks are rejected.",
                "用户须抵达指定地点。验证结合定位采样、运动数据、设备信息与移动速度；未通过校验的请求无法领取。",
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
        eyebrow={t("claim process", "领取流程")}
        title={t("Location verification. Command. Agent claim.", "定位验证、一次性指令与 Agent 领取。")}
        lead={t(
          "All four rarities follow the same Agent-only claim rule. Live integration is pending.",
          "普通、稀有、史诗与传奇均适用 Agent 专属领取规则。以下为规划流程，真实领取功能尚未开放。",
        )}
      >
        <div className="mt-10 grid gap-px bg-border md:grid-cols-3">
          {[
            {
              n: "01",
              h: t("Arrive at the designated location.", "抵达指定地点。"),
              p: t(
                "Locate a designated venue on the map and arrive on-site to begin location verification.",
                "通过地图查找指定点位，抵达现场后启动定位验证。",
              ),
            },
            {
              n: "02",
              h: t("Complete location verification.", "完成定位验证。"),
              p: t(
                "Once integration is complete, passing location and eligibility checks will provide a single-use command valid for 15 minutes. Send it to your AI within that period.",
                "接入完成后，通过定位与规则校验即可获取一次性领取指令，并在 15 分钟有效期内发送给 AI。",
              ),
            },
            {
              n: "03",
              h: t("Claim through an Agent Wallet.", "Agent 钱包领取。"),
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
            {t("View all claim rules →", "查看完整规则 →")}
          </Link>
        </div>
      </Section>


      {/* ------------------------------------------------------- spawn table */}
      <Section
        eyebrow={t("token rules", "代币规则")}
        title={t("Consistent claim amounts for each token.", "同类代币，统一领取数量。")}
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
            `${TOTAL_SPAWNS} fixed locations across ${TOTAL_CITIES} cities. Under the claim rules, locations reopen after a cooldown, subject to sufficient vault inventory. `,
            `覆盖 ${TOTAL_CITIES} 座城市，共 ${TOTAL_SPAWNS} 个固定点位。按领取规则，点位在领取后进入冷却，冷却结束且金库库存充足时重新开放。`,
          )}
          <Link to="/proof" className="text-primary underline underline-offset-4">
            {t("View vault balances and on-chain records", "查看金库余额与链上记录")}
          </Link>
          .
        </p>
      </Section>

      {/* --------------------------------------------------------- legendary */}
      <Section
        eyebrow={t("legendary", "传奇")}
        title={t("Legendary event: one full share.", "传奇活动：一整股限时领取。")}
      >
        <Panel className="mt-8 flex flex-wrap items-center justify-between gap-8">
          <div className="max-w-xl">
            <p className="text-base leading-relaxed text-muted-foreground">
              {t(
                "Every day a whole SPCXB share sits at one spot for 120 minutes, announced 24 hours ahead with a live countdown. Planned eligibility requires on-site GPS and an Agent Wallet; the first valid Agent claim wins. Live claims are pending.",
                "按计划规则，传奇活动每日投放一整股 SPCXB，指定点位开放 120 分钟，并提前 24 小时公布。用户须进入 25 米范围并通过定位验证，由 Agent 钱包提交领取；首个有效领取者获得奖励。真实领取功能尚未开放。",
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
        title={t(`Explore ${TOKENS.length} tokenized assets.`, `了解全部 ${TOKENS.length} 种代币化资产。`)}
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
              `Each token is associated with a venue category, including bank branches, internet cafés, computer malls, phone shops, superchargers, Apple Stores and science museums. Under the planned flow, fragments are transferred from the vault on ${CHAIN.short}.`,
              `每种代币对应一类真实场所，包括银行网点、网吧、电脑城、手机店、超充站、Apple 直营店与科技馆。按规划流程，碎片由 ${CHAIN.short} 上的金库转出。`,

            )}
          </p>
        </Panel>
      </Section>

      {/* --------------------------------------------------------- waitlist */}
      <Section
        eyebrow={t("city updates", "城市拓展")}
        title={t("Register interest in your city.", "登记意向城市，关注后续开放。")}
      >
        <Panel className="mt-8">
          <WaitlistForm />
        </Panel>
      </Section>
    </div>
  );
}
