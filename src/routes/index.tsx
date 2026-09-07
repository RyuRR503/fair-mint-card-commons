import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Section, Panel } from "@/components/site/Section";
import { TokenChip } from "@/components/site/TokenChip";
import { WorldMap, type MapPin } from "@/components/site/WorldMap";
import { WaitlistForm } from "@/components/site/WaitlistForm";
import { spawnsByCity, TOTAL_CITIES, TOTAL_SPAWNS } from "@/lib/spawns";
import { TOKENS, EXTRA_BADGES, RARITY_LABEL, rarityVar, CHAIN } from "@/lib/tokens";
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

const FLOATERS = [
  { s: "AMZN", top: "8%", left: "8%", size: 66, spin: -8, d: 0 },
  { s: "NVDA", top: "46%", left: "2%", size: 78, spin: 10, d: 1.1 },
  { s: "TSLA", top: "78%", left: "14%", size: 62, spin: -12, d: 2 },
  { s: "NFLX", top: "8%", left: "84%", size: 62, spin: 12, d: 0.6 },
  { s: "AAPL", top: "44%", left: "90%", size: 80, spin: -6, d: 1.6 },
  { s: "GME", top: "78%", left: "80%", size: 66, spin: 9, d: 2.4 },
];

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
      <section className="graded relative overflow-hidden px-5 pb-16 pt-20 sm:pt-28">
        {/* drifting ticker plates, kept far from the type */}
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden opacity-25 lg:block">
          {FLOATERS.map((f) => (
            <span key={`${f.s}-pos`} className="absolute" style={{ top: f.top, left: f.left }}>
              <TokenChip symbol={f.s} size={f.size} float spin={f.spin} delay={f.d} />
            </span>
          ))}
        </div>

        <div className="reveal-focus relative mx-auto max-w-4xl">
          {/* slate */}
          <div className="flex items-center gap-3">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            <p className="readout">
              {t(
                `LIVE · ${TOTAL_SPAWNS} SIGNALS · ${TOTAL_CITIES} CITIES · ${CHAIN.short}`,
                `实时 · ${TOTAL_SPAWNS} 个信号 · ${TOTAL_CITIES} 座城市 · ${CHAIN.short}`,
              )}
            </p>
          </div>

          <h1 className="mt-10 text-[2.6rem] leading-[1.18] sm:text-[4.25rem]">
            <span className="block text-foreground">{t("The market", "市场")}</span>
            <span className="block text-foreground">{t("has an address.", "有一个地址。")}</span>
            <span className="mt-3 block text-muted-foreground">{t("Go stand on it.", "走过去，站上去。")}</span>
          </h1>

          <p className="font-latin mt-8 text-[11px] uppercase tracking-[0.44em] text-primary">
            catch the market on foot
          </p>

          <p className="mt-8 max-w-xl text-[0.975rem] leading-[1.9] text-muted-foreground">
            {t(
              "Tokenized stock fragments sit at real coordinates. Get in range, catch the signal, and the fragment moves out of a funded vault straight into your wallet. No mint. No pre-sale.",
              "代币化的股票碎片停在真实坐标上。走进范围、捕捉信号，碎片就从已注资的金库转进你的钱包。不增发，不预售。",
            )}
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link
              to="/app"
              className="label-caps halation rounded-md bg-primary px-8 py-3.5 text-[11px] text-primary-foreground transition-all duration-300 hover:brightness-110"
            >
              {t("Start hunting", "开始捕捉")}
            </Link>
            <Link
              to="/download"
              className="label-caps rounded-md border border-border px-8 py-3.5 text-[11px] text-foreground transition-colors duration-300 hover:border-primary/60 hover:text-primary"
            >
              {t("Get the app", "下载 App")}
            </Link>
            <Link
              to="/docs"
              className="label-caps text-[11px] text-muted-foreground underline underline-offset-8 transition-colors hover:text-primary"
            >
              {t("Docs", "文档")}
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- map */}
      <div className="cinema-frame graded relative">
        <div className="mx-auto max-w-6xl px-5 py-8">
          <div className="flex items-center justify-between gap-4 pb-4">
            <p className="readout">{t("SECTOR MAP · REALTIME", "全球扇区图 · 实时")}</p>
            <p className="readout hidden sm:block">
              {t(`${TOTAL_CITIES} CITIES / ${TOTAL_SPAWNS} SPAWNS`, `${TOTAL_CITIES} 城 / ${TOTAL_SPAWNS} 点`)}
            </p>
          </div>
          <div className="scanline overflow-hidden rounded-md border border-border">
            <WorldMap pins={pins} />
          </div>
        </div>
      </div>


      {/* ------------------------------------------------------ what is this */}
      <Section
        eyebrow={t("what this is", "这是什么")}
        title={t("A market with coordinates.", "一个有坐标的市场。")}
      >
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            {
              h: t("Real assets.", "真实资产。"),
              p: t(
                `Not points and not a picture of a stock. Tokenized shares as BEP-20s on ${CHAIN.name} — AAPL, NVDA, TSLA — sitting in your own wallet.`,
                `不是积分，也不是股票截图。而是 ${CHAIN.name} 上的 BEP-20 代币化股票——AAPL、NVDA、TSLA——直接放在你自己的钱包里。`,
              ),
            },
            {
              h: t("Real coordinates.", "真实坐标。"),
              p: t(
                "Signals appear in front of the actual stores and offices of the companies behind them. An Apple Store drops Apple. A GameStop drops GameStop.",
                "信号出现在这些公司真实的门店和办公室门口。苹果店掉苹果，GameStop 掉 GameStop。",
              ),
            },
            {
              h: t("Real distance.", "真实距离。"),
              p: t(
                "You have to physically get there. GPS fix, motion sensors, device and travel-speed checks. Spoofers get a polite refusal and zero shares.",
                "你必须真的走过去。定位采样、运动传感器、设备与移动速度校验。伪造定位的只会收到一句礼貌的拒绝和 0 股。",
              ),
            },
          ].map((c) => (
            <Panel key={String(c.h)}>
              <h3 className="text-xl">{c.h}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.p}</p>
            </Panel>
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
        <div className="mt-8 grid gap-5 md:grid-cols-3">
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
            <Panel key={s.n}>
              <span className="label-caps font-mono text-4xl text-primary">{s.n}</span>
              <h3 className="mt-3 text-xl">{s.h}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.p}</p>
            </Panel>
          ))}
        </div>
        <div className="mt-6">
          <Link
            to="/how-it-works"
            className="label-caps text-[11px] text-primary underline underline-offset-4"
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
        title={t("Collect all 13.", "集齐全部 13 枚。")}
      >
        <Panel className="mt-8">
          <div className="flex flex-wrap gap-4">
            {TOKENS.map((tk) => (
              <span key={tk.symbol} className="flex w-16 flex-col items-center gap-2">
                <TokenChip symbol={tk.symbol} size={52} />
                <span className="label-caps text-[9px] text-muted-foreground">{tk.symbol}</span>
              </span>
            ))}
            {EXTRA_BADGES.map((s) => (
              <span key={s} className="flex w-16 flex-col items-center gap-2 opacity-35 grayscale">
                <TokenChip symbol={s} size={52} />
                <span className="label-caps text-[9px] text-muted-foreground">{s}</span>
              </span>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            {t(
              `${TOKENS.length} of ${TOKENS.length + EXTRA_BADGES.length} tokens are stocked in the vault. Grey means the vault holds none yet — those need an on-chain pool on ${CHAIN.short} or a manual deposit.`,
              `金库中已备货 ${TOKENS.length} / ${TOKENS.length + EXTRA_BADGES.length} 枚代币。灰色表示金库暂时没有存货——需要 ${CHAIN.short} 上的链上流动性或人工充值。`,
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
