import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { COMING_SOON_PATH } from "@/lib/site-gate";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { HuntBackdrop } from "@/components/site/HuntBackdrop";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteMotion } from "@/components/site/SiteMotion";
import { LangProvider } from "@/lib/i18n";
import { reportLovableError } from "../lib/lovable-error-reporting";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="label-caps text-[10px] text-primary">signal lost</p>
        <h1 className="mt-4 font-latin text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl text-foreground">这里没有信号</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          页面不存在，或者已经被移到别处了。
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          这一页没能加载
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          我们这边出了点问题。可以刷新重试，或者回到首页。
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            重试
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            返回首页
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: "CATCH" },
      { name: "theme-color", content: "#060606" },
      { name: "color-scheme", content: "dark" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@CATCHFUN_BSC" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://tiles.openfreemap.org", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://tiles.openfreemap.org" },

      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;700;900&family=JetBrains+Mono:wght@500&display=swap",
      },

    ],
  }),

  beforeLoad: () => {
    // Coming-soon gate removed: the published site now serves the full experience.
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent as never,
});

function RootShell({ children }: { children: ReactNode }) {
  const pathname = useLocation({ select: location => location.pathname });
  const standaloneCards = pathname === "/agent-cards" || pathname.startsWith("/agent-cards/");
  return (
    <html lang="zh-Hans">
      <head>
        {!standaloneCards && <>
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-catch-16.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-catch-32.png" />
          <link rel="icon" type="image/png" sizes="64x64" href="/favicon-catch.png" />
          <link rel="apple-touch-icon" type="image/png" sizes="180x180" href="/apple-touch-icon-catch.png" />
        </>}
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useLocation({ select: (location) => location.pathname });
  const standaloneCards = pathname === "/agent-cards" || pathname.startsWith("/agent-cards/");

  return (
    <QueryClientProvider client={queryClient}>
      <LangProvider>
        {!standaloneCards && <HuntBackdrop />}
        <div className="relative flex min-h-screen flex-col">
          {!standaloneCards && pathname !== COMING_SOON_PATH && <SiteHeader />}
          {!standaloneCards && pathname !== COMING_SOON_PATH && <SiteMotion />}
          <main className="flex-1">
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <div key={pathname} className="site-page"><Outlet /></div>
          </main>
          {!standaloneCards && pathname !== COMING_SOON_PATH && <SiteFooter />}
          {/* global film grain — static, never animated */}
          <div className="pointer-events-none fixed inset-0 z-50 grain" aria-hidden />
        </div>
      </LangProvider>
    </QueryClientProvider>
  );
}

