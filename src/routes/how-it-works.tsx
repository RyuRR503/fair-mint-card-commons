import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, Panel } from "@/components/site/Section";
import { RULES } from "@/lib/game.functions";
import { CHAIN, COOLDOWN_MIN, TOKENS, RARITY_LABEL, type Rarity } from "@/lib/tokens";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How CATCH works — close the distance, catch the signal" },
      {
        name: "description",
        content:
          "The signal table, the claim server, the vault contract on BNB Smart Chain, and every anti-cheat rule that stands between a spoofer and a share.",
      },
      { property: "og:title", content: "How CATCH works" },
      {
        property: "og:description",
        content:
          "Three parts: a signal table, a claim server that proves you were there, and a vault that only pays against a signed voucher.",
      },
    ],
  }),
  component: HowItWorks,
});

function HowItWorks() {
  const t = useT();

  const STEPS = [
    {
      n: "01",
      h: t("Connect a wallet, enable location.", "连接钱包，开启定位。"),
      p: t(
        "The app watches your GPS and draws every signal around you. Nothing is sent anywhere yet.",
        "App 会读取你的定位并绘制周围所有信号。此时什么都不会上传。",
      ),
    },
    {
      n: "02",
      h: t("Close the distance until the button unlocks.", "走近，直到按钮解锁。"),
      p: t(
        `Close enough is ${RULES.baseRadiusM} m plus half the error your phone reports — ${RULES.baseRadiusM + 5} m on a clean fix, ${RULES.maxRadiusM} m at the accuracy ceiling. A downtown fix is routinely twenty to fifty metres out, and a flat radius only ever refused people who were actually standing there.`,
        `判定范围是 ${RULES.baseRadiusM} 米加上你手机上报误差的一半——定位干净时约 ${RULES.baseRadiusM + 5} 米，精度最差时 ${RULES.maxRadiusM} 米。市中心的定位常常偏差二三十米，固定半径只会误伤真的站在那里的人。`,
      ),
    },
    {
      n: "03",
      h: t("The app sends your fix and its GPS log.", "App 上传定位与轨迹日志。"),
      p: t(
        `Not just one position: at least ${RULES.minFixSamples} readings over ${RULES.minFixSeconds} seconds, plus motion from the accelerometer.`,
        `不只是一个坐标：至少 ${RULES.minFixSeconds} 秒内的 ${RULES.minFixSamples} 次采样，外加加速度计的运动数据。`,
      ),
    },
    {
      n: "04",
      h: t("The server re-checks everything.", "服务器重新校验一切。"),
      p: t(
        "Distance, accuracy, jitter, travel since your last catch, device clock against the timezone, and the daily caps. A rejected claim costs you nothing.",
        "距离、精度、抖动、距上次捕捉的移动速度、设备时钟与时区是否吻合，以及每日上限。被拒绝不会有任何损失。",
      ),
    },
    {
      n: "05",
      h: t("It signs a voucher.", "服务器签发凭证。"),
      p: t(
        `to, token, amount, spawnId, nonce, deadline — valid for ${RULES.voucherTtlMin} minutes. Signed with the claim key using EIP-712, so a voucher for one vault is worthless on another.`,
        `to、token、amount、spawnId、nonce、deadline——有效期 ${RULES.voucherTtlMin} 分钟。使用 EIP-712 以签名密钥签发，因此一个金库的凭证在别处无效。`,
      ),
    },
    {
      n: "06",
      h: t("Your wallet calls claim().", "你的钱包调用 claim()。"),
      p: t(
        "The vault verifies the signature, burns the nonce, and transfers the fragment to you. Nothing is minted — every fragment was bought and deposited before it appeared.",
        "金库验证签名、作废 nonce，然后把碎片转给你。不增发——每一份碎片都是在出现之前就已买入并存入的。",
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
        `新的捕捉必须从上一次的位置"走得到"：${RULES.flightThresholdKm} 公里以内按步行速度（${RULES.walkSpeedMs} 米/秒）计算，更远则按飞行加 ${RULES.airportMinutes} 分钟机场时间。一小时内出现在两座不同城市一律拒绝——规则跟着设备走，换新钱包也抹不掉手机留下的轨迹。`,
      ),
    ],
    [
      t("Proof of presence", "在场证明"),
      t(
        "A real chipset wobbles by centimetres and its accuracy drifts every second. A mock provider returns the same coordinates and the same error forever, and that is exactly what we look for.",
        "真实定位芯片会有厘米级抖动，精度每秒都在变。模拟定位永远返回同一个坐标和同一个误差——我们查的就是这个。",
      ),
    ],
    [
      t("Motion", "运动数据"),
      t("Hands shake, emulators do not. A perfect zero is refused.", "手会抖，模拟器不会。完全为零的运动数据会被拒绝。"),
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
        `同一钱包两次捕捉间隔 ${RULES.walletCooldownMin} 分钟。每个信号被捡走后按稀有度休眠 20–120 分钟，时间一到自动复活。`,
      ),
    ],
    [
      t("Caps", "上限"),
      t(
        `${RULES.perWalletPerDay} catches per wallet per day, and the same wallet cannot take the same signal twice within 24 hours. The whole site also has a rolling hourly budget of $${RULES.hourlyUsdCap} (priced at live Chainlink quotes) — once it is spent, catches pause until the next hour.`,
        `每个钱包每天 ${RULES.perWalletPerDay} 次，且同一钱包 24 小时内不能重复捕捉同一个信号。全站还有每小时 $${RULES.hourlyUsdCap} 的滚动发放预算（按 Chainlink 实时报价折算）——用完即暂停，下一小时自动恢复。`,
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
      <Section
        eyebrow={t("how it works", "玩法")}
        title={t("Close the distance. Catch. The chain does the rest.", "拉近距离，捕捉，剩下的交给链上。")}
        lead={t(
          "Three parts make it work: a signal table that says where and how much, a claim server that checks you are really there and signs a voucher, and a vault contract that holds the tokens and only releases them against a valid voucher.",
          "三个部分构成整套机制：决定「在哪、给多少」的信号表；核验你确实在场并签发凭证的服务器；持有代币、仅凭有效凭证放款的金库合约。",
        )}
        className="mt-10"
      />

      <Section title={t("Six steps, four of them invisible.", "六步，其中四步你看不见。")}>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {STEPS.map((s) => (
            <Panel key={s.n}>
              <span className="label-caps font-mono text-3xl text-primary">{s.n}</span>
              <h3 className="mt-2 text-lg">{s.h}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.p}</p>
            </Panel>
          ))}
        </div>
      </Section>

      <Section title={t("What each catch pays", "每次捕捉能拿多少")}>
        <Panel className="mt-6 overflow-x-auto p-0 sm:p-0">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="label-caps border-b border-border text-[10px] text-muted-foreground">
                <th className="px-6 py-4">{t("Token", "代币")}</th>
                <th className="px-6 py-4">{t("Where you catch it", "捕捉地点")}</th>
                <th className="px-6 py-4">{t("Per catch", "单次数量")}</th>
                <th className="px-6 py-4">{t("Vault target", "目标库存")}</th>
              </tr>
            </thead>
            <tbody>
              {TOKENS.map((tk) => (
                <tr key={tk.symbol} className="border-b border-border/60 last:border-0">
                  <td className="px-6 py-3 label-caps text-xs">{tk.symbol}</td>
                  <td className="px-6 py-3 text-muted-foreground">{t(tk.venue, tk.venueZh)}</td>
                  <td className="px-6 py-3 font-mono text-xs">{tk.fragment} {tk.symbol}</td>
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
            <h3 className="label-caps text-[11px] text-primary">{t("Same token, same amount", "同一代币，数量统一")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t(
                "The fragment size belongs to the token, not the pin. Every Apple store pays the same AAPLON fragment, every internet café pays the same NVDAON fragment — worth roughly $3 a catch at current prices, about $150 for the legendary SPCXON.",
                "碎片大小由代币决定，与点位无关。每家 Apple 店发同样的 AAPLON，每家网吧发同样的 NVDAON——按现价约 $3 一次，传奇 SPCXON 约 $150。",
              )}
            </p>
          </Panel>
          <Panel>
            <h3 className="label-caps text-[11px] text-primary">{t("Refill is automatic", "自动补货")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t(
                "Trading tax flows into the vault as BNB, split evenly across the nine districts. Anyone can then sell stock tokens into a district at the Chainlink price plus the Flap NAV multiplier and a small premium, and walk away with BNB. No keeper, no cron — the market restocks the map.",
                "交易税以 BNB 形式流入金库，平均分配到九个区。任何人都可以按 Chainlink 报价 × Flap NAV 系数加少量溢价，把股票代币卖给对应区并拿走 BNB。没有 keeper、没有定时任务——由市场自动补满地图。",
              )}
            </p>
          </Panel>
        </div>
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
                `One wallet can catch ${RULES.perWalletPerDay} drops per day, with at least ${RULES.walletCooldownMin} minutes between two catches. The same wallet cannot take the same signal twice within 24 hours.`,
                `每个钱包每天可捕捉 ${RULES.perWalletPerDay} 次，两次捕捉之间至少间隔 ${RULES.walletCooldownMin} 分钟，且 24 小时内不能重复捕捉同一信号。`,
              )}
            </p>
          </Panel>
          <Panel>
            <h3 className="label-caps text-[11px] text-primary">{t("Permanent points", "固定点位")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t(
                "Signals are tied to real stores, not regenerated every day. A caught point simply goes to sleep, then reopens automatically when its cooldown ends.",
                "信号绑定真实门店，并非每天重新生成。被捕捉后只是进入休眠，冷却结束后自动重新开放。",
              )}
            </p>
          </Panel>
        </div>
      </Section>

      <Section title={t("The voucher", "凭证结构")}>
        <Panel className="mt-6">
          <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-foreground/80">{`Voucher {
  address to;       // your wallet
  address token;    // e.g. AAPL on ${CHAIN.short}
  uint256 amount;   // 0.011 AAPL = 11000000000000000 (18 decimals)
  bytes32 spawnId;  // keccak256("shanghai-0")
  uint256 nonce;    // unique, burned on use
  uint256 deadline; // unix seconds
}`}</pre>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            {t(
              "The chain never trusts the app. It trusts one key, and that key only signs after the physical checks pass. If the key leaks, the owner rotates it with setSigner and pauses the vault.",
              "链上从不信任 App，只信任一把密钥，而这把密钥只有在所有物理校验通过后才会签名。密钥一旦泄露，管理员可用 setSigner 轮换并暂停金库。",
            )}
          </p>
        </Panel>
      </Section>

      <Section
        title={t("Anti-cheat", "反作弊")}
        lead={t(
          "GPS can be faked and wallets are free, so per-wallet limits alone are worthless. Every counter is keyed on something a fresh wallet does not reset.",
          "定位可以伪造，钱包不要钱，所以只按钱包限流毫无意义。每一项计数都绑定在换钱包也重置不了的东西上。",
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
            {t("Open the radar →", "打开雷达 →")}
          </Link>
        </div>
      </Section>
    </>
  );
}
