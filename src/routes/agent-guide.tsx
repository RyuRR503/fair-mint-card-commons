import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE_PREVIEW_META } from "@/lib/site-preview";
import { Section, Panel } from "@/components/site/Section";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/agent-guide")({
  head: () => ({
    meta: [
      { title: "CATCH — Binance Agentic Wallet setup guide" },
      { name: "description", content: "Install the Binance Agentic Wallet skill, sign in, enable Developer Mode and claim CATCH rewards with your AI." },
      { property: "og:title", content: "Set up your Binance Agentic Wallet for CATCH" },
      { property: "og:description", content: "Four steps from installing the skill to your first on-site claim." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      ...SITE_PREVIEW_META,
    ],
  }),
  component: AgentGuide,
});

function Code({ children }: { children: string }) {
  return <code className="mt-3 block overflow-x-auto whitespace-pre-wrap break-all rounded-md border-l-2 border-primary bg-secondary/35 p-3 font-mono text-xs text-primary">{children}</code>;
}

function AgentGuide() {
  const t = useT();
  const steps = [
    {
      title: t("Prepare", "准备"),
      body: t("You need a Binance account and an MPC Wallet created in the Binance App, plus an AI agent that can run skills (for example Claude Code, Cursor or OpenClaw) on a computer with Node.js 18+.", "需要一个币安账户，并在币安 App 里先创建 MPC 钱包；再准备一个能装 Skill 的 AI（如 Claude Code、Cursor、OpenClaw），电脑装好 Node.js 18 以上。"),
    },
    {
      title: t("Install the skill", "安装 Skill"),
      body: t("Run this once. The baw command-line tool installs itself on first use.", "运行一次即可，baw 命令行工具会在第一次使用时自动安装。"),
      code: "npx skills add binance/binance-skills-hub/skills/binance-web3/binance-agentic-wallet",
    },
    {
      title: t("Sign in", "登录"),
      body: t("Tell your AI the sentence below. It returns a link: open it on your phone or scan it with the Binance App and confirm. First-time users are guided to create an Agentic Wallet.", "对 AI 说下面这句话，它会给你一个链接：手机上点开会跳到币安 App，网页上用币安 App 扫码确认。第一次登录会引导你创建 Agent 钱包。"),
      code: t("Sign in to Binance Agentic Wallet", "登录币安 Agent 钱包"),
    },
    {
      title: t("Turn on Developer Mode", "开启开发者模式"),
      body: t("CATCH claims are a contract call, which the wallet only allows in Developer Mode. Enable it in the Binance App's Agentic Wallet settings; the AI can read but not change it. We also suggest a small daily limit.", "CATCH 领取属于“合约调用”，钱包只在开发者模式下允许。请在币安 App 的 Agent 钱包设置里开启（AI 只能读、不能改）。建议同时设置较小的每日限额。"),
    },
    {
      title: t("Hold an Agent ID", "持有 Agent ID"),
      body: t("The CATCH vault only pays wallets holding a Binance Agent ID, and only to themselves. Without one the map refuses to issue a command.", "CATCH 金库只向持有币安 Agent ID 的钱包付款，且只能领给自己。没有 Agent ID，地图不会签发指令。"),
    },
    {
      title: t("Claim on site", "到店领取"),
      body: t("Open the map at a live point, enable location, enter your Agent Wallet address and get the command. Paste it to your AI: it previews, shows you the result, and executes only after you say yes. The command is single use and valid for 15 minutes.", "到开放中的点位打开地图，开启定位，填写 Agent 钱包地址并获取指令。把指令发给 AI：它先预览并把结果给你看，你确认后才执行。指令只能用一次，15 分钟内有效。"),
    },
  ];
  return (
    <>
      <Section hero eyebrow="BINANCE AGENTIC WALLET" title={t("Set up your Agent Wallet", "Agent 钱包设置教程")} lead={t("About ten minutes, once. After that every claim is: walk there, copy the command, confirm with your AI.", "只需设置一次，大约十分钟。之后每次领取都是：到店、复制指令、和 AI 确认。")} className="mt-10" />
      <Section title={t("Step by step", "分步说明")}>
        <ol className="mt-6 grid gap-4 md:grid-cols-2">
          {steps.map((s, i) => (
            <li key={s.title}>
              <Panel className="h-full">
                <p className="text-sm font-semibold"><span className="mr-2 font-mono text-primary">0{i + 1}</span>{s.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
                {s.code && <Code>{s.code}</Code>}
              </Panel>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-xs text-muted-foreground">
          {t("Source: Binance Open Platform, Install Agentic Wallet; binance-skills-hub. Steps may change with new skill versions.", "来源：币安开放平台《Install Agentic Wallet》与 binance-skills-hub 官方仓库，Skill 更新后步骤可能变化。")}{" "}
          <a className="text-primary underline" href="https://developers.binance.com/docs/agentic-wallet/quickstart/install-agentic-wallet" target="_blank" rel="noreferrer">{t("Official guide", "官方说明")}</a>
        </p>
        <Link to="/app" className="label-caps mt-6 inline-block rounded-md bg-primary px-6 py-3 text-xs text-primary-foreground">{t("Open the map", "打开地图")}</Link>
      </Section>
    </>
  );
}
