import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { earlyAccess } from "@/lib/game.functions";
import { useT } from "@/lib/i18n";

export function WaitlistForm({ kind = "walker" }: { kind?: "walker" | "brand" | "city" }) {
  const t = useT();
  const submit = useServerFn(earlyAccess);
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [company, setCompany] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const isBrand = kind === "brand";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const res = await submit({
        data: { email, kind, city: city || undefined, company: company || undefined },
      });
      if ("ok" in res && res.ok) {
        setState("done");
        setMessage(
          isBrand
            ? t("Got it. Sponsor mail gets answered first.", "收到。品牌合作的邮件我们最先回。")
            : t(
                "You are on the list. We will tell you when your city lights up.",
                "已加入名单。你所在的城市一上线我们就通知你。",
              ),
        );
      } else {
        setState("error");
        setMessage("error" in res ? res.error : t("Something went wrong.", "出了点问题。"));
      }
    } catch {
      setState("error");
      setMessage(t("Something went wrong. Try again.", "出了点问题，请重试。"));
    }
  }

  if (state === "done") {
    return <p className="label-caps text-sm text-primary">{message}</p>;
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
      <label className="min-w-[220px] flex-1">
        <span className="label-caps text-[10px] text-muted-foreground">
          {t("Email", "邮箱")}
        </span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@somewhere.com"
          className="mt-1 w-full rounded-md border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </label>

      {isBrand ? (
        <label className="min-w-[200px] flex-1">
          <span className="label-caps text-[10px] text-muted-foreground">
            {t("Company", "公司")}
          </span>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder={t("Your brand", "你的品牌")}
            className="mt-1 w-full rounded-md border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
      ) : (
        <label className="min-w-[200px] flex-1">
          <span className="label-caps text-[10px] text-muted-foreground">
            {t("City", "城市")}
          </span>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t("Where should signals appear?", "希望信号出现在哪里？")}
            className="mt-1 w-full rounded-md border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        className="label-caps rounded-md bg-primary px-6 py-3.5 text-[11px] text-primary-foreground shadow-[var(--shadow-glossy)] disabled:opacity-60"
      >
        {state === "sending"
          ? t("Sending…", "发送中…")
          : isBrand
            ? t("Talk to us", "联系我们")
            : t("Join the list", "加入名单")}
      </button>

      {state === "error" && <p className="w-full text-sm text-destructive">{message}</p>}
    </form>
  );
}
