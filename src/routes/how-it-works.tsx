import { TIER_USD } from "@/lib/allocation";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE_PREVIEW_META } from "@/lib/site-preview";
import { AgentJourney, AgentStatus } from "@/components/site/AgentJourney";
import { Section, Panel } from "@/components/site/Section";
import { TokenChip } from "@/components/site/TokenChip";
import { RULES } from "@/lib/game.functions";
import { COOLDOWN_MIN, TOKENS, RARITY_LABEL, type Rarity } from "@/lib/tokens";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How CATCH works — GPS, AI command and Agent Wallet" },
      {
        name: "description",
        content:
          "CATCH location verification, single-use commands, Agent-only claim rules, vault funding and anti-cheat checks on BNB Smart Chain.",
      },
      { property: "og:title", content: "How CATCH works" },
      {
        property: "og:description",
        content:
          "Agent-only claim rules, GPS presence checks and 15-minute claim codes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...SITE_PREVIEW_META,
    ],
  }),
  component: HowItWorks,
});

function HowItWorks() {
  const t = useT();

  const STEPS = [
    {
      n: "01",
      h: t("Open the map and prepare an Agent Wallet.", "打开地图，准备 Agent 钱包。"),
      p: t(
        "The app reads your GPS once and draws every catchable signal around you — Apple stores, banks, internet cafés, phone shops, science museums. Nothing is sent anywhere yet.",
        "App 读取定位并展示附近点位，包括 Apple 门店、银行、网吧、手机店与科技馆。此阶段不提交领取请求。",
      ),
    },
    {
      n: "02",
      h: t("Walk up to the pin until it lights up.", "抵达点位并查看验证范围。"),
      p: t(
        `You are standing outside the Apple store on Shanghai Nanjing East Road. The app draws a circle around the pin. If your phone reports a clean fix, the circle is about ${RULES.baseRadiusM + 5} m. In a crowded downtown it can stretch to ${RULES.maxRadiusM} m — the radius grows with your own error so a real visitor does not get rejected.`,
        `以上海南京东路 Apple 门店为例，App 会标注点位验证范围。定位精度较高时，范围约 ${RULES.baseRadiusM + 5} 米；定位误差较大时，半径可调整至 ${RULES.maxRadiusM} 米，以降低现场用户被误判的可能。`,
      ),
    },
    {
      n: "03",
      h: t("Hold still for a few seconds.", "完成连续定位采样。"),
      p: t(
        `The app records at least ${RULES.minFixSamples} readings over ${RULES.minFixSeconds} seconds and reads your accelerometer. A real hand holding a real phone shakes; a mocked location sits perfectly still. That is how it tells the difference.`,
        `App 会在 ${RULES.minFixSeconds} 秒内记录至少 ${RULES.minFixSamples} 次定位，并读取加速度计。系统结合定位波动与运动数据，辅助识别异常定位；单项数据并不等同于到场证明。`,
      ),
    },
    {
      n: "04",
      h: t("The server runs the checks.", "验证位置与领取资格。"),
      p: t(
        "It measures distance, accuracy, jitter, and whether your travel since the last catch is physically possible. It also checks the site-wide hourly budget and your daily cap. If anything fails, you see a plain reason and pay zero gas.",
        "服务器会计算距离、精度、抖动，以及距上次领取的移动在现实里是否可能（比如一小时内在两座城市出现会被拒绝）；同时检查全站每小时预算和你的每日上限。任何一项未通过，系统都会说明原因，且不会产生链上交易费用。",
      ),
    },
    {
      n: "05",
      h: t("A 15-minute claim code.", "获取 15 分钟有效的领取码。"),
      p: t(
        "After GPS and rule checks pass, the site issues a single-use claim code bound to the point. You don't enter a wallet: send the instruction to your AI within 15 minutes and it adds its own Agent Wallet.",
        "定位与规则通过后，网站签发绑定点位的一次性领取码，无需填写钱包。15 分钟内把指令发给 AI，它会自动带上自己的 Agent 钱包。",
      ),
    },
    {
      n: "06",
      h: t("Your Agent submits the claim.", "Agent 提交领取。"),
      p: t(
        "Your AI uses its Binance Agentic Wallet to claim the bStocks fragment on BSC. Ordinary wallets cannot claim any rarity: the vault checks the Agent ID on-chain and pays the calling wallet itself. Gas is paid by the Agent Wallet.",
        "AI 使用币安 Agent 钱包在 BSC 领取 bStocks 碎片。普通钱包不能领取任何稀有度：金库在链上核对 Agent ID，并只把奖励转给发起交易的钱包本身。手续费由 Agent 钱包支付。",
      ),
    },
  ];

  const ANTICHEAT: [string, string][] = [
    [
      t("Radius and accuracy", "半径与精度"),
      t(
        `${RULES.baseRadiusM}–${RULES.maxRadiusM} m radius scaled to your own error bar, GPS accuracy under ${RULES.maxAccuracyM} m. Indoor and coarse IP fixes are refused.`,
        `${RULES.baseRadiusM}–${RULES.maxRadiusM} 米半径，按你自己的误差自动缩放，定位精度须优于 ${RULES.maxAccuracyM} 米。室内粗定位与 IP 定位一律拒绝。`,
      ),
    ],
    [
      t("Travel", "移动轨迹"),
      t(
        `A new catch has to be reachable from the last one: walking speed (${RULES.walkSpeedMs} m/s) under ${RULES.flightThresholdKm} km, a plane plus ${RULES.airportMinutes} minutes of airport beyond that. Two different cities inside one hour is refused whatever the distance — the rule follows the device, so a fresh wallet does not clear the trail behind your phone.`,
        `新的领取位置须符合从上一地点出发的合理移动时间：${RULES.flightThresholdKm} 公里以内按步行速度（${RULES.walkSpeedMs} 米/秒）计算，更远则按飞行加 ${RULES.airportMinutes} 分钟机场时间。一小时内出现在两座不同城市一律拒绝——规则关联设备记录，更换钱包不会重置移动轨迹。`,
      ),
    ],
    [
      t("Proof of presence", "在场证明"),
      t(
        "A real chipset wobbles by centimetres and its accuracy drifts every second. A mock provider returns the same coordinates and the same error forever, and that is exactly what we look for.",
        "真实定位芯片会有厘米级抖动，精度每秒都在变。模拟定位永远返回同一个坐标和同一个误差——系统将此类异常作为校验依据。",
      ),
    ],
    [
      t("Motion", "运动数据"),
      t("Hands shake, emulators do not. A perfect zero is refused.", "系统检查运动数据；完全为零的数据会被判定为异常并拒绝请求。"),
    ],
    [
      t("Clock and timezone", "时钟与时区"),
      t(
        `A device clock more than ${RULES.clockSkewHours} hours off the timezone of the place you claim to stand in is refused.`,
        `设备时钟与你声称所在地时区相差超过 ${RULES.clockSkewHours} 小时会被拒绝。`,
      ),
    ],
    [
      t("Cooldowns", "冷却时间"),
      t(
        `${RULES.walletCooldownMin} minutes between two catches by the same wallet. Each signal sleeps 20–120 minutes after it is caught, depending on rarity, then wakes up by itself.`,
        `同一钱包两次领取间隔 ${RULES.walletCooldownMin} 分钟。点位完成领取后，根据稀有度进入 20–120 分钟冷却，结束后按规则重新开放。`,
      ),
    ],
    [
      t("Caps", "上限"),
      t(
        `${RULES.perWalletPerDay} catches per wallet per day, and the same wallet cannot take the same signal twice within 24 hours. The whole site also has a rolling hourly budget of $${RULES.hourlyUsdCap} (priced at live Chainlink quotes) — once it is spent, catches pause until the next hour.`,
        `每个 Agent 钱包每天 ${RULES.perWalletPerDay} 次，且同一钱包 24 小时内不能重复领取同一个信号。全站还有每小时 $${RULES.hourlyUsdCap} 的滚动发放预算（按 Chainlink 实时报价折算）——用完即暂停，下一小时自动恢复。`,
      ),
    ],
    [
      t("Nonces and deadlines", "Nonce 与有效期"),
      t(
        `A voucher is single-use and expires in ${RULES.voucherTtlMin} minutes. Replays are impossible.`,
        `凭证一次性使用，${RULES.voucherTtlMin} 分钟后失效，无法重放。`,
      ),
    ],
  ];

  return (
    <>
      <Section hero
        eyebrow={t("how it works", "玩法")}
        title={t("Location verification and Agent claim rules", "定位验证与 Agent 领取规则")}
        lead={t(
          "Every rarity is intended for Agent-only claims: human GPS, AI command, Agent transaction. Map claims are live; the legendary event claim is not connected yet.",
          "所有稀有度的碎片均仅限币安 Agent 钱包领取。用户抵达指定地点并通过定位验证后，获取一次性指令，由 AI 通过 Agent 钱包提交链上领取。地图点位已可真实领取，传奇活动的领取暂未接通。",
        )}
        className="mt-10"
      />

      <section className="mx-auto max-w-6xl px-5 py-8"><AgentStatus /><div className="mt-8"><AgentJourney /></div></section>

      <Section title={t("From location discovery to on-chain claim", "从查找点位到链上领取")}>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {STEPS.map((s) => (
            <Panel key={s.n}>
              <span className="font-poster block text-6xl text-primary">{s.n}</span>
              <h3 className="mt-4 text-lg">{s.h}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.p}</p>
            </Panel>
          ))}
        </div>
      </Section>

      <Section title={t("Current reward standards by token", "各类代币的当前奖励标准")}>
        <Panel className="mt-6 overflow-x-auto p-0 sm:p-0">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="label-caps border-b border-border text-[10px] text-muted-foreground">
                <th className="px-6 py-4">{t("Token", "代币")}</th>
                <th className="px-6 py-4">{t("Where you catch it", "领取地点")}</th>
                <th className="px-6 py-4">{t("Reference value per claim", "单次参考价值")}</th>
                <th className="px-6 py-4">{t("Vault target", "目标库存")}</th>
              </tr>
            </thead>
            <tbody>
              {TOKENS.map((tk) => (
                <tr key={tk.symbol} className="border-b border-border/60 last:border-0">
                  <td className="px-6 py-3 label-caps text-xs"><span className="flex items-center gap-3"><TokenChip symbol={tk.symbol} size={34} />{tk.symbol}</span></td>
                  <td className="px-6 py-3 text-muted-foreground">{t(tk.venue, tk.venueZh)}</td>
                  <td className="px-6 py-3 font-mono text-xs">≈${TIER_USD[tk.rarity]}{tk.eventOnly && <span className="mt-1 block text-muted-foreground">{t("Not open", "暂未开放")}</span>}</td>
                  <td className="px-6 py-3 font-mono text-xs">
                    {tk.targetDrops} {t("catches", "次")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Panel>
            <h3 className="label-caps text-[11px] text-primary">{t("Value by rarity, amount by price", "价值按稀有度，数量按实时价格")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t(
                "Current reward targets are approximately $2 for common, $3.5 for rare and $7 for epic claims. Token amounts are calculated from live on-chain prices, not fixed token quantities. If these targets change, this page and the claim rules will be updated. SPCXB legendary events are not open; the $150 target is reserved for future events.",
                "目前单次奖励按稀有度设置参考价值：普通约 2 美元、稀有约 3.5 美元、史诗约 7 美元。实际代币数量按链上实时价格换算，并非固定股数。后续如调整奖励标准，本页与领取规则将同步更新。传奇 SPCXB 暂未开放，约 150 美元为后续活动的预设标准。",
              )}
            </p>

          </Panel>
          <Panel>
            <h3 className="label-caps text-[11px] text-primary">{t("Reward restocking", "奖励补货")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t(
                "Funds allocated to rewards in the vault are used to buy stock tokens and replenish the prize pool. Map availability updates as inventory changes; points without enough stock for a reward do not open.",
                "金库中用于奖励的资金会按规则买入股票代币，补充奖池。库存增加后，地图会相应更新可领取点位；库存不足的点位不会开放。",
              )}
            </p>
          </Panel>
        </div>
      </Section>

      <Section title={t("Cities and location coverage", "城市与点位覆盖范围")}>
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{t(
          "The current version has completed claim-flow testing. Additional cities, points and activities may open in stages, according to actual vault inventory. Opening every candidate point with the same limited stock would dilute rewards, so the current rule keeps the per-claim target and opens only as many points as the inventory can pay for. Candidate points are not a promise of availability; legendary events remain closed.",
          "当前版本已完成领取流程测试，后续城市、点位与活动将视金库实际库存逐步开放。同样的有限库存，如果一次开放过多点位，每份奖励就会被摊薄；因此目前保留单次奖励标准，库存够支付多少份，就开放多少个点位。候选点位不代表全部可领，传奇活动仍暂未开放。",
        )}</p>
        <Panel className="mt-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t(
              "The map covers 30 Chinese cities with 938 candidate points pinned to 7,407 real OpenStreetMap venues; how many are open at once follows the vault's real inventory and rotates daily. Beijing has 67 drops, Shanghai 63, Shenzhen 59, and Chengdu 56. A weekend in Guangzhou could take you from a bank (QQQB) near Haizhu Square to a brokerage (SPYB) in Tianhe, then a phone repair market (MUB) in Dongshan — all within the same wallet day.",
              "地图覆盖 30 座中国城市，938 个候选点位对应 7407 个 OpenStreetMap 真实门店；同时开放多少个由金库实际库存决定，并每日轮换。北京 67 个，上海 63 个，深圳 59 个，成都 56 个。一个广州周末可以从海珠广场附近的银行（QQQB）开始，走到天河的证券营业部（SPYB），再去东山的手机维修市场（MUB）—— 全在一天钱包上限之内。",
            )}
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="label-caps text-[10px] text-muted-foreground">{t("QQQB — banks", "QQQB — 银行")}</p>
              <p className="mt-1 font-display text-2xl">344</p>
              <p className="text-xs text-muted-foreground">{t("drops, the most common", "点位，数量最多")}</p>
            </div>
            <div>
              <p className="label-caps text-[10px] text-muted-foreground">{t("NVDAB — internet cafés", "NVDAB — 网吧/电竞")}</p>
              <p className="mt-1 font-display text-2xl">95</p>
              <p className="text-xs text-muted-foreground">{t("drops, mostly downtown", "点位，多在市中心")}</p>
            </div>
            <div>
              <p className="label-caps text-[10px] text-muted-foreground">{t("TSLAB — superchargers", "TSLAB — 超充站")}</p>
              <p className="mt-1 font-display text-2xl">34</p>
              <p className="text-xs text-muted-foreground">{t("drops, lower density", "点位，密度最低")}</p>
            </div>
            <div>
              <p className="label-caps text-[10px] text-muted-foreground">{t("AAPLB — Apple stores", "AAPLB — Apple 店")}</p>
              <p className="mt-1 font-display text-2xl">52</p>
              <p className="text-xs text-muted-foreground">{t("drops, higher per-catch value", "点位，单次价值更高")}</p>
            </div>
          </div>
        </Panel>
      </Section>

      <Section title={t("Cooldowns & daily caps", "冷却与每日上限")}>
        <Panel className="mt-6 overflow-x-auto p-0 sm:p-0">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="label-caps border-b border-border text-[10px] text-muted-foreground">
                <th className="px-6 py-4">{t("Rarity", "稀有度")}</th>
                <th className="px-6 py-4">{t("Tokens", "代币")}</th>
                <th className="px-6 py-4">{t("Point cooldown", "点位冷却")}</th>
              </tr>
            </thead>
            <tbody>
              {(["common", "rare", "epic", "legendary"] as Rarity[]).map((r) => {
                const tokens = TOKENS.filter((t) => t.rarity === r && !t.eventOnly);
                const eventOnly = TOKENS.find((t) => t.rarity === r && t.eventOnly);
                return (
                  <tr key={r} className="border-b border-border/60 last:border-0">
                    <td className="px-6 py-3 font-medium">{RARITY_LABEL[r]}</td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {tokens.map((t) => t.symbol).join(", ")}
                      {eventOnly && (
                        <span className="ml-1 text-[11px]">
                          {t("(event only: ", "（仅传奇活动：")}{eventOnly.symbol}{")"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 font-mono text-xs">{COOLDOWN_MIN[r]} min</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Panel>
            <h3 className="label-caps text-[11px] text-primary">{t("Wallet caps", "钱包限制")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t(
                `One Agent Wallet can catch ${RULES.perWalletPerDay} drops per day, with at least ${RULES.walletCooldownMin} minutes between two catches. The same wallet cannot take the same signal twice within 24 hours.`,
                `每个 Agent 钱包每天可领取 ${RULES.perWalletPerDay} 次，两次领取之间至少间隔 ${RULES.walletCooldownMin} 分钟，且 24 小时内不能重复领取同一信号。`,
              )}
            </p>
          </Panel>
          <Panel>
            <h3 className="label-caps text-[11px] text-primary">{t("Real venues", "真实门店")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t(
                "Points are tied to real stores; which ones are open rotates daily with the vault's inventory. A caught point goes to sleep, then reopens automatically when its cooldown ends.",
                "点位绑定真实门店，开放哪些点随金库库存每日轮换。完成领取后进入冷却，冷却结束后按规则重新开放。",
              )}
            </p>
          </Panel>
        </div>
      </Section>

      <Section title={t("Claim confirmation and fund safety", "领取确认与资金安全")}>
        <Panel className="mt-6">
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            {t(
              "The website verifies your location and issues claim authorization. Your Agent Wallet submits the transaction, and rewards move directly from the vault to that wallet. The signing key authorizes claims; it is not a withdrawal button. Confirm receipt using the transaction link in this browser's claim history.",
              "网站验证到场情况并签发领取凭证，由 Agent 钱包提交交易，奖励直接从金库转入该钱包。签名密钥用于批准领取，不是直接提款按钮。是否到账，可通过本机领取记录中的交易链接核对。",
            )}
          </p>

        </Panel>
      </Section>

      <Section
        title={t("Anti-cheat", "反作弊")}
        lead={t(
          "GPS can be faked and wallets are free, so per-wallet limits alone are worthless. Every counter is keyed on something a fresh wallet does not reset.",
          "仅依赖钱包限额不足以防范伪造定位。系统同时结合设备记录、移动轨迹与连续采样，降低通过更换钱包重复领取的风险。",
        )}
      >
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {ANTICHEAT.map(([h, p]) => (
            <Panel key={h}>
              <h3 className="label-caps text-[11px] text-primary">{h}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p}</p>
            </Panel>
          ))}
        </div>
        <div className="mt-6 flex gap-4">
          <Link to="/docs" className="label-caps text-[11px] text-primary underline underline-offset-4">
            {t("Full documentation →", "完整文档 →")}
          </Link>
          <Link to="/app" className="label-caps text-[11px] text-primary underline underline-offset-4">
            {t("Open the radar →", "浏览地图 →")}
          </Link>
        </div>
      </Section>
    </>
  );
}
