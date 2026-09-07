import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useLang, useT } from "@/lib/i18n";

function useNav() {
  const t = useT();
  return [
    { to: "/", label: t("Home", "首页") },
    { to: "/how-it-works", label: t("How it works", "玩法") },
    { to: "/legendary", label: t("Legendary", "传奇") },
    { to: "/sponsor", label: t("Sponsor", "品牌合作") },
    { to: "/proof", label: t("Proof", "储备证明") },
    { to: "/roadmap", label: t("Roadmap", "路线图") },
    { to: "/download", label: t("Get the app", "下载") },
    { to: "/docs", label: t("Docs", "文档") },
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

export function CatchMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`relative grid size-9 shrink-0 place-items-center rounded-md border border-primary/50 bg-primary/10 ${className}`}
    >
      <span className="absolute inset-1 rounded-sm border border-primary/30" />
      <span className="size-1.5 rounded-full bg-primary shadow-[0_0_12px_var(--signal)]" />
    </span>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const t = useT();
  const NAV = useNav();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 px-3 py-3 backdrop-blur-xl sm:px-5">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="CATCH home">
          <CatchMark />
          <span className="label-caps text-base tracking-[0.32em]">CATCH</span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "!text-primary bg-primary/10" }}
              className="label-caps rounded-md px-2.5 py-2 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <LangToggle className="hidden sm:flex" />
          <Link
            to="/app"
            className="label-caps rounded-md bg-primary px-4 py-2.5 text-[10px] text-primary-foreground shadow-[var(--shadow-glossy)] transition-transform hover:-translate-y-0.5"
          >
            {t("Start hunting", "开始捕捉")}
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
        <nav className="glass-panel mx-auto mt-2 grid max-w-7xl gap-1 rounded-xl p-3 lg:hidden">
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
