import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Section, Panel } from "@/components/site/Section";
import { TokenChip } from "@/components/site/TokenChip";
import { getVault, getClaims } from "@/lib/game.functions";
import { CHAIN, VAULT_ADDRESS } from "@/lib/tokens";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/proof")({
  head: () => ({
    meta: [
      { title: "Proof of reserves — count the vault yourself" },
      {
        name: "description",
        content:
          "Every fragment is bought and deposited before it spawns. The vault balance is public on BscScan and re-read every minute.",
      },
      { property: "og:title", content: "CATCH proof of reserves" },
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
  const t = useT();
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
        eyebrow={t("proof of reserves", "储备证明")}
        title={t("Nothing is minted. Count it yourself.", "不增发。你自己数。")}
        lead={t(
          "Every fragment that spawns was bought on the open market and deposited into the vault first. If the vault cannot pay a signal, the signal does not appear.",
          "每一枚投放出去的碎片，都是先在市场上买入、再存进金库的。金库付不出的信号，压根不会出现在地图上。",
        )}
        className="mt-10"
      />

      <Section title={t("The addresses", "地址")}>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            {
              h: t("Vault", "金库"),
              d: t("Holds the stock tokens that back every live signal.", "持有支撑每个在线信号的股票代币。"),
              a: VAULT_ADDRESS,
            },
            {
              h: t("Treasury", "国库"),
              d: t("Receives fees, buys stock tokens, tops the vault back up.", "收取手续费、买入股票代币、给金库补货。"),
              a: "0xdE852DF21C3628270e9B938B5215B7C78e9A8dc4",
            },
          ].map((c) => (
            <Panel key={String(c.h)}>
              <h3 className="label-caps text-xs text-muted-foreground">{c.h}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
              <a
                href={`${CHAIN.explorer}/address/${c.a}`}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-3 block break-all font-mono text-xs text-primary underline underline-offset-4"
              >
                {c.a}
              </a>
            </Panel>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {t(
            `Read on ${CHAIN.name} (chain id ${CHAIN.id}), refreshed every minute`,
            `数据读自 ${CHAIN.name}（链 id ${CHAIN.id}），每分钟刷新一次`,
          )}
          {checkedAt ? `, ${t("last at", "最近")} ${new Date(checkedAt).toLocaleTimeString()}` : ""}.
          {!live &&
            t(
              " Showing seeded figures until the vault contract is deployed.",
              " 金库合约部署前，此处显示的是预置数据。",
            )}
        </p>
      </Section>

      <Section title={t("What the vault holds right now", "金库当前持仓")}>
        <Panel className="mt-6 overflow-x-auto p-0 sm:p-0">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="label-caps border-b border-border text-[10px] text-muted-foreground">
                <th className="px-6 py-4">{t("Token", "代币")}</th>
                <th className="px-6 py-4">{t("Balance", "余额")}</th>
                <th className="px-6 py-4">{t("Signals it covers", "可支撑信号数")}</th>
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
                    {t("Reading the chain…", "正在读取链上数据…")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Panel>
      </Section>

      <Section
        title={t("Recent catches", "最近的领取")}
        lead={t("Every claim is a public transfer out of the vault.", "每一次领取都是一笔从金库转出的公开交易。")}
      >
        <Panel className="mt-6">
          {feed.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("No catches yet. Be the first — the map is open.", "还没有人抓到。地图已经开了，你可以是第一个。")}
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {feed.map((c, i) => (
                <li key={i} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                  <TokenChip symbol={c.symbol} size={28} />
                  <span className="font-mono text-xs">{c.wallet}</span>
                  <span className="text-muted-foreground">
                    {t(
                      `caught ${c.amount} ${c.symbol} at ${c.place}, ${c.city}`,
                      `在${c.city} ${c.place} 抓到 ${c.amount} ${c.symbol}`,
                    )}
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
