import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Section, Panel } from "@/components/site/Section";
import { TokenChip } from "@/components/site/TokenChip";
import { getVault, getClaims } from "@/lib/game.functions";
import { CHAIN, VAULT_ADDRESS } from "@/lib/tokens";

export const Route = createFileRoute("/proof")({
  head: () => ({
    meta: [
      { title: "Proof of reserves — count the vault yourself" },
      {
        name: "description",
        content:
          "Every fragment is bought and deposited before it spawns. The vault balance is public on BscScan and re-read every minute.",
      },
      { property: "og:title", content: "Touch Grass proof of reserves" },
      {
        property: "og:description",
        content: "Nothing is minted. The vault holds the shares before the drop appears.",
      },
    ],
  }),
  component: Proof,
});

type VaultRow = {
  symbol: string;
  balance: number;
  drops: number;
  onChain: boolean;
};
type Claim = {
  wallet: string;
  symbol: string;
  amount: number;
  place: string;
  city: string;
  created_at: string;
};

function Proof() {
  const vault = useServerFn(getVault);
  const claims = useServerFn(getClaims);
  const [rows, setRows] = useState<VaultRow[] | null>(null);
  const [live, setLive] = useState(true);
  const [checkedAt, setCheckedAt] = useState("");
  const [feed, setFeed] = useState<Claim[]>([]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const v = await vault();
        if (!alive) return;
        setRows(v.balances);
        setLive(v.live);
        setCheckedAt(v.checkedAt);
      } catch {
        /* keep last good data */
      }
    };
    load();
    const t = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [vault]);

  useEffect(() => {
    let alive = true;
    claims({ data: {} })
      .then((r) => {
        if (alive) setFeed(r as Claim[]);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [claims]);


  return (
    <>
      <Section
        eyebrow="proof of reserves"
        title="Nothing is minted. Count it yourself."
        lead="Every fragment that spawns was bought on the open market and deposited into the vault first. If the vault cannot pay a drop, the drop does not appear."
        className="mt-10"
      />

      <Section title="The addresses">
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            { h: "Vault", d: "Holds the stock tokens that back every live drop.", a: VAULT_ADDRESS },
            {
              h: "Treasury",
              d: "Receives fees, buys stock, tops the vault back up.",
              a: "0xdE852DF21C3628270e9B938B5215B7C78e9A8dc4",
            },
          ].map((c) => (
            <Panel key={c.h}>
              <h3 className="label-caps text-xs text-muted-foreground">{c.h}</h3>
              <p className="mt-2 text-sm text-foreground/70">{c.d}</p>
              <a
                href={`${CHAIN.explorer}/address/${c.a}`}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-3 block break-all font-mono text-xs text-primary-foreground underline underline-offset-4"
              >
                {c.a}
              </a>
            </Panel>
          ))}
        </div>
        <p className="mt-4 text-sm text-foreground/70">
          Read on {CHAIN.name} (chain id {CHAIN.id}), refreshed every minute{checkedAt ? `, last at ${new Date(checkedAt).toLocaleTimeString()}` : ""}.
          {!live && " Showing seeded figures until the vault contract is deployed."}
        </p>
      </Section>

      <Section title="What the vault holds right now">
        <Panel className="mt-6 overflow-x-auto p-0 sm:p-0">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="label-caps border-b border-border text-[10px] text-muted-foreground">
                <th className="px-6 py-4">Token</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4">Drops it covers</th>
              </tr>
            </thead>
            <tbody>
              {(rows ?? []).map((r) => (
                <tr key={r.symbol} className="border-b border-border/60 last:border-0">
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-3">
                      <TokenChip symbol={r.symbol} size={32} />
                      <span className="label-caps text-xs">{r.symbol}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{r.balance.toFixed(4)}{r.onChain ? "" : " *"}</td>
                  <td className="px-6 py-4 font-mono text-xs">{r.drops}</td>
                </tr>
              ))}
              {!rows && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-muted-foreground">
                    Reading the chain…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Panel>
      </Section>

      <Section title="Recent catches" lead="Every claim is a public transfer out of the vault.">
        <Panel className="mt-6">
          {feed.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No catches yet. Be the first — the map is open.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {feed.map((c, i) => (
                <li key={i} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                  <TokenChip symbol={c.symbol} size={28} />
                  <span className="font-mono text-xs">{c.wallet}</span>
                  <span className="text-foreground/70">
                    caught {c.amount} {c.symbol} at {c.place}, {c.city}
                  </span>
                  <span className="label-caps ml-auto text-[10px] text-muted-foreground">
                    {new Date(c.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </Section>
    </>
  );
}
