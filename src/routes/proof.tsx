import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Section, Panel } from "@/components/site/Section";
import { TokenChip } from "@/components/site/TokenChip";
import { getVault, getClaims } from "@/lib/game.functions";
import { CHAIN, TREASURY_ADDRESS, VAULT_ADDRESS, ZERO_ADDRESS } from "@/lib/tokens";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/proof")({
  head: () => ({
    meta: [
      { title: "CATCH — 金库余额与链上记录" },
      {
        name: "description",
        content:
          "查看 CATCH 金库代币余额、库存状态与领取记录。部署前显示预置数据，实际储备以链上余额为准。",
      },
      { property: "og:title", content: "CATCH proof of reserves" },
      {
        property: "og:description",
        content: "查看金库储备与公开链上记录。领取不增发代币；部署前的预置数据不代表实际储备。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...SITE_PREVIEW_META,
    ],
  }),
  component: Proof,
});

type VaultRow = {
  symbol: string;
  balance: number;
  drops: number;
  targetDrops: number;
  needsRefill: boolean;
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
      <Section hero
        eyebrow={t("proof of reserves", "储备证明")}
        title={t("Vault balances and on-chain records", "金库余额与链上记录")}
        lead={t(
          "Under the payout rules, fragments must be purchased and deposited before claims are enabled. This page reports inventory and data sources; actual reserves must be verified on-chain.",
          "按发放规则，碎片须先买入并存入金库，库存不足时不开放对应领取。此处展示库存与数据来源；实际储备请以链上余额为准。",
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
              d: t("Receives fees, buys stock tokens, tops the vault back up.", "接收手续费，用于买入股票代币并补充金库库存。"),
              a: TREASURY_ADDRESS,
            },
          ].map((c) => (
            <Panel key={String(c.h)}>
              <h3 className="label-caps text-xs text-muted-foreground">{c.h}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
              {c.a === ZERO_ADDRESS ? (
                <p className="mt-3 font-mono text-xs text-muted-foreground">
                  {t("Not deployed yet", "尚未部署")}
                </p>
              ) : (
                <a
                  href={`${CHAIN.explorer}/address/${c.a}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-3 block break-all font-mono text-xs text-primary underline underline-offset-4"
                >
                  {c.a}
                </a>
              )}
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

      <Section
        title={t("What the vault holds right now", "金库当前持仓")}
        lead={t(
          "Each token has a consistent claim amount and an inventory target measured in payable claims. When inventory is below target, anyone may trigger a refill under the contract rules.",
          "同种代币在所有点位采用统一的单次领取数量，并设定可支付次数的库存目标。库存低于目标时，任何人均可按合约规则发起补货交易。",
        )}
      >
        <Panel className="mt-6 overflow-x-auto p-0 sm:p-0">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="label-caps border-b border-border text-[10px] text-muted-foreground">
                <th className="px-6 py-4">{t("Token", "代币")}</th>
                <th className="px-6 py-4">{t("Balance", "余额")}</th>
                <th className="px-6 py-4">{t("Signals it covers", "可支撑信号数")}</th>
                <th className="px-6 py-4">{t("Target", "目标库存")}</th>
                <th className="px-6 py-4">{t("Status", "状态")}</th>
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
                  <td className="px-6 py-4 font-mono text-xs">{r.targetDrops}</td>
                  <td className="px-6 py-4 text-xs">
                    {r.needsRefill
                      ? t("Refill open", "待补货")
                      : t("Stocked", "库存充足")}
                  </td>
                </tr>
              ))}
              {!rows && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
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
              {t("No claim records yet. Live Agent claims are not available.", "暂无领取记录。Agent 真实领取尚未开放。")}
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
                      `在${c.city} ${c.place} 领取 ${c.amount} ${c.symbol}`,
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
