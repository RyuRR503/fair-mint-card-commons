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
            ? t("Your enquiry has been received. We will contact you about the partnership.", "合作意向已提交，我们将通过邮箱与您联系。")
            : t(
                "Registration received. We will email you about availability in your city.",
                "登记成功。所在城市开放后，我们将通过邮箱通知您。",
              ),
        );
      } else {
        setState("error");
        setMessage("error" in res ? res.error : t("Submission failed.", "提交失败，请稍后重试。"));
      }
    } catch {
      setState("error");
      setMessage(t("Submission failed. Please try again.", "提交失败，请重试。"));
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
            placeholder={t("Your brand", "品牌名称")}
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
            placeholder={t("Where should signals appear?", "意向城市")}
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
            : t("Join the list", "登记意向")}
      </button>

      {state === "error" && <p className="w-full text-sm text-destructive">{message}</p>}
    </form>
  );
}
