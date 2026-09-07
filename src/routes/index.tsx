import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Section, Panel } from "@/components/site/Section";
import { TokenChip } from "@/components/site/TokenChip";
import { WorldMap, type MapPin } from "@/components/site/WorldMap";
import { WaitlistForm } from "@/components/site/WaitlistForm";
import { spawnsByCity, TOTAL_CITIES, TOTAL_SPAWNS } from "@/lib/spawns";
import { TOKENS, RARITY_LABEL, rarityVar, CHAIN } from "@/lib/tokens";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CATCH — hunt tokenized stock fragments on BNB Chain" },
      {
        name: "description",
        content:
          "CATCH turns the map into a market. Walk to a real coordinate, catch the signal, and a tokenized stock fragment settles into your wallet on BNB Smart Chain.",
      },
      { property: "og:title", content: "CATCH — the map is the market" },
      {
        property: "og:description",
        content:
          "Tokenized stock fragments appear at real coordinates worldwide. Get in range, catch, and the fragment is transferred out of a public vault on BNB Smart Chain.",
      },
    ],
  }),
  component: Home,
});

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="label-caps text-[10px] text-muted-foreground">{label}</span>
      <span className={`readout text-2xl font-semibold ${accent ? "text-primary" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}

function Home() {
  const t = useT();
  const cities = useMemo(() => spawnsByCity(), []);
  const pins: MapPin[] = useMemo(
    () =>
      cities.map((c) => ({
        key: c.city.name,
        lat: c.city.lat,
        lng: c.city.lng,
        label: c.city.name,
        count: c.spawns.length,
        symbols: c.spawns.slice(0, 3).map((s) => s.symbol),
        rarity: c.spawns.some((s) => s.rarity === "epic")
          ? "epic"
          : c.spawns.some((s) => s.rarity === "rare")
            ? "rare"
            : "common",
      })),
    [cities],
  );

  return (
    <>
      {/* ---------------------------------------------------------- hero */}
      <section className="relative overflow-hidden px-5 pb-20 pt-10 sm:pt-14">
        <div className="mx-auto max-w-6xl">
          {/* live instrument strip */}
          <div className="flex flex-wrap items-end justify-between gap-8 border-b border-border pb-8">
            <div className="flex flex-wrap gap-10 sm:gap-14">
              <Stat label="LIVE SIGNALS" value={String(TOTAL_SPAWNS)} accent />
              <Stat label="CITIES" value={String(TOTAL_CITIES)} />
              <div className="flex flex-col gap-1.5">
                <span className="label-caps text-[10px] text-muted-foreground">NETWORK</span>
                <span className="flex items-center gap-2 text-sm">
                  <span className="size-2 animate-pulse rounded-full bg-primary" />
                  {CHAIN.name}
                </span>
              </div>
            </div>
            <span className="glass-panel hidden rounded-full px-4 py-2 text-xs text-muted-foreground md:block">
              {t("Next legendary drop", "下一次传奇掉落")}
              <span className="readout ml-2 text-primary">02:14:55</span>
            </span>
          </div>

          <div className="reveal-focus mt-16 grid items-center gap-16 lg:grid-cols-2">
            <div>
              <div className="flex items-center gap-4">
                <span className="h-0.5 w-12 bg-primary" />
                <span className="label-caps text-xs text-primary">Reality treasure hunt</span>
              </div>

              <h1 className="mt-5 text-[2.75rem] leading-[1.2] sm:text-[3.75rem]">
                {t("Walk the city.", "走到街上，")}
                <br />
                {t("Catch the market.", "把市场装进口袋。")}
                <span className="font-latin mt-4 block text-lg font-medium tracking-[0.32em] text-primary sm:text-xl">
                  CATCH ON BNB CHAIN
                </span>
              </h1>

              <p className="mt-8 max-w-xl text-lg leading-[2] text-muted-foreground">
                {t(
                  "Tokenized stock fragments sit at real coordinates. Get in range, catch the signal, and the fragment moves out of a funded vault straight into your wallet.",
                  "代币化的股票碎片停在真实坐标上。走进范围、捕捉信号，碎片就从已注资的金库直接转进你的钱包。不增发，不预售。",
                )}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  to="/app"
                  className="halation rounded-lg bg-primary px-9 py-4 font-bold text-primary-foreground transition-transform duration-300 hover:scale-[1.03]"
                >
                  {t("Start hunting", "立即开始寻宝")}
                </Link>
                <Link
                  to="/download"
                  className="rounded-lg border border-border px-9 py-4 font-medium text-foreground transition-colors duration-300 hover:bg-secondary"
                >
                  {t("Get the app", "下载 App")}
                </Link>
                <Link
                  to="/docs"
                  className="text-sm text-muted-foreground underline underline-offset-8 transition-colors hover:text-primary"
                >
                  {t("Docs", "文档")}
                </Link>
              </div>
            </div>

            {/* HUD fragment card */}
            <div className="relative mx-auto aspect-square w-full max-w-md">
              <div className="absolute inset-0 rounded-3xl border-[18px] border-white/5" />
              <div className="grid-field absolute inset-6 opacity-60" />
              <div className="map-sweep absolute inset-10 rounded-full" />
              <div className="viewfinder absolute inset-8 flex items-center justify-center">
                <div className="panel w-full rotate-3 rounded-2xl p-8 transition-transform duration-500 hover:rotate-0">
                  <div className="mb-10 flex items-start justify-between">
                    <TokenChip symbol="NVDA" size={48} />
                    <span className="readout text-[11px]">FRAG #8842</span>
                  </div>
                  <p className="label-caps text-[10px] text-muted-foreground">Stock fragment</p>
                  <p className="mt-2 text-3xl font-bold">NVIDIA Corp.</p>
                  <div className="mt-8 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{t("Fragment", "碎片")}</p>
                      <p className="readout mt-1 text-xl text-primary">1.000 NVDA</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{t("Location", "坐标")}</p>
                      <p className="mt-1 text-sm">SANTA CLARA, US</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
          <div className="scanline overflow-hidden rounded-2xl">
            <WorldMap pins={pins} />
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
                `Not points and not a picture of a stock. Tokenized shares as BEP-20s on ${CHAIN.name} — AAPL, NVDA, TSLA — sitting in your own wallet.`,
                `不是积分，也不是股票截图。而是 ${CHAIN.name} 上的 BEP-20 代币化股票——AAPL、NVDA、TSLA——直接放在你自己的钱包里。`,
              ),
            },
            {
              n: "02 / PLACE",
              h: t("Real coordinates.", "真实坐标。"),
              p: t(
                "Signals appear in front of the actual stores and offices of the companies behind them. An Apple Store drops Apple. A GameStop drops GameStop.",
                "信号出现在这些公司真实的门店和办公室门口。苹果店掉苹果，GameStop 掉 GameStop。",
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
            <div key={s.n} className="bg-card p-8 sm:p-10">
              <span className="font-latin block text-6xl font-light leading-none tracking-tighter text-border">
                {s.n}
              </span>
              <h3 className="font-latin mt-6 text-xl tracking-tight">{s.h}</h3>
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
                <tr key={tk.symbol} className="border-b border-border/60 last:border-0">
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-3">
                      <TokenChip symbol={tk.symbol} size={34} />
                      <span className="label-caps text-xs">{tk.symbol}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {tk.symbol === "NVDA"
                      ? t("Nvidia HQ, once a month", "英伟达总部，每月一次")
                      : t(`Any ${tk.name} door`, `任意 ${tk.name} 门店`)}
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
            `${TOTAL_SPAWNS} signals across ${TOTAL_CITIES} cities, refilled every day at 00:00 UTC. A signal only appears if the vault can pay it — `,
            `${TOTAL_CITIES} 座城市共 ${TOTAL_SPAWNS} 个信号，每天 UTC 00:00 刷新。只有金库付得起，信号才会出现——`,
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
                "Once a month a whole NVDA share sits at one spot for one hour, announced 24 hours ahead with a live countdown. Be there, be within 25 metres, and read the code physically posted at the spot. No code, no prize — which is exactly what makes spoofing useless.",
                "每月一次，一整股 NVDA 会在某个地点停留一小时，提前 24 小时公布并附实时倒计时。到场、进入 25 米范围，并读取现场张贴的验证码。没有码就没有奖——这正是伪造定位毫无意义的原因。",
              )}
            </p>
            <Link
              to="/legendary"
              className="label-caps mt-6 inline-block rounded-md border border-accent/60 bg-accent/15 px-6 py-3 text-[11px] text-accent-foreground"
            >
              {t("See the countdown", "查看倒计时")}
            </Link>
          </div>
          <TokenChip symbol="NVDA" size={140} float />
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
              <span key={tk.symbol} className="flex w-16 flex-col items-center gap-2">
                <TokenChip symbol={tk.symbol} size={52} />
                <span className="label-caps text-[9px] text-muted-foreground">{tk.symbol}</span>
              </span>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            {t(
              `Every token maps to a real chain of stores you can walk into. Fragments are paid out of the vault on ${CHAIN.short}.`,
              `每一枚代币都对应一个你能真的走进去的连锁门店。碎片从 ${CHAIN.short} 上的金库里发出。`,
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
