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
  const code = "CATCH-DEMO-0000";
  const example = t(
    `Use my Binance Agent Wallet on BSC to claim CATCH reward. Claim code: ${code}. Fetch the voucher from catch.fun with this code, then call claimGameVoucher on the CATCH vault from this same Agent wallet. The code expires in ${AGENT_CLAIMS.commandTtlMinutes} minutes.`,
    `请用我的币安 Agent 钱包在 BSC 上领取 CATCH 奖励。领取码：${code}。请用此领取码从 catch.fun 获取领奖凭证，并由同一个 Agent 钱包调用 CATCH 金库的 claimGameVoucher 完成领取。领取码 ${AGENT_CLAIMS.commandTtlMinutes} 分钟内有效。`,
  );

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
        {!compact && <><p className="label-caps text-primary">HUMAN × AGENT</p><h2 className="mt-4 text-balance text-[1.75rem] sm:text-4xl">{t("Location verification and Agent claims", "定位验证与 Agent 领取")}</h2></>}
        <ol className="agent-steps mt-5 divide-y divide-border">
          {[
            { icon: MapPin, name: t("Arrive at the location", "抵达指定地点"), detail: t("Arrive at the designated venue to begin on-site verification.", "抵达地图标注的真实场所，启动现场位置验证。") },
            { icon: Terminal, name: t("Complete location verification", "完成定位验证"), detail: t(`After checks pass, receive a command valid for ${AGENT_CLAIMS.commandTtlMinutes} minutes.`, `接入完成后，通过距离、精度与连续定位校验，可获取有效期 ${AGENT_CLAIMS.commandTtlMinutes} 分钟的一次性指令。`) },
            { icon: Wallet, name: t("Agent Wallet claim", "Agent 钱包领取"), detail: t("Send the command to your AI. Its Agent Wallet submits the claim on BSC.", "将指令发送给 AI，由币安 Agent 钱包在 BSC 提交领取交易。") },
          ].map(({ icon: Icon, name, detail }, i) => <li key={name} className="flex gap-3 py-4"><Icon className="mt-1 size-5 shrink-0 text-primary" /><div><p className="text-sm font-semibold"><span className="mr-2 font-mono text-muted-foreground">0{i + 1}</span>{name}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div></li>)}
        </ol>
      </div>
      <div className="agent-terminal overflow-hidden rounded-md border border-primary/25 bg-background-deep lg:mt-1">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3"><span className="flex items-center gap-2 text-sm font-semibold"><Bot className="size-4 text-primary" />CATCH / Agent</span><span className="text-[11px] text-muted-foreground">{t("FLOW PREVIEW", "流程预览")}</span></div>
        <div className="space-y-4 p-4 sm:p-5">
          <p className="text-sm text-muted-foreground">{t("Binance Agentic Wallet · planned claim experience", "币安 Agent 钱包 · 领取流程预览")}</p>
          <div className="min-h-32 space-y-4">
          {!preview ? <div className="flex min-h-32 items-center justify-center border-y border-dashed border-border"><Button variant="outline" className="btn-arrow" onClick={() => setPreview(true)}><Terminal />{t("Get Agent command", "获取 Agent 指令")}</Button></div> : <>
            <div className="command-reveal flex items-center justify-between gap-2 border-l-2 border-primary bg-secondary/35 p-3"><code className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-primary">{example}<span className="terminal-caret" aria-hidden="true">▍</span></code><Button variant="ghost" size="icon" onClick={copyExample} aria-label={t("Copy Agent command", "复制 Agent 指令")} title={t("Copy Agent command", "复制 Agent 指令")}>{copied ? <Check /> : <Copy />}</Button></div>
            <p role="status" className="text-xs text-muted-foreground">{copied ? t("Example copied. It cannot claim tokens.", "已复制示例，不能用于真实领取。") : t("Example only. No GPS proof, voucher, or transaction is generated.", "仅作示例：未签发定位凭证，也不会发送交易。")}</p>
            <div className="flex gap-2 border-t border-border pt-4 text-sm"><Bot className="mt-1 size-4 shrink-0 text-primary" /><p>{t("Live Agent claims are not connected yet. There is no payout from this preview.", "Agent 领取功能接入中，此预览不发放代币化美股碎片。")}</p></div>
          </>}
          </div>
          {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
          <p className="border-t border-border pt-3 text-xs text-muted-foreground">{t("Common, rare, epic, legendary: the same Agent-only rule. AI cannot replace your presence or bypass cooldowns.", "所有稀有度均仅限 Agent 钱包领取。现场验证与冷却限制同样适用，AI 不替代用户到场。")}</p>
        </div>
      </div>
    </div>
  );
}