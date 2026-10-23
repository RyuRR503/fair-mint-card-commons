import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, Panel } from "@/components/site/Section";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/download")({
  head: () => ({
    meta: [
      { title: "Get CATCH — web app today, Android and iOS next" },
      {
        name: "description",
        content:
          "Explore CATCH in your phone browser and preview GPS to AI command to Agent Wallet claims. Live Agent integration is pending.",
      },
      { property: "og:title", content: "Get CATCH" },
      { property: "og:description", content: "Web app today, Android APK in testing, App Store next." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...SITE_PREVIEW_META,

    ],
  }),
  component: Download,
});

function Download() {
  const t = useT();
  return (
    <>
      <Section hero
        eyebrow={t("get the app", "下载客户端")}
        title={t("Access CATCH on your device", "选择适合您的访问方式")}
        lead={t(
          "Use your phone for the map and GPS. The planned claim step happens in your AI’s Agent Wallet, not through a browser wallet button.",
          "当前可通过手机浏览地图与预览领取流程。按规划，用户完成现场定位验证后，由 AI 通过 Agent 钱包提交领取，普通钱包不具备领取资格。",
        )}
        className="mt-10"
      />

      <Section title={t("Pick your platform", "选择平台")}>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <Panel>
            <h3 className="text-lg">{t("Android", "安卓")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(
                "The CATCH Android build is in testing: real motion sensors, background GPS, in-app updates. The web map is available; live Agent claims are not connected.",
                "CATCH 安卓客户端正在测试：真实运动传感器、后台定位、应用内更新。网页版可浏览地图和预览 Agent 流程，真实领取尚未接通。",
              )}
            </p>
            <Link
              to="/app"
              className="label-caps mt-5 inline-block rounded-md bg-primary px-6 py-3 text-xs text-primary-foreground shadow-[var(--shadow-glossy)]"
            >
              {t("APK soon — open the web app", "客户端测试中 · 浏览网页版")}
            </Link>

          </Panel>
          <Panel>
            <h3 className="text-lg">iOS</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(
                "Open the web app in Safari, tap Share, then Add to Home Screen. It behaves like a native app minus background GPS. Live Agent claims are pending.",
                "用 Safari 打开网页版，点分享，再选「添加到主屏幕」。除了后台定位，其余体验与原生应用一致。Agent 真实领取尚未接通。",
              )}
            </p>
            <Link
              to="/app"
              className="label-caps mt-5 inline-block rounded-md border border-border bg-card px-6 py-3 text-xs shadow-[var(--shadow-pop)]"
            >
              {t("Open the web app", "打开网页版")}
            </Link>
          </Panel>
          <Panel>
            <h3 className="text-lg">{t("Desktop", "桌面端")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(
                "Desktop users can browse locations and vault information. The claim rules require accurate on-site location verification; browsing alone does not establish eligibility.",
                "桌面端可浏览点位地图与金库信息。按领取规则，用户须在现场完成高精度定位验证；电脑端浏览不代表具备领取资格。",
              )}
            </p>
            <Link
              to="/app"
              className="label-caps mt-5 inline-block rounded-md border border-border bg-card px-6 py-3 text-xs shadow-[var(--shadow-pop)]"
            >
              {t("Browse the map", "浏览地图")}
            </Link>
          </Panel>
        </div>
      </Section>

      <Section title={t("Permissions we ask for, and why", "权限用途说明")}>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            [
              t("Precise location", "精确定位"),
              t(
                "The whole game. Coarse location is refused because it cannot tell a door from a block.",
                "用于识别用户与指定点位的距离。粗略定位无法准确区分具体场所，不满足现场验证要求。",
              ),
            ],
            [
              t("Motion sensors", "运动传感器"),
              t(
                "Distinguishing a hand from an emulator. Readings never leave the claim request.",
                "用来区分真人手持和模拟器。读数只随领取请求发送，不做他用。",
              ),
            ],
            [
              t("Nothing else", "其他权限"),
              t(
                "No contacts, no photos, no ad id. The app has no account, only a wallet.",
                "不申请通讯录、相册与广告标识权限。领取身份以符合资格的 Agent 钱包为依据。",
              ),
            ],
            [
              t("What we store", "数据存储范围"),
              t(
                "Your position log for the anti-cheat window, your catches, and your wallet address. That is the list.",
                "存储范围包括反作弊时间窗内的定位日志、领取记录与钱包地址。",
              ),
            ],
          ].map(([h, p]) => (
            <Panel key={h}>
              <h3 className="label-caps text-xs text-primary">{h}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p}</p>
            </Panel>
          ))}
        </div>
      </Section>
    </>
  );
}
