import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window { turnstile?: TurnstileApi }
}

const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let loading: Promise<void> | null = null;
function loadScript() {
  if (window.turnstile) return Promise.resolve();
  loading ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => { loading = null; reject(new Error("turnstile")); };
    document.head.appendChild(s);
  });
  return loading;
}

export type HumanCheckHandle = { token: () => string | null; reset: () => void };

/** Cloudflare Turnstile human check; most visitors pass without clicking. */
export const HumanCheck = forwardRef<HumanCheckHandle, { siteKey: string; lang: "en" | "zh" }>(
  function HumanCheck({ siteKey, lang }, ref) {
    const box = useRef<HTMLDivElement>(null);
    const widget = useRef<string | null>(null);
    const tokenRef = useRef<string | null>(null);
    const [failed, setFailed] = useState(false);

    useImperativeHandle(ref, () => ({
      token: () => tokenRef.current,
      reset: () => {
        tokenRef.current = null;
        if (widget.current && window.turnstile) window.turnstile.reset(widget.current);
      },
    }));

    useEffect(() => {
      let alive = true;
      loadScript()
        .then(() => {
          if (!alive || !box.current || !window.turnstile) return;
          widget.current = window.turnstile.render(box.current, {
            sitekey: siteKey,
            theme: "dark",
            language: lang === "zh" ? "zh-cn" : "en",
            callback: (t: string) => { tokenRef.current = t; },
            "expired-callback": () => { tokenRef.current = null; },
            "error-callback": () => { tokenRef.current = null; },
          });
        })
        .catch(() => alive && setFailed(true));
      return () => {
        alive = false;
        if (widget.current && window.turnstile) window.turnstile.remove(widget.current);
        widget.current = null;
      };
    }, [siteKey, lang]);

    return (
      <div className="mt-3">
        <div ref={box} />
        {failed && (
          <p className="mt-2 text-xs text-destructive">
            {lang === "zh" ? "真人验证加载失败，请刷新页面。" : "Human check failed to load. Refresh the page."}
          </p>
        )}
      </div>
    );
  },
);
