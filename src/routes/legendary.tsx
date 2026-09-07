import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Section, Panel } from "@/components/site/Section";
import { TokenChip } from "@/components/site/TokenChip";
import { getLegendary } from "@/lib/game.functions";
import { LEGENDARY_RADIUS_M } from "@/lib/geo";

export const Route = createFileRoute("/legendary")({
  head: () => ({
    meta: [
      { title: "The legendary drop — one whole share, one place, one winner" },
      {
        name: "description",
        content:
          "Once a month a full NVDA share sits at one spot for one hour. Announced 24 hours ahead. Be within 25 metres and find the code.",
      },
      { property: "og:title", content: "Touch Grass legendary drop" },
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
        eyebrow="the legendary"
        title="One whole share. One hour. One winner."
        lead="Fragments are the everyday loot. Once a month, a full share sits at exactly one spot on earth for sixty minutes."
        className="mt-10"
      />

      <Section title={next ? "Next drop" : "No drop scheduled"}>
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
                <p className="mt-1 text-sm text-foreground/70">
                  {new Date(next.starts_at).toLocaleString()} · open for {next.duration_min} minutes
                </p>
                {cd && (
                  <div className="mt-6 flex gap-3">
                    {cd.live ? (
                      <span className="label-caps rounded-full bg-primary px-5 py-3 text-xs text-primary-foreground">
                        live now
                      </span>
                    ) : (
                      ([
                        ["days", cd.d],
                        ["hrs", cd.h],
                        ["min", cd.m],
                        ["sec", cd.s],
                      ] as const).map(([l, v]) => (
                        <span
                          key={l}
                          className="w-20 rounded-2xl bg-card px-3 py-3 text-center shadow-[var(--shadow-pop)]"
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
            <p className="text-sm text-foreground/70">
              The next legendary is announced 24 hours ahead, here and on X.
            </p>
          )}
        </Panel>
      </Section>

      <Section title="The rules">
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            ["24 hours notice", "The exact spot and the exact minute go public a day early. Everybody gets the same head start."],
            [`${LEGENDARY_RADIUS_M} metre radius`, "Tighter than a normal drop. You have to be at the spot, not near it."],
            ["A physical code", "A code is stuck at the spot at the start of the hour. You type it in. No code, no share — which is why spoofing a legendary is pointless."],
            ["First valid claim wins", "The winner slot is locked the instant a valid claim lands. Everybody else gets a consolation fragment."],
          ].map(([h, p]) => (
            <Panel key={h}>
              <h3 className="label-caps text-xs text-primary-foreground/70">{h}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">{p}</p>
            </Panel>
          ))}
        </div>
      </Section>

      {past.length > 0 && (
        <Section title="Previous legendaries">
          <Panel className="mt-6">
            <ul className="divide-y divide-border/60">
              {past.map((e, i) => (
                <li key={i} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                  <TokenChip symbol={e.symbol} size={28} />
                  <span>
                    {e.amount} {e.symbol} — {e.place}, {e.city}
                  </span>
                  <span className="ml-auto font-mono text-xs text-muted-foreground">
                    {e.winner_wallet ?? "unclaimed"}
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
