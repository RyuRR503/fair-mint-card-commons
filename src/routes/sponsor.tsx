import { createFileRoute } from "@tanstack/react-router";
import { SITE_PREVIEW_META } from "@/lib/site-preview";
import { Section, Panel } from "@/components/site/Section";
import { WaitlistForm } from "@/components/site/WaitlistForm";
import { TokenChip } from "@/components/site/TokenChip";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/sponsor")({
  head: () => ({
    meta: [
      { title: "CATCH — 品牌合作与点位赞助" },
      {
        name: "description",
        content:
          "了解 CATCH 品牌合作规划：门店点位、金库注资与经验证的到店记录。合作领取与计费流程仍待接入。",
      },
      { property: "og:title", content: "Sponsor a spot on CATCH" },
      {
        property: "og:description",
        content:
          "CATCH 计划通过位置验证与 Agent 领取记录支持品牌点位合作，当前可提交合作意向。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...SITE_PREVIEW_META,
    ],
  }),
  component: Sponsor,
});

function Sponsor() {
  const t = useT();
  return (
    <>
      <Section hero
        eyebrow={t("sponsor", "品牌合作")}
        title={t("Connect brands with verified visits", "连接品牌门店与经验证的到店访问")}
        lead={t(
          "The proposed partnership model lets brands select venues and fund the vault with relevant stock tokens or fund their purchase. Billing would use verified visits completed through Agent claims; implementation is pending.",
          "计划中的合作模式支持品牌选择门店点位，以对应股票代币为金库注资，或委托买入。计费以通过验证并完成 Agent 领取的到店记录为依据；相关流程尚待接入。",
        )}
        className="mt-10"
      />

      <Section title={t("What a sponsored spot looks like", "点位合作的规划流程")}>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            {
              h: t("You pick the doors.", "选择合作门店"),
              p: t(
                "Every store, one flagship, or a single street during a launch week. Coordinates, radius and opening window are yours.",
                "可选择多家门店、单个旗舰店或活动区域，并约定点位坐标、验证半径与开放时段。",
              ),
            },
            {
              h: t("We fund and schedule.", "安排注资与投放"),
              p: t(
                "The fragment sits in a public vault before the signal appears. Nothing is minted and nothing is promised that cannot be paid.",
                "按规划，开放领取前须完成金库注资。奖励从库存转出，不增发代币；库存不足时不开放对应领取。",
              ),
            },
            {
              h: t("You get proof.", "提供可核验记录"),
              p: t(
                "Under the proposed model, a verified visit and completed Agent claim would produce a record with location, time and an on-chain transfer. Incomplete requests would not count as billable visits.",
                "按规划，通过位置校验并完成 Agent 领取后，将形成包含位置、时间与链上转账信息的记录。未完成验证与领取的请求不计入有效到店。",
              ),
            },
          ].map((c) => (
            <Panel key={String(c.h)}>
              <h3 className="text-lg">{c.h}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.p}</p>
            </Panel>
          ))}
        </div>
      </Section>

      <Section title={t("The billable unit", "计费单位")}>
        <Panel className="mt-6 flex flex-wrap items-center justify-between gap-8">
          <ul className="max-w-xl space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li>{t("· A person stood within metres of your door, phone in hand.", "· 用户抵达合作门店，并进入指定验证范围。")}</li>
            <li>{t("· Their GPS log looked like a real chipset, not a mock provider.", "· 他们的定位日志符合真实芯片特征，而非模拟定位。")}</li>
            <li>{t("· Their trail was physically possible and their clock matched the timezone.", "· 他们的移动轨迹物理上可行，设备时钟与时区吻合。")}</li>
            <li>{t("· A token left the vault and landed in their wallet, publicly, on-chain.", "· 代币从金库转至符合资格的 Agent 钱包，并产生公开链上记录。")}</li>
          </ul>
          <div className="flex gap-3">
            <TokenChip symbol="AAPLB" size={72} float />
            <TokenChip symbol="NVDAB" size={72} float delay={0.7} />
            <TokenChip symbol="TSLAB" size={72} float delay={1.4} />

          </div>
        </Panel>
      </Section>

      <Section
        title={t("Talk to us", "联系我们")}
        lead={t(
          "The self-serve dashboard is the next thing we build. Until then, leave an email or DM @catchonchain on X.",
          "品牌自助管理功能在开发计划中。当前可提交邮箱与合作意向，或通过 X 联系 @catchonchain。",
        )}
      >
        <Panel className="mt-6">
          <WaitlistForm kind="brand" />
        </Panel>
      </Section>
    </>
  );
}
