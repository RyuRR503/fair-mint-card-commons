import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useLang, useT } from "@/lib/i18n";
import catchLogo from "@/assets/catch-logo-wide.png";

function useNav() {
  const t = useT();
  return [
    { to: "/", label: t("Home", "首页") },
    { to: "/app", label: t("Map & catch", "抓取地图") },
    { to: "/how-it-works", label: t("How it works", "玩法说明") },
    { to: "/legendary", label: t("Legendary", "每日传奇") },
    { to: "/proof", label: t("Proof", "金库储备") },
    { to: "/sponsor", label: t("Sponsor", "品牌合作") },
    { to: "/roadmap", label: t("Roadmap", "开发计划") },
    { to: "/download", label: t("Get the app", "下载 App") },
    { to: "/docs", label: t("Docs", "开发文档") },
  ] as const;
}


export function LangToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <div
      className={`flex items-center rounded-md border border-border bg-card/60 p-0.5 text-[10px] ${className}`}
    >
      {(["en", "zh"] as const).map((l) => (
        <Button
          key={l}
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`label-caps rounded px-2 py-1.5 transition-colors ${
            lang === l
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l === "en" ? "EN" : "中"}
        </Button>
      ))}
    </div>
  );
}

/**
 * The CATCH logo: refined gold lettering whose A carries a glowing agent "eye".
 */
export function CatchMark({ className = "" }: { className?: string }) {
  return (
    <img
      src={catchLogo}
      alt="CATCH"
      draggable={false}
      className={`h-9 w-auto shrink-0 select-none ${className}`}
    />
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const t = useT();
  const { lang } = useLang();
  const NAV = useNav();
  const navText = lang === "zh" ? "text-[13px]" : "text-[10px]";
  const menuToggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      menuToggle.current?.focus();
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <header className="site-header sticky top-0 z-40 border-b border-border/60 bg-background/85 px-3 py-3 backdrop-blur-xl sm:px-5">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="CATCH home">
          <CatchMark />
        </Link>

        <nav aria-label={t("Main navigation", "主导航")} className="hidden min-w-0 flex-1 items-center justify-center gap-0 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "!text-primary is-active" }}
              className={`site-nav-link label-caps truncate px-1.5 py-2 lg:px-2 ${navText} text-muted-foreground transition-colors hover:text-foreground`}
            >
              {item.label}
            </Link>
          ))}
        </nav>


        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
          <LangToggle className="hidden sm:flex" />
          <Button asChild className={`label-caps rounded-sm px-4 py-2.5 ${navText}`}>
            <Link to="/app">{t("Start hunting", "开始抓取")} <span aria-hidden>↗</span></Link>
          </Button>

          <Button
            ref={menuToggle}
            variant="outline"
            size="icon"
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-md border border-border lg:hidden"
            aria-label={t("Toggle menu", "菜单")}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <nav id="mobile-navigation" aria-label={t("Main navigation", "主导航")} className="mobile-navigation mx-auto mt-3 grid max-h-[calc(100dvh-90px)] max-w-6xl grid-cols-2 gap-1 overflow-y-auto border-t border-border pt-3 lg:hidden">
          {NAV.map((item, i) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "!text-primary bg-primary/10" }}
              className={`flex items-center gap-3 rounded-md px-3 py-3 ${lang === "zh" ? "text-[14px]" : "text-[12px]"} text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground`}
            >
              <span aria-hidden className="font-mono text-[10px] text-primary/60">0{i + 1}</span>
              {item.label}
            </Link>
          ))}
          <LangToggle className="col-span-2 mt-2 w-fit sm:hidden" />
        </nav>
      )}
    </header>
  );
}
