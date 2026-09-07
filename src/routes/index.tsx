import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Section, Panel } from "@/components/site/Section";
import { TokenChip } from "@/components/site/TokenChip";
import { WorldMap, type MapPin } from "@/components/site/WorldMap";
import { WaitlistForm } from "@/components/site/WaitlistForm";
import { spawnsByCity, TOTAL_CITIES, TOTAL_SPAWNS } from "@/lib/spawns";
import { TOKENS, EXTRA_BADGES, RARITY_LABEL, rarityVar, CHAIN } from "@/lib/tokens";
import logotype from "@/assets/logotype.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Touch Grass — Real stocks spawn at real places, on BNB Chain" },
      {
        name: "description",
        content:
          "Walk to a real store, tap, and a fragment of a tokenized stock lands in your wallet on BNB Smart Chain. 700+ spawn points, 85 cities, a public vault.",
      },
      { property: "og:title", content: "Touch Grass — stock fragments you have to walk to" },
      {
        property: "og:description",
        content:
          "A location game where the loot is real. Tokenized stock fragments spawn at the doors of the companies behind them, paid out of a public vault on BNB Smart Chain.",
      },
    ],
  }),
  component: Home,
});

const FLOATERS = [
  { s: "AMZN", top: "12%", left: "18%", size: 74, spin: -8, d: 0 },
  { s: "NVDA", top: "34%", left: "6%", size: 88, spin: 10, d: 1.1 },
  { s: "TSLA", top: "62%", left: "12%", size: 78, spin: -12, d: 2 },
  { s: "NFLX", top: "10%", left: "78%", size: 70, spin: 12, d: 0.6 },
  { s: "AAPL", top: "32%", left: "86%", size: 92, spin: -6, d: 1.6 },
  { s: "GME", top: "64%", left: "82%", size: 80, spin: 9, d: 2.4 },
];

function Home() {
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
      <section className="relative mx-auto max-w-7xl px-4 pb-6 pt-10 text-center sm:pt-16">
        {/* floating brand chips */}

        <div aria-hidden className="pointer-events-none absolute inset-0 hidden sm:block">
          {FLOATERS.map((f) => (
            <span
              key={`${f.s}-pos`}
              className="absolute"
              style={{ top: f.top, left: f.left }}
            >
              <TokenChip symbol={f.s} size={f.size} float spin={f.spin} delay={f.d} />
            </span>
          ))}
        </div>

        <img
          src={logotype}
          alt="Touch Grass"
          width={1408}
          height={912}
          className="relative mx-auto w-full max-w-2xl drop-shadow-[0_24px_40px_rgba(20,60,110,.35)]"
        />

        <p className="relative mx-auto mt-2 max-w-xl font-display text-lg text-card sm:text-2xl">
          Real stocks spawn at real places. <em className="font-serif">Walk there.</em> Tap. Own a
          piece of Apple.
        </p>

        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/app"
            className="label-caps rounded-full bg-primary px-6 py-3.5 text-xs text-primary-foreground shadow-[var(--shadow-glossy)] transition-transform hover:-translate-y-0.5"
          >
            Open the app
          </Link>
          <Link
            to="/download"
            className="label-caps rounded-full bg-card px-6 py-3.5 text-xs text-foreground shadow-[var(--shadow-pop)] transition-transform hover:-translate-y-0.5"
          >
            Get it on Android
          </Link>
          <Link
            to="/docs"
            className="label-caps rounded-full bg-card px-6 py-3.5 text-xs text-foreground shadow-[var(--shadow-pop)] transition-transform hover:-translate-y-0.5"
          >
            Docs
          </Link>
          <a
            href="https://x.com/TouchGrassRWA"
            target="_blank"
            rel="noreferrer noopener"
            className="label-caps rounded-full bg-card px-6 py-3.5 text-xs text-foreground shadow-[var(--shadow-pop)] transition-transform hover:-translate-y-0.5"
          >
            𝕏 TouchGrassRWA
          </a>
        </div>
      </section>

      {/* ---------------------------------------------------------- map */}
      <div className="mx-auto mt-10 max-w-7xl px-4">
        <WorldMap pins={pins} />
      </div>

      {/* ------------------------------------------------------ what is this */}
      <Section
        eyebrow="what is this"
        title="A stock market. On a map. Outside."
      >
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            {
              h: "Real stocks.",
              p: "Not points, not a picture of a stock. Tokenized shares on BNB Smart Chain. AAPL, NVDA, TSLA — BEP-20s that track the real share, sitting in your wallet.",
            },
            {
              h: "Real places.",
              p: "Fragments spawn in front of the actual stores and offices of the actual companies. Apple Store gives Apple. GameStop gives GameStop. Poetry.",
            },
            {
              h: "Real legs.",
              p: "You have to physically go there. GPS, motion sensors, device checks. Spoofers get a polite refusal and zero shares.",
            },
          ].map((c) => (
            <Panel key={c.h}>
              <h3 className="text-xl">{c.h}</h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/70">{c.p}</p>
            </Panel>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------ how it works */}
      <Section
        eyebrow="how it works"
        title="Three steps. One of them is cardio."
        lead="No pre-sale, no points, no mint. The vault is funded first, then the fragment moves."
      >
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            {
              n: "01",
              h: "Put on pants.",
              p: "Open the app. The map shows every drop near you, colour-coded by rarity.",
            },
            {
              n: "02",
              h: "Walk to the spawn.",
              p: "Get within 40 to 73 metres, depending on how honest your GPS is being. Bikes are fine. Cars are for Costco.",
            },
            {
              n: "03",
              h: "Tap. Own a company.",
              p: "The fragment lands in your wallet on BNB Smart Chain. Hold it, sell it, or send it to your ex.",
            },
          ].map((s) => (
            <Panel key={s.n}>
              <span className="label-caps text-4xl text-primary">{s.n}</span>
              <h3 className="mt-3 text-xl">{s.h}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">{s.p}</p>
            </Panel>
          ))}
        </div>
        <div className="mt-6">
          <Link to="/how-it-works" className="label-caps text-xs underline underline-offset-4">
            The long version →
          </Link>
        </div>
      </Section>

      {/* ------------------------------------------------------- spawn table */}
      <Section
        eyebrow="where stocks spawn"
        title="One drop rule per token, everywhere on earth."
      >
        <Panel className="mt-8 overflow-x-auto p-0 sm:p-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="label-caps border-b border-border text-[10px] text-muted-foreground">
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Spawns at</th>
                <th className="px-6 py-4">Rarity</th>
                <th className="px-6 py-4">Fragment</th>
              </tr>
            </thead>
            <tbody>
              {TOKENS.map((t) => (
                <tr key={t.symbol} className="border-b border-border/60 last:border-0">
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-3">
                      <TokenChip symbol={t.symbol} size={34} />
                      <span className="label-caps text-xs">{t.symbol}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-foreground/70">
                    {t.symbol === "NVDA" ? "Nvidia HQ, once a month" : `Any ${t.name} door`}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="label-caps rounded-full px-3 py-1 text-[10px] text-primary-foreground"
                      style={{ background: rarityVar(t.rarity) }}
                    >
                      {RARITY_LABEL[t.rarity]}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">
                    {t.rarity === "legendary" ? "1 full share" : t.fragment}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <p className="mt-4 text-sm text-foreground/70">
          {TOTAL_SPAWNS} drops across {TOTAL_CITIES} cities. Drops refill every day at midnight
          UTC. A drop only spawns if the vault can pay it —{" "}
          <Link to="/proof" className="underline underline-offset-4">
            count the vault yourself
          </Link>
          .
        </p>
      </Section>

      {/* --------------------------------------------------------- legendary */}
      <Section eyebrow="the legendary" title="One share. One place. One winner.">
        <Panel className="mt-8 flex flex-wrap items-center justify-between gap-8">
          <div className="max-w-xl">
            <p className="text-base leading-relaxed text-foreground/75">
              Once a month a whole NVDA share sits at one spot for one hour. Announced 24 hours
              ahead with a live countdown. Be there, be within 25 metres, and find the code stuck
              at the spot. No code, no prize — which is exactly what makes spoofing useless.
            </p>
            <Link
              to="/legendary"
              className="label-caps mt-6 inline-block rounded-full bg-foreground px-6 py-3 text-xs text-background"
            >
              See the countdown
            </Link>
          </div>
          <TokenChip symbol="NVDA" size={140} float />
        </Panel>
      </Section>

      {/* --------------------------------------------------------- stockdex */}
      <Section eyebrow="the stockdex" title="Collect all 13. Touch all the grass.">
        <Panel className="mt-8">
          <div className="flex flex-wrap gap-4">
            {TOKENS.map((t) => (
              <span key={t.symbol} className="flex w-16 flex-col items-center gap-2">
                <TokenChip symbol={t.symbol} size={52} />
                <span className="label-caps text-[9px] text-muted-foreground">{t.symbol}</span>
              </span>
            ))}
            {EXTRA_BADGES.map((s) => (
              <span key={s} className="flex w-16 flex-col items-center gap-2 opacity-35 grayscale">
                <TokenChip symbol={s} size={52} />
                <span className="label-caps text-[9px] text-muted-foreground">{s}</span>
              </span>
            ))}
          </div>
          <p className="mt-6 text-sm text-foreground/70">
            {TOKENS.length} of {TOKENS.length + EXTRA_BADGES.length} tokens are stocked in the
            vault. Grey means the vault holds none yet — those need an on-chain pool on{" "}
            {CHAIN.short} or a hand deposit.
          </p>
        </Panel>
      </Section>

      {/* --------------------------------------------------------- waitlist */}
      <Section eyebrow="early access" title="Tell us where to spawn next.">
        <Panel className="mt-8">
          <WaitlistForm />
        </Panel>
      </Section>
    </>
  );
}
