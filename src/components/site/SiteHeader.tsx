import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/legendary", label: "Legendary" },
  { to: "/sponsor", label: "Sponsor" },
  { to: "/proof", label: "Proof" },
  { to: "/roadmap", label: "Roadmap" },
  { to: "/download", label: "Get the app" },
  { to: "/docs", label: "Docs" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-5">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <Link
          to="/"
          className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary font-display text-lg font-extrabold text-primary-foreground shadow-[var(--shadow-glossy)]"
          aria-label="Touch Grass home"
        >
          TG
        </Link>

        <nav className="glass-panel hidden flex-1 items-center justify-center gap-1 rounded-full px-2 py-1.5 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "bg-foreground text-background" }}
              className="label-caps rounded-full px-3 py-2 text-[11px] text-foreground/70 transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Link
            to="/app"
            className="label-caps rounded-full bg-primary px-5 py-3 text-[11px] text-primary-foreground shadow-[var(--shadow-glossy)] transition-transform hover:-translate-y-0.5"
          >
            Open app
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="glass-panel grid size-11 place-items-center rounded-2xl lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="glass-panel mx-auto mt-2 grid max-w-7xl gap-1 rounded-3xl p-3 lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "bg-foreground text-background" }}
              className="label-caps rounded-2xl px-4 py-3 text-xs text-foreground/75"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
