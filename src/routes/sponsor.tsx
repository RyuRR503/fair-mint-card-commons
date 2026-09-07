import { createFileRoute } from "@tanstack/react-router";
import { Section, Panel } from "@/components/site/Section";
import { WaitlistForm } from "@/components/site/WaitlistForm";
import { TokenChip } from "@/components/site/TokenChip";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/sponsor")({
  head: () => ({
    meta: [
      { title: "Sponsor a spot — pay per verified footstep, not per impression" },
      {
        name: "description",
        content:
          "Fund the vault with your own stock token, we schedule spawns at your doors, and you pay per verified physical visit. Not per impression. Not per click.",
      },
      { property: "og:title", content: "Sponsor a spot on CATCH" },
      {
        property: "og:description",
        content:
          "Outdoor advertising that only bills when somebody actually walked to your door and passed every anti-spoof check.",
      },
    ],
  }),
  component: Sponsor,
});

function Sponsor() {
  const t = useT();
  return (
    <>
      <Section
        eyebrow={t("sponsor", "品牌合作")}
        title={t("Pay for footsteps. Not impressions.", "为脚步付费，而不是为曝光付费。")}
        lead={t(
          "A brand sponsors signals at its own doors. It funds the vault with its stock token — or pays us to buy it — we schedule the drops, and it pays per verified visit: a claim that passed every check.",
          "品牌可以在自己门店投放信号：用自家股票代币为金库注资（或委托我们买入），我们安排投放，品牌按「已验证到店」计费——即通过全部校验的一次领取。",
        )}
        className="mt-10"
      />

      <Section title={t("What a sponsored spot looks like", "一个赞助点位长什么样")}>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            {
              h: t("You pick the doors.", "你选门店。"),
              p: t(
                "Every store, one flagship, or a single street during a launch week. Coordinates, radius and opening window are yours.",
                "全部门店、单个旗舰店，或者发布周里的一条街。坐标、半径和开放时段都由你决定。",
              ),
            },
            {
              h: t("We fund and schedule.", "我们注资并排期。"),
              p: t(
                "The fragment sits in a public vault before the signal appears. Nothing is minted and nothing is promised that cannot be paid.",
                "信号出现之前，碎片就已经躺在公开金库里。不增发，也绝不承诺付不出的东西。",
              ),
            },
            {
              h: t("You get proof.", "你拿到证据。"),
              p: t(
                "Each visit is a signed claim with a position, a timestamp and an on-chain transfer. Fraudulent taps never bill because they never complete.",
                "每一次到店都是一笔带位置、时间戳和链上转账的签名记录。作弊的点击不会计费，因为它根本无法完成。",
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
            <li>{t("· A person stood within metres of your door, phone in hand.", "· 有人手持手机，站在离你门店几米内。")}</li>
            <li>{t("· Their GPS log looked like a real chipset, not a mock provider.", "· 他们的定位日志符合真实芯片特征，而非模拟定位。")}</li>
            <li>{t("· Their trail was physically possible and their clock matched the timezone.", "· 他们的移动轨迹物理上可行，设备时钟与时区吻合。")}</li>
            <li>{t("· A token left the vault and landed in their wallet, publicly, on-chain.", "· 一枚代币从金库转出、公开落入他们的钱包。")}</li>
          </ul>
          <div className="flex gap-3">
            <TokenChip symbol="AAPL" size={72} float />
            <TokenChip symbol="GME" size={72} float delay={0.7} />
            <TokenChip symbol="TSLA" size={72} float delay={1.4} />
          </div>
        </Panel>
      </Section>

      <Section
        title={t("Talk to us", "联系我们")}
        lead={t(
          "The self-serve dashboard is the next thing we build. Until then, leave an email or DM @catchonchain on X.",
          "自助后台是我们接下来要做的东西。在那之前，留个邮箱，或者在 X 上私信 @catchonchain。",
        )}
      >
        <Panel className="mt-6">
          <WaitlistForm kind="brand" />
        </Panel>
      </Section>
    </>
  );
}
