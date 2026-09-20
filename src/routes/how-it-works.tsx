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
      h: t("Connect a wallet and open the radar.", "连接钱包，打开雷达。"),
      p: t(
        "The app reads your GPS once and draws every catchable signal around you — Apple stores, banks, internet cafés, phone shops, science museums. Nothing is sent anywhere yet.",
        "App 读取一次定位，把周围所有可捕捉信号画出来：Apple 店、银行、网吧、手机店、科技馆。此时什么都不会上传。",
      ),
    },
    {
      n: "02",
      h: t("Walk up to the pin until it lights up.", "走到点位附近，等它亮起。"),
      p: t(
        `You are standing outside the Apple store on Shanghai Nanjing East Road. The app draws a circle around the pin. If your phone reports a clean fix, the circle is about ${RULES.baseRadiusM + 5} m. In a crowded downtown it can stretch to ${RULES.maxRadiusM} m — the radius grows with your own error so a real visitor does not get rejected.`,
        `你站在上海南京东路 Apple 店门口，App 会在点位周围画一个圈。定位干净时圈约 ${RULES.baseRadiusM + 5} 米；市中心拥挤地段会放宽到 ${RULES.maxRadiusM} 米——半径随你的定位误差自动放大，真的到场的人不会被误伤。`,
      ),
    },
    {
      n: "03",
      h: t("Hold still for a few seconds.", "原地停留几秒。"),
      p: t(
        `The app records at least ${RULES.minFixSamples} readings over ${RULES.minFixSeconds} seconds and reads your accelerometer. A real hand holding a real phone shakes; a mocked location sits perfectly still. That is how it tells the difference.`,
        `App 会在 ${RULES.minFixSeconds} 秒内记录至少 ${RULES.minFixSamples} 次定位，并读取加速度计。真实的手握着真实的手机会微微抖动；模拟定位纹丝不动。这就是区分方式。`,
      ),
    },
    {
      n: "04",
      h: t("The server runs the checks.", "服务器运行校验。"),
      p: t(
        "It measures distance, accuracy, jitter, and whether your travel since the last catch is physically possible. It also checks the site-wide hourly budget and your daily cap. If anything fails, you see a plain reason and pay zero gas.",
        "服务器会计算距离、精度、抖动，以及距上次捕捉的移动在现实里是否可能（比如一小时内在两座城市出现会被拒绝）；同时检查全站每小时预算和你的每日上限。任何一项失败都会给出一句人话原因，不花 gas。",
      ),
    },
    {
      n: "05",
      h: t("You get a 15-minute voucher.", "你得到一张 15 分钟有效期的凭证。"),
      p: t(
        `The voucher says: "send 0.02 AAPLON to this wallet, for this spawn, this one time." It is signed with EIP-712 and only works on the CATCH vault. A screenshot of the QR code is useless — the nonce is burned the first time it is used.`,
        `凭证内容类似："把 0.02 AAPLON 发给这个钱包，对应这个点位，只能用一次。" 它用 EIP-712 签名，只在 CATCH 金库有效。截图或二维码都无用——nonce 第一次使用就被烧掉。`,
      ),
    },
    {
      n: "06",
      h: t("The chain pays you.", "链上直接打款。"),
      p: t(
        "The vault checks the signature, marks the nonce as spent, and transfers the fragment to your wallet. You do not need BNB in your wallet — anyone can submit the voucher for you. Every token already sits in the prize pool; nothing is minted on the spot.",
        "金库验证签名、标记 nonce 已用，然后把碎片转到你的钱包。你钱包里可以没有 BNB——任何人都能替你代交凭证。代币已经在奖池里，不会现场增发。",
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
                "The fragment size belongs to the token, not the pin. Every Apple store pays the same AAPLON fragment, every internet café pays the same NVDAON fragment. Value follows rarity: about $2 a catch for common, $3.5 for rare, $5.5 for epic, and one whole share (about $150) for the legendary SPCXON.",
                "碎片大小由代币决定，与点位无关。每家 Apple 店发同样的 AAPLON，每家网吧发同样的 NVDAON。价值按稀有度递增：普通约 $2 一次，稀有约 $3.5，史诗约 $5.5，传奇 SPCXON 是 1 整股（约 $150）。",
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

      <Section title={t("Where the pins live", "这些店都在哪儿")}>
        <Panel className="mt-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t(
              "The map covers 30 Chinese cities with 1,378 permanent drops pinned to 1,443 real OpenStreetMap venues. Beijing has 96 drops, Shanghai 102, Shenzhen 86, and Chengdu 85. A weekend in Guangzhou could take you from a bank (FXION) near Haizhu Square to a computer shop (AMDON) in Tianhe, then a phone repair market (MUON) in Dongshan — all within the same wallet day.",
              "地图覆盖 30 座中国城市，1378 个永久掉落点对应 1443 个 OpenStreetMap 真实门店。北京 96 个，上海 102 个，深圳 86 个，成都 85 个。一个广州周末可以从海珠广场附近的银行（FXION）开始，走到天河的电脑城（AMDON），再去东山的手机维修市场（MUON）—— 全在一天钱包上限之内。",
            )}
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="label-caps text-[10px] text-muted-foreground">{t("FXION — banks", "FXION — 银行")}</p>
              <p className="mt-1 font-display text-2xl">511</p>
              <p className="text-xs text-muted-foreground">{t("drops, the most common", "点位，数量最多")}</p>
            </div>
            <div>
              <p className="label-caps text-[10px] text-muted-foreground">{t("NVDAON — internet cafés", "NVDAON — 网吧/电竞")}</p>
              <p className="mt-1 font-display text-2xl">105</p>
              <p className="text-xs text-muted-foreground">{t("drops, mostly downtown", "点位，多在市中心")}</p>
            </div>
            <div>
              <p className="label-caps text-[10px] text-muted-foreground">{t("TSLAON — superchargers", "TSLAON — 超充站")}</p>
              <p className="mt-1 font-display text-2xl">36</p>
              <p className="text-xs text-muted-foreground">{t("drops, lower density", "点位，密度最低")}</p>
            </div>
            <div>
              <p className="label-caps text-[10px] text-muted-foreground">{t("AAPLON — Apple stores", "AAPLON — Apple 店")}</p>
              <p className="mt-1 font-display text-2xl">64</p>
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
          <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-foreground/80">{`GameVoucher {
  address to;       // your wallet
  uint8   district; // 0-8, e.g. the AAPLON district on ${CHAIN.short}
  uint256 amount;   // 0.02 AAPLON = 20000000000000000 (18 decimals)
  bytes32 spawnId;  // keccak256("shanghai-0")
  uint256 nonce;    // unique, burned on use
  uint256 deadline; // unix seconds
}`}</pre>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            {t(
              "The chain never trusts the app. It trusts one key, and that key only signs after the physical checks pass. If the key leaks it is rotated with setGameSigner — and even then the map pool has no admin exit: stock can only ever leave to the address inside a signed voucher.",
              "链上从不信任 App，只信任一把密钥，而这把密钥只有在所有物理校验通过后才会签名。密钥一旦泄露可用 setGameSigner 轮换——即便如此，地图奖池也没有管理员提现出口：代币只能转给签名凭证里写明的那个地址。",
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
