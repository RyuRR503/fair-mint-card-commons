import { Link } from "@tanstack/react-router";
import { CHAIN } from "@/lib/tokens";
import { useT } from "@/lib/i18n";
import { CatchMark, LangToggle } from "@/components/site/SiteHeader";

export function SiteFooter() {
  const t = useT();

  return (
    <footer className="mx-auto mt-32 max-w-6xl px-5 pb-16">
      <div className="border-t border-border pt-10">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <CatchMark className="!h-9" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {t(
                `Tokenized stock fragments appear at real coordinates. Planned flow: phone GPS → AI command → Agent Wallet claims on ${CHAIN.name}. Live integration is pending.`,
                `代币化的股票碎片出现在真实坐标上。真人到店定位，AI 接收指令，Agent 钱包在 ${CHAIN.name} 领取。所有碎片仅限 Agent，真实接入待完成。`,
              )}
            </p>
            <LangToggle className="mt-5 w-fit" />
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm sm:grid-cols-3">
            <FooterLink to="/app">{t("Map & catch", "抓取地图")}</FooterLink>
            <FooterLink to="/how-it-works">{t("How it works", "玩法说明")}</FooterLink>
            <FooterLink to="/legendary">{t("Legendary", "每日传奇")}</FooterLink>
            <FooterLink to="/proof">{t("Proof of reserves", "金库储备")}</FooterLink>
            <FooterLink to="/sponsor">{t("Sponsor a spot", "品牌合作")}</FooterLink>
            <FooterLink to="/roadmap">{t("Roadmap", "开发计划")}</FooterLink>
            <FooterLink to="/download">{t("Get the app", "下载 App")}</FooterLink>
            <FooterLink to="/docs">{t("Docs", "开发文档")}</FooterLink>

            <a
              href="https://x.com/catchonchain"
              target="_blank"
              rel="noreferrer noopener"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              𝕏 catchonchain
            </a>
          </div>
        </div>

        <p className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          {t(
            `Chain id ${CHAIN.id} · ${CHAIN.name} · Fragments are transferred out of a funded vault. Nothing is minted on catch. 18+ only. Not investment advice.`,
            `链 ID ${CHAIN.id} · ${CHAIN.name} · 碎片从已注资的金库转出，捕捉时不增发任何代币。仅限 18 岁以上。不构成投资建议。`,
          )}
        </p>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="text-muted-foreground transition-colors hover:text-foreground">
      {children}
    </Link>
  );
}
