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
          "Catch stock fragments straight from the browser today. The Android build adds real motion sensors and background GPS; iOS installs from Safari as a home-screen app.",
      },
      { property: "og:title", content: "Get CATCH" },
      { property: "og:description", content: "Web app today, Android APK in testing, App Store next." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },

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
        title={t("The map fits in a pocket.", "把地图装进口袋。")}
        lead={t(
          "The browser works everywhere. The app adds real motion sensors, background GPS and a claim button that survives a locked screen.",
          "浏览器哪里都能用。客户端多了真实运动传感器、后台定位，以及锁屏后依然有效的领取按钮。",
        )}
        className="mt-10"
      />

      <Section title={t("Pick your platform", "选择平台")}>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <Panel>
            <h3 className="text-lg">{t("Android", "安卓")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(
                "The CATCH Android build is in testing: real motion sensors, background GPS, in-app updates. Until the APK is out, the web app has the full catch flow.",
                "CATCH 安卓客户端正在测试：真实运动传感器、后台定位、应用内更新。APK 发布之前，网页版已经具备完整的捕捉流程。",
              )}
            </p>
            <Link
              to="/app"
              className="label-caps mt-5 inline-block rounded-md bg-primary px-6 py-3 text-xs text-primary-foreground shadow-[var(--shadow-glossy)]"
            >
              {t("APK soon — open the web app", "APK 即将发布 · 先用网页版")}
            </Link>

          </Panel>
          <Panel>
            <h3 className="text-lg">iOS</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(
                "Open the web app in Safari, tap Share, then Add to Home Screen. It behaves like a native app minus background GPS. The store build is in review.",
                "用 Safari 打开网页版，点分享，再选「添加到主屏幕」。除了后台定位，其余体验与原生应用一致。App Store 版本审核中。",
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
                "You can browse the whole world map and the vault from a laptop. You cannot catch anything — the accuracy check will refuse a wifi fix, on purpose.",
                "你可以在电脑上浏览整张世界地图和金库，但抓不到任何东西——精度校验会主动拒绝 Wi-Fi 定位。",
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

      <Section title={t("Permissions we ask for, and why", "我们申请哪些权限，为什么")}>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            [
              t("Precise location", "精确定位"),
              t(
                "The whole game. Coarse location is refused because it cannot tell a door from a block.",
                "游戏的全部。粗略定位会被拒绝，因为它分不清一扇门和一整个街区。",
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
              t("Nothing else", "别的都不要"),
              t(
                "No contacts, no photos, no ad id. The app has no account, only a wallet.",
                "不要通讯录、不要相册、不要广告标识。没有账号体系，只有钱包。",
              ),
            ],
            [
              t("What we store", "我们存什么"),
              t(
                "Your position log for the anti-cheat window, your catches, and your wallet address. That is the list.",
                "反作弊时间窗内的定位日志、你的领取记录、你的钱包地址。就这些。",
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
