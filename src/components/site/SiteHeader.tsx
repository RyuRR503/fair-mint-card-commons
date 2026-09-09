import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useLang, useT } from "@/lib/i18n";

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
        <button
          key={l}
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
        </button>
      ))}
    </div>
  );
}

/**
 * The reticle: four camera-style focus corners around a single signal dot.
 * Not a game crosshair — a viewfinder.
 */
export function CatchMark({ className = "" }: { className?: string }) {
  return (
    <span className={`group relative grid size-9 shrink-0 place-items-center ${className}`}>
      {[
        "left-0 top-0 border-l border-t",
        "right-0 top-0 border-r border-t",
        "left-0 bottom-0 border-l border-b",
        "right-0 bottom-0 border-r border-b",
      ].map((pos) => (
        <span
          key={pos}
          className={`absolute size-2.5 border-primary/70 transition-all duration-300 ${pos}`}
        />
      ))}
      <span className="size-1.5 rounded-full bg-primary shadow-[0_0_14px_var(--signal)]" />
    </span>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const t = useT();
  const { lang } = useLang();
  const NAV = useNav();
  const navText = lang === "zh" ? "text-[13px]" : "text-[10px]";


  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 px-3 py-3 backdrop-blur-xl sm:px-5">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="CATCH home">
          <CatchMark />
          <span className="font-latin text-base font-semibold uppercase tracking-[0.42em]">CATCH</span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "!text-primary bg-primary/10" }}
              className={`label-caps rounded-md px-2.5 py-2 ${navText} text-muted-foreground transition-colors hover:text-foreground`}
            >
              {item.label}
            </Link>
          ))}
        </nav>


        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <LangToggle className="hidden sm:flex" />
          <Link
            to="/app"
            className={`label-caps rounded-md bg-primary px-4 py-2.5 ${navText} text-primary-foreground halation transition-all duration-300 hover:shadow-[var(--shadow-glossy)]`}
          >
            {t("Start hunting", "开始抓取")}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-md border border-border lg:hidden"
            aria-label={t("Toggle menu", "菜单")}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="glass-panel mx-auto mt-2 grid max-w-6xl gap-1 rounded-md p-3 lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "!text-primary bg-primary/10" }}
              className="label-caps rounded-md px-4 py-3 text-[11px] text-muted-foreground"
            >
              {item.label}
            </Link>
          ))}
          <LangToggle className="mt-2 w-fit sm:hidden" />
        </nav>
      )}
    </header>
  );
}
