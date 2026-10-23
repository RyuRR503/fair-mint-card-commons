import { useState } from "react";
import { Bot, Check, Copy, MapPin, Terminal, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AGENT_CLAIMS } from "@/lib/agent-claims";
import { useT } from "@/lib/i18n";

export function AgentStatus() {
  const t = useT();
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-primary/20 py-4 text-xs">
      <span className="flex items-center gap-2 font-semibold text-primary"><Bot className="size-4" />{t("Agent-only claims", "所有碎片 · 仅限 Agent 钱包领取")}</span>
      <span className="text-muted-foreground">{t("Integration pending · No live claims", "接入尚未完成 · 暂未开放真实领取")}</span>
    </div>
  );
}

export function AgentJourney({ compact = false }: { compact?: boolean }) {
  const t = useT();
  const [preview, setPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const example = "catch AAPLB-DEMO";

  async function copyExample() {
    try {
      await navigator.clipboard.writeText(example);
      setCopied(true);
      setError("");
    } catch {
      setError(t("Copy unavailable. Select the example text instead.", "无法复制，请选中示例文字手动复制。"));
    }
  }

  return (
    <div className={compact ? "space-y-5" : "grid items-start gap-10 lg:grid-cols-[1fr_1fr]"}>
      <div>
        {!compact && <><p className="label-caps text-primary">HUMAN × AGENT</p><h2 className="mt-4 text-balance text-[1.75rem] sm:text-4xl">{t("You walk. Your Agent claims.", "你负责到场，Agent 负责领取。")}</h2></>}
        <ol className="agent-steps mt-5 divide-y divide-border">
          {[
            { icon: MapPin, name: t("Human · phone GPS", "真人 · 手机定位"), detail: t("Walk to the venue and pass the presence checks.", "走到真实点位，通过距离、精度和连续定位校验。") },
            { icon: Terminal, name: t("Command · single use", "指令 · 一次有效"), detail: t(`After checks pass, receive a command valid for ${AGENT_CLAIMS.commandTtlMinutes} minutes.`, `接通后，校验通过才会签发 ${AGENT_CLAIMS.commandTtlMinutes} 分钟有效的指令。`) },
            { icon: Wallet, name: t("Agent · wallet claim", "Agent · 钱包领取"), detail: t("Send the command to your AI. Its Agent Wallet submits the claim on BSC.", "把指令发给你的 AI，由 Agent 钱包提交 BSC 领取交易。") },
          ].map(({ icon: Icon, name, detail }, i) => <li key={name} className="flex gap-3 py-4"><Icon className="mt-1 size-5 shrink-0 text-primary" /><div><p className="text-sm font-semibold"><span className="mr-2 font-mono text-muted-foreground">0{i + 1}</span>{name}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div></li>)}
        </ol>
      </div>
      <div className="agent-terminal overflow-hidden rounded-md border border-primary/25 bg-background-deep lg:mt-1">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3"><span className="flex items-center gap-2 text-sm font-semibold"><Bot className="size-4 text-primary" />CATCH / Agent</span><span className="text-[11px] text-muted-foreground">{t("FLOW PREVIEW", "流程预览")}</span></div>
        <div className="space-y-4 p-4 sm:p-5">
          <p className="text-sm text-muted-foreground">{t("Binance Agentic Wallet · planned claim experience", "币安 Agent AI 钱包 · 计划中的领取体验")}</p>
          <div className="min-h-32">
          {!preview ? <div className="flex min-h-32 items-center justify-center border-y border-dashed border-border"><Button variant="outline" className="btn-arrow" onClick={() => setPreview(true)}><Terminal />{t("Preview AI command", "预览 AI 指令")}</Button></div> : <>
            <div className="command-reveal flex items-center justify-between gap-2 border-l-2 border-primary bg-secondary/35 p-3"><code className="break-all font-mono text-sm text-primary">{example}<span className="terminal-caret" aria-hidden="true">▍</span></code><Button variant="ghost" size="icon" onClick={copyExample} aria-label={t("Copy example command", "复制示例指令")} title={t("Copy example command", "复制示例指令")}>{copied ? <Check /> : <Copy />}</Button></div>
            <p role="status" className="text-xs text-muted-foreground">{copied ? t("Example copied. It cannot claim tokens.", "已复制示例，不能用于真实领取。") : t("Example only. No GPS proof, voucher, or transaction is generated.", "仅作示例：未签发定位凭证，也不会发送交易。")}</p>
            <div className="flex gap-2 border-t border-border pt-4 text-sm"><Bot className="mt-1 size-4 shrink-0 text-primary" /><p>{t("Live Agent claims are not connected yet. There is no payout from this preview.", "Agent 真实领取尚未接通，此预览不会发放股票碎片。")}</p></div>
          </>}
          </div>
          {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
          <p className="border-t border-border pt-3 text-xs text-muted-foreground">{t("Common, rare, epic, legendary: the same Agent-only rule. AI cannot replace your presence or bypass cooldowns.", "普通、稀有、史诗、传奇：全部仅限 Agent 钱包。AI 不能代替真人到场，也不能绕过冷却。")}</p>
        </div>
      </div>
    </div>
  );
}