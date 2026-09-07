import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { earlyAccess } from "@/lib/game.functions";

export function WaitlistForm({ kind = "walker" }: { kind?: "walker" | "brand" | "city" }) {
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
            ? "Got it. We answer sponsor mail first."
            : "You are on the list. We will tell you when your city lights up.",
        );
      } else {
        setState("error");
        setMessage("error" in res ? res.error : "Something went wrong.");
      }
    } catch {
      setState("error");
      setMessage("Something went wrong. Try again.");
    }
  }

  if (state === "done") {
    return <p className="label-caps text-sm text-primary-foreground/80">{message}</p>;
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
      <label className="flex-1 min-w-[220px]">
        <span className="label-caps text-[10px] text-muted-foreground">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@somewhere.com"
          className="mt-1 w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </label>

      {isBrand ? (
        <label className="flex-1 min-w-[200px]">
          <span className="label-caps text-[10px] text-muted-foreground">Company</span>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Your brand"
            className="mt-1 w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
      ) : (
        <label className="flex-1 min-w-[200px]">
          <span className="label-caps text-[10px] text-muted-foreground">City</span>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Where should we spawn?"
            className="mt-1 w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        className="label-caps rounded-full bg-primary px-6 py-3.5 text-xs text-primary-foreground shadow-[var(--shadow-glossy)] disabled:opacity-60"
      >
        {state === "sending" ? "Sending…" : isBrand ? "Talk to us" : "Join the list"}
      </button>

      {state === "error" && (
        <p className="w-full text-sm text-destructive">{message}</p>
      )}
    </form>
  );
}
