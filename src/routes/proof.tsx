import { createFileRoute } from "@tanstack/react-router";
import { SITE_PREVIEW_META } from "@/lib/site-preview";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Section, Panel } from "@/components/site/Section";
import { TokenChip } from "@/components/site/TokenChip";
import { getVault } from "@/lib/game.functions";
import { CHAIN, TREASURY_ADDRESS, VAULT_ADDRESS, ZERO_ADDRESS } from "@/lib/tokens";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/proof")({
  head: () => ({
    meta: [
      { title: "CATCH — 金库余额与库存" },
      {
        name: "description",
        content:
          "查看 CATCH 金库代币余额与库存状态。数据实时读取链上余额。",
      },
      { property: "og:title", content: "CATCH proof of reserves" },
      {
        property: "og:description",
        content: "查看金库储备与库存状态。领取不增发代币，余额实时读取链上数据。",
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
  pendingBnb: number | null;
};
function Proof() {
  const t = useT();
  const vault = useServerFn(getVault);
  const [rows, setRows] = useState<VaultRow[] | null>(null);
  const [onChain, setOnChain] = useState(true);
  const [vaultBnb, setVaultBnb] = useState<number | null>(null);
  const [checkedAt, setCheckedAt] = useState("");

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const v = await vault();
        if (!alive) return;
        setRows(v.balances);
        setOnChain(v.onChain);
        setVaultBnb(v.vaultBnb);
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

  return (
    <>
      <Section hero
        eyebrow={t("proof of reserves", "储备证明")}
        title={t("Vault balances and on-chain records", "金库余额与链上记录")}
        lead={t(
          "Under the payout rules, points only open when the vault holds the tokens to pay them. This page reports inventory and data sources; actual reserves must be verified on-chain.",
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
        {vaultBnb != null && (
          <Panel className="mt-4">
            <h3 className="label-caps text-xs text-muted-foreground">
              {t("Vault BNB balance", "金库 BNB 余额")}
            </h3>
            <p className="mt-2 font-mono text-2xl text-primary">
              {vaultBnb.toFixed(4)} <span className="text-sm">BNB</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(
                "BNB received by the vault, split into nine districts waiting to be swapped into stock tokens.",
                "金库收到的 BNB，已分到九个分区，等待兑换成对应的股票代币。",
              )}
            </p>
          </Panel>
        )}
        <p className="mt-4 text-sm text-muted-foreground">
          {t(
            `Read on ${CHAIN.name} (chain id ${CHAIN.id}), refreshed every minute`,
            `数据读自 ${CHAIN.name}（链 id ${CHAIN.id}），每分钟刷新一次`,
          )}
          {checkedAt ? `, ${t("last at", "最近")} ${new Date(checkedAt).toLocaleTimeString()}` : ""}.
          {!onChain &&
            t(
              " Live chain data is temporarily unavailable; figures may be out of date.",
              " 暂时读不到链上数据，此处数字可能不是最新。",
            )}
        </p>
      </Section>

      <Section
        title={t("What the vault holds right now", "金库当前持仓")}
        lead={t(
          "Each claim is sized by rarity at live prices; the inventory target is measured in payable claims. When inventory is below target, anyone may trigger a refill under the contract rules.",
          "单次奖励按稀有度价值和实时价格换算，库存目标按可支付次数计算。库存低于目标时，任何人均可按合约规则发起补货交易。",
        )}
      >
        <Panel className="mt-6 overflow-x-auto p-0 sm:p-0">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="label-caps border-b border-border text-[10px] text-muted-foreground">
                <th className="px-6 py-4">{t("Token", "代币")}</th>
                <th className="px-6 py-4">{t("Balance", "余额")}</th>
                <th className="px-6 py-4">{t("BNB pending swap", "待兑换 BNB")}</th>
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
                  <td className="px-6 py-4 font-mono text-xs">
                    {r.pendingBnb != null ? `${r.pendingBnb.toFixed(4)} BNB` : "—"}
                  </td>
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
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
                    {t("Reading the chain…", "正在读取链上数据…")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Panel>
      </Section>

    </>
  );
}
