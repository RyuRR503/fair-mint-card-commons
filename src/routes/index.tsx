import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
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
          "CATCH turns the city into a market. Walk to a real place, catch the signal, and a tokenized US stock fragment settles into your wallet on BNB Smart Chain.",
      },
      { property: "og:title", content: "CATCH — catch the fun, catch the market" },
      {
        property: "og:description",
        content:
          "Tokenized US stock fragments sit at real places across 30 cities. Get in range, catch, and the fragment is transferred out of a public vault on BNB Smart Chain.",
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
      <section className="relative overflow-hidden px-5 pb-16 pt-8 sm:pt-12">
        <div className="mx-auto max-w-6xl">
          <div className="reveal-focus flex items-center justify-between gap-6 border-b border-border pb-5">
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="size-2 animate-pulse rounded-full bg-primary" />
              {CHAIN.name} · {t("Live", "运行中")}
            </span>
            <span className="readout hidden sm:block">
              {t("LEGENDARY · DAILY · 24H NOTICE", "传奇 · 每天一次 · 提前 24 小时公布")}
            </span>
          </div>

          <div className="mt-10 grid items-end gap-12 lg:grid-cols-[1.25fr_1fr]">
            <div className="reveal-focus min-w-0">
              <p className="label-caps text-xs text-primary">
                {t("Catch the fun · real-world stock fragments", "抓住乐趣 · 真实世界的美股碎片")}
              </p>
              <p
                aria-hidden
                className="font-poster mt-4 select-none text-[7rem] text-foreground sm:text-[11rem] lg:text-[13rem]"
              >
                CATCH<span className="text-primary">.</span>
              </p>
              <h1 className="mt-4 max-w-xl text-[2rem] leading-[1.2] sm:text-[2.6rem]">
                {t("Walk the city. Catch the market.", "走到街上，把市场装进口袋。")}
              </h1>
              <p className="mt-6 max-w-lg text-base leading-[1.9] text-muted-foreground sm:text-lg">
                {t(
                  "Tokenized stock fragments sit at real coordinates. Get in range, catch the signal, and the fragment moves out of a funded vault straight into your wallet.",
                  "代币化的股票碎片停在真实坐标上。走进范围、捕捉信号，碎片就从已注资的金库直接转进你的钱包。不增发，不预售。",
                )}
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  to="/app"
                  className="btn-arrow halation rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
                >
                  {t("Start hunting", "立即开始寻宝")} <span className="arrow">→</span>
                </Link>
                <Link
                  to="/how-it-works"
                  className="rounded-full border border-border px-8 py-4 font-medium text-foreground transition-colors duration-300 hover:border-primary/60 hover:bg-secondary"
                >
                  {t("How it works", "玩法说明")}
                </Link>
              </div>
            </div>

            {/* HUD fragment card */}
            <div className="relative mx-auto aspect-square w-full max-w-sm lg:max-w-md">
              <div className="grid-field absolute inset-0 opacity-60" />
              <div className="map-sweep absolute inset-8 rounded-full" />
              <div className="viewfinder absolute inset-6 flex items-center justify-center">
                <div className="panel w-full rotate-3 rounded-2xl p-7 transition-transform duration-700 [transition-timing-function:var(--ease-cine)] hover:rotate-0 hover:scale-[1.02]">
                  <div className="mb-8 flex items-start justify-between">
                    <TokenChip symbol="NVDAON" size={48} />
                    <span className="readout text-[11px]">FRAG #8842</span>
                  </div>
                  <p className="label-caps text-[10px] text-muted-foreground">Stock fragment</p>
                  <p className="font-poster mt-2 text-5xl">NVIDIA</p>
                  <div className="mt-7 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{t("Fragment", "碎片")}</p>
                      <p className="readout mt-1 text-lg text-primary">0.0085 NVDAON</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{t("Location", "坐标")}</p>
                      <p className="mt-1 text-sm">{t("SHANGHAI, CN", "中国 上海")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* big numbers */}
          <div className="mt-16 grid grid-cols-3 border-y border-border">
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

      {/* ------------------------------------------------------ ticker */}
      <div className="overflow-hidden border-b border-border py-5" aria-hidden>
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

        <div className="ink-frame relative overflow-hidden rounded-3xl p-3">
          <div className="overflow-hidden rounded-2xl">
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
                `Not points and not a picture of a stock. Tokenized shares as BEP-20s on ${CHAIN.name} — NVDAON, AAPLON, TSLAON — sitting in your own wallet.`,
                `不是积分，也不是股票截图。而是 ${CHAIN.name} 上的 BEP-20 代币化股票——NVDAON、AAPLON、TSLAON——直接放在你自己的钱包里。`,
              ),
            },
            {
              n: "02 / PLACE",
              h: t("Real coordinates.", "真实坐标。"),
              p: t(
                "Signals sit in front of places that actually match the asset. An Apple Store drops AAPLON, an internet café drops NVDAON, a Tesla supercharger drops TSLAON.",
                "信号停在与资产真正匹配的场所门口：Apple 直营店掉 AAPLON，网吧掉 NVDAON，特斯拉超充站掉 TSLAON。",

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
        title={t("Three steps. One of them is cardio.", "三步。其中一步是有氧运动。")}
        lead={t(
          "No pre-sale, no points, no mint. The vault is funded first, then the fragment moves.",
          "没有预售、没有积分、不增发。金库先注资，碎片再转出。",
        )}
      >
        <div className="mt-10 grid gap-px bg-border md:grid-cols-3">
          {[
            {
              n: "01",
              h: t("Open the radar.", "打开雷达。"),
              p: t(
                "The map shows every live signal near you, colour-coded by rarity.",
                "地图会显示你附近所有活跃信号，按稀有度用颜色区分。",
              ),
            },
            {
              n: "02",
              h: t("Close the distance.", "拉近距离。"),
              p: t(
                "Get within 40 to 73 metres, depending on how honest your GPS is being. Walking and cycling both count.",
                "走进 40 到 73 米以内（取决于你的定位精度）。走路和骑车都算。",
              ),
            },
            {
              n: "03",
              h: t("Catch it.", "捕捉。"),
              p: t(
                `The fragment lands in your wallet on ${CHAIN.name}. Hold it, sell it, or send it to a friend.`,
                `碎片会落进你在 ${CHAIN.name} 上的钱包。可以持有、卖出，或者转给朋友。`,
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
        <Panel className="mt-8 overflow-x-auto p-0 sm:p-0">
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
                "Every day a whole SPCXON share sits at one spot for 120 minutes, announced 24 hours ahead with a live countdown. Be there, be within 25 metres, and the strict location check does the rest — first valid claim takes the share.",
                "每天一次，一整股 SPCXON 会在某个地点停留 120 分钟，提前 24 小时公布并附实时倒计时。到场并进入 25 米范围，系统会做更严格的定位校验——第一个通过校验的人拿走整股。",
              )}
            </p>
            <Link
              to="/legendary"
              className="label-caps mt-6 inline-block rounded-md border border-accent/60 bg-accent/15 px-6 py-3 text-[11px] text-accent-foreground"
            >
              {t("See the countdown", "查看倒计时")}
            </Link>
          </div>
          <TokenChip symbol="SPCXON" size={140} float />
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
