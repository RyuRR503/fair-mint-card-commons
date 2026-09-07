import { Link } from "@tanstack/react-router";
import { CHAIN } from "@/lib/tokens";

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-24 max-w-7xl px-4 pb-14">
      <div className="glass-panel rounded-[2rem] p-8 sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-primary font-display text-base font-extrabold text-primary-foreground">
                TG
              </span>
              <span className="label-caps text-sm">Touch Grass</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Real tokenized stocks spawn at real places. Walk there, tap, and the fragment
              lands in your wallet on {CHAIN.name}.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm sm:grid-cols-3">
            <FooterLink to="/how-it-works">How it works</FooterLink>
            <FooterLink to="/legendary">Legendary</FooterLink>
            <FooterLink to="/proof">Proof of reserves</FooterLink>
            <FooterLink to="/sponsor">Sponsor a spot</FooterLink>
            <FooterLink to="/roadmap">Roadmap</FooterLink>
            <FooterLink to="/docs">Docs</FooterLink>
            <FooterLink to="/download">Get the app</FooterLink>
            <FooterLink to="/app">Open the app</FooterLink>
            <a
              href="https://x.com/TouchGrassRWA"
              target="_blank"
              rel="noreferrer noopener"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              𝕏 TouchGrassRWA
            </a>
          </div>
        </div>

        <p className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          Chain id {CHAIN.id} · {CHAIN.name} · Fragments are transferred from a funded vault.
          Nothing is minted. 18+ only. Not investment advice.
        </p>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="text-muted-foreground transition-colors hover:text-foreground"
    >
      {children}
    </Link>
  );
}
