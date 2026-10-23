import { TIER_USD } from "@/lib/allocation";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE_PREVIEW_META } from "@/lib/site-preview";
import { AgentStatus } from "@/components/site/AgentJourney";
import { Section, Panel } from "@/components/site/Section";
import { RULES } from "@/lib/game.functions";
import { CHAIN, TOKENS, VAULT_ADDRESS, COOLDOWN_MIN, RARITY_LABEL, type Rarity } from "@/lib/tokens";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "CATCH — Docs — contracts, endpoints and rules" },
      {
        name: "description",
        content:
          "The vault contract interface, the claim endpoints, the spawn rules, the token list and the fee split, on BNB Smart Chain.",
      },
      { property: "og:title", content: "CATCH docs" },
      { property: "og:description", content: "CATCH vault interfaces, token parameters and Agent-only claim rules." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...SITE_PREVIEW_META,
    ],
  }),
  component: Docs,
});

function Code({ children }: { children: string }) {
  return (
    <pre className="mt-4 overflow-x-auto rounded-md border border-border bg-muted/40 p-5 font-mono text-xs leading-relaxed text-foreground/80">
      {children}
    </pre>
  );
}

function Docs() {
  const tr = useT();
  const totalSpawns = 938;
  const totalPlaces = 7407;
  const totalCities = 30;

  return (
    <>
      <Section hero
        eyebrow={tr("docs", "文档")}
        title={tr("CATCH interfaces and operating rules", "CATCH 接口与运行规则")}
        lead={tr(
          "Vault interfaces and the live Agent claim rules.",
          "这里说明金库接口与已上线的 Agent 领取规则。",
        )}
        className="mt-10"
      />

      <section className="mx-auto max-w-6xl px-5 py-6"><AgentStatus /></section>
      <Section title={tr("Agent-only claims · live", "Agent 专属领取 · 已上线")}>
        <div className="grid gap-6 border-b border-border py-6 md:grid-cols-2">
          <div><h3 className="text-lg">{tr("Every fragment requires an Agent Wallet", "任何碎片都必须由 Agent 钱包领取")}</h3><p className="mt-3 text-sm text-muted-foreground">{tr("Common, rare, epic and legendary all follow the same rule. Ordinary wallets cannot claim. Flow: phone GPS → single-use 15-minute command → AI → Binance Agentic Wallet submits on BSC.", "普通、稀有、史诗、传奇全部采用同一规则，普通钱包不具备领取资格。流程：手机 GPS → 一次性 15 分钟指令 → AI → 币安 Agent 钱包提交 BSC 领取。")}</p></div>
          <div><h3 className="text-lg">{tr("Enforced by the contract", "由合约强制执行")}</h3><p className="mt-3 text-sm text-muted-foreground">{tr("claimGameVoucher requires the caller to hold a Binance Agent ID and pays only the caller itself. Legendary event claims are not connected yet.", "claimGameVoucher 要求调用者持有币安 Agent ID，奖励只转给调用者本人。传奇活动的领取暂未接通。")}</p></div>
        </div>
      </Section>
      <Section title={tr("Coverage", "覆盖范围")}>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Panel>
            <p className="label-caps text-[10px] text-muted-foreground">{tr("Cities", "城市")}</p>
            <p className="mt-2 font-display text-4xl">{totalCities}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {tr("From Beijing and Shanghai to Kunming and Harbin.", "从北京、上海，到昆明、哈尔滨。")}
            </p>
          </Panel>
          <Panel>
            <p className="label-caps text-[10px] text-muted-foreground">{tr("Real venues", "真实门店")}</p>
            <p className="mt-2 font-display text-4xl">{totalPlaces.toLocaleString()}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {tr("Apple stores, banks, internet cafés, phone shops, science museums and more.", "Apple 店、银行、网吧、手机店、科技馆等真实地点。")}
            </p>
          </Panel>
          <Panel>
            <p className="label-caps text-[10px] text-muted-foreground">{tr("Candidate points", "候选点位")}</p>
            <p className="mt-2 font-display text-4xl">{totalSpawns.toLocaleString()}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {tr("Each one sleeps after a catch and respawns automatically.", "点位完成领取后进入冷却，结束后按规则重新开放。")}
            </p>
          </Panel>
        </div>
        <Panel className="mt-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {tr(
              "The location dataset contains 938 fixed coordinates across China: 67 in Beijing, 63 in Shanghai, 59 in Shenzhen and 56 in Chengdu. Venues include banks, internet cafés and superchargers, based on OpenStreetMap coordinates. Claims remain subject to travel and timing checks.",
              "当前点位数据覆盖全国 938 个固定坐标，其中北京 67 个、上海 63 个、深圳 59 个、成都 56 个。点位包括银行、网吧与超充站等真实场所，依据 OpenStreetMap 经纬度数据建立。参与领取仍须遵守移动轨迹与时间限制。",
            )}
          </p>
        </Panel>
      </Section>

      <Section title={tr("Chain and addresses", "链与地址")}>
        <Panel className="mt-6">
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="label-caps text-[10px] text-muted-foreground">{tr("Network", "网络")}</dt>
              <dd>
                {CHAIN.name} — chain id {CHAIN.id} ({CHAIN.hexId})
              </dd>
            </div>
            <div>
              <dt className="label-caps text-[10px] text-muted-foreground">RPC</dt>
              <dd className="font-mono text-xs break-all">{CHAIN.rpc}</dd>
            </div>
            <div>
              <dt className="label-caps text-[10px] text-muted-foreground">{tr("Explorer", "区块浏览器")}</dt>
              <dd className="font-mono text-xs break-all">{CHAIN.explorer}</dd>
            </div>
            <div>
              <dt className="label-caps text-[10px] text-muted-foreground">{tr("Vault", "金库")}</dt>
              <dd className="font-mono text-xs break-all">{VAULT_ADDRESS}</dd>
            </div>
          </dl>
        </Panel>
      </Section>

      <Section title={tr("Vault contract", "金库合约")}>
        <Panel className="mt-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {tr(
              "The vault holds nine stock tokens. Player rewards are transferred directly to the Agent Wallet named in a valid, single-use signed voucher. The signing key authorizes claims; it does not directly transfer funds. Do not confuse owner permissions with Guardian permissions: the supplied contract revision assigns emergency withdrawals to the Flap Guardian, not the owner. Active deployed permissions must be verified on-chain.",
              "金库存放九种股票代币，玩家奖励通过有效的一次性签名凭证，直接转入凭证对应的 Agent 钱包。签名密钥负责批准领取，并不直接转账。Owner 与 Guardian 权限不能混为一谈：现有合约资料中的紧急提款属于 Flap Guardian，而不是 Owner；实际部署权限应以链上核验为准。",
            )}
          </p>
          <Code>{`// EIP-712 domain
name: "MapCityVault"  version: "1"
chainId: ${CHAIN.id}        verifyingContract: <vault>

GameVoucher(
  address to, uint8 district, uint256 amount,
  bytes32 spawnId, uint256 nonce, uint256 deadline
)

function claimGameVoucher(
  address to, uint8 district, uint256 amount,
  bytes32 spawnId, uint256 nonce, uint256 deadline,
  bytes signature
) external;                       // caller must hold an Agent ID and be the recipient
function gameNonceUsed(uint256 nonce) external view returns (bool);
function gamePool(uint256 district) external view returns (uint256); // live balance, rebase-safe
function refillViaSwap(uint8 district, uint256 bnbIn, uint256 callerMinOut) external returns (uint256);
          function setGameSigner(address signer) external;  // guardian only`}</Code>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Panel>
              <h3 className="label-caps text-[11px] text-primary">{tr("Agent example", "Agent 领取例子")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {tr(
                  "You visit an Apple store with your phone. After GPS checks pass, a single-use claim code is issued; your AI adds its own Agent Wallet when redeeming it. Your AI submits the claim through its Agent Wallet. ",
                  "以 Apple 门店为例，用户通过现场定位验证后，获取一次性领取码，AI 兑换时自动带上自己的 Agent 钱包，由 AI 使用 Agent 钱包提交领取。",
                )}
              </p>
            </Panel>
            <Panel>
              <h3 className="label-caps text-[11px] text-primary">{tr("What happens if the server is wrong?", "如果服务器错了会怎样？")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {tr(
                  "A bad GPS fix or a cheater will be rejected before any voucher is signed. If a voucher is somehow signed incorrectly, the contract still enforces the rules: the nonce is burned, the deadline expires, and the amount is taken from the map pool, not from other users' balances. No central party can mint or claw back tokens.",
                  "定位不准或作弊会在签发凭证前被拒绝。即使签出一张错误凭证，合约仍会执行规则：nonce 被作废、deadline 到期、金额从地图奖池支出，不动其他用户余额。没有任何中央方能增发或回收代币。",
                )}
              </p>
            </Panel>
          </div>
        </Panel>
      </Section>

      <Section title={tr("Existing service interfaces · not an Agent API", "现有服务接口 · 非 Agent 接入接口")}>
        <Panel className="mt-6">
          <Code>{`GET  spawns   { lat, lng, limit? }
     -> { spawns: [{ id, symbol, amount, rarity, city, place, lat, lng }], total }

POST claim    { address, spawnId, lat, lng, accuracy, deviceId,
                samples: [{ lat, lng, accuracy, epochMs }], motion, tzOffsetMin }
     -> { ok, mode, voucher, signature, contract, chainId }
     -> { ok: false, error }   // one human sentence, 4xx

GET  claims   { address? }  -> recent catches
GET  vault    -> { vault, live, balances[], payableDrops, checkedAt }
GET  legendary -> { next, past }
POST legendary/claim { address, lat, lng, accuracy }
POST early-access    { email, kind, city?, company? }`}</Code>
        </Panel>
      </Section>

      <Section title={tr("How your claim history works", "领取记录如何判定")}>
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{tr(
          "The map's Claims from this browser panel tracks claim codes saved in this browser, not a signed-in wallet account. When your AI redeems a code, its recipient Agent Wallet is associated with that code; an on-chain confirmation marks it as received. The record includes the recipient wallet and transaction link. No wallet address entry is required. History does not sync between devices or browsers, and clearing browser data removes it. For the wallet's full transaction history, check your Agent Wallet or BscScan.",
          "地图中的“本机领取记录”按本浏览器保存的领取码追踪，不是按登录账号或钱包判定。AI 兑换领取码时，会关联它使用的收款 Agent 钱包；链上确认后，记录才显示已到账，并提供收款钱包与交易链接。你不需要填写钱包地址。记录不跨设备或浏览器同步，清除浏览器数据后会消失；钱包的完整交易记录，请在 Agent 钱包或 BscScan 查看。",
        )}</p>
      </Section>

      <Section title={tr("Rules, as numbers", "规则参数")}>
        <Panel className="mt-6 overflow-x-auto p-0 sm:p-0">
          <table className="w-full min-w-[420px] text-left text-sm">
            <tbody>
              {Object.entries(RULES).map(([k, v]) => (
                <tr key={k} className="border-b border-border/60 last:border-0">
                  <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{k}</td>
                  <td className="px-6 py-3 font-mono text-xs">{String(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </Section>

      <Section title={tr("How rarity works", "稀有度划分依据")}>
        <Panel className="mt-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {tr(
              "Rarity is a property of the token, not the number of pins. It decides three things: how long a point sleeps after a catch, how dense its venues are, and how much a single catch is worth. Value rises with rarity — a common catch is worth about $2, a rare one about $3.5, an epic one about $7, and the legendary SPCXB about $150. QQQB (banks) is common: banks are everywhere, they respawn in 20 minutes, and each catch is a modest slice. AAPLB (Apple stores) is epic: fewer doors, 90 minutes of cooldown, and a catch worth almost three times a common one.",
              "稀有度是代币本身的属性，不是地图上点位的数量。它决定三件事：点位冷却多久、门店密度多大、以及单次领取的参考价值。价值随稀有度递增——普通约 $2，稀有约 $3.5，史诗约 $7，传奇 SPCXB 约 $150。QQQB（银行）是普通：网点分布广、20 分钟冷却、单次价值较小；AAPLB（Apple 店）是史诗：门店少、90 分钟冷却、单次参考价值约为普通的三倍。",
            )}
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="label-caps text-[10px] text-muted-foreground">{tr("Common", "普通")}</p>
              <p className="mt-1 text-sm font-medium">{tr("QQQB · NVDAB · SPYB · MUB", "QQQB · NVDAB · SPYB · MUB")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{tr("20 min cooldown · many venues · ~$2 a catch", "20 分钟冷却 · 门店多 · 单次约 $2")}</p>
            </div>
            <div>
              <p className="label-caps text-[10px] text-muted-foreground">{tr("Rare", "稀有")}</p>
              <p className="mt-1 text-sm font-medium">{tr("TSLAB · MSFTB · GOOGLB", "TSLAB · MSFTB · GOOGLB")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{tr("45 min cooldown · medium density · ~$3.5 a catch", "45 分钟冷却 · 密度中等 · 单次约 $3.5")}</p>
            </div>
            <div>
              <p className="label-caps text-[10px] text-muted-foreground">{tr("Epic", "史诗")}</p>
              <p className="mt-1 text-sm font-medium">{tr("AAPLB", "AAPLB")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{tr("90 min cooldown · fewer stores · ~$7 a catch", "90 分钟冷却 · 门店少 · 单次约 $7")}</p>
            </div>
            <div>
              <p className="label-caps text-[10px] text-muted-foreground">{tr("Legendary", "传奇")}</p>
              <p className="mt-1 text-sm font-medium">{tr("SPCXB", "SPCXB")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{tr("120 min cooldown · event only · ~$150", "120 分钟冷却 · 仅活动出现 · 约 $150")}</p>
            </div>
          </div>

        </Panel>
      </Section>

      <Section title={tr("Cooldowns", "冷却规则")}>
        <Panel className="mt-6 overflow-x-auto p-0 sm:p-0">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="label-caps border-b border-border text-[10px] text-muted-foreground">
                <th className="px-6 py-4">{tr("Rarity", "稀有度")}</th>
                <th className="px-6 py-4">{tr("Tokens", "代币")}</th>
                <th className="px-6 py-4">{tr("Point cooldown", "点位冷却")}</th>
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
                      {eventOnly && <span className="ml-1 text-[11px]">({eventOnly.symbol} event only)</span>}
                    </td>
                    <td className="px-6 py-3 font-mono text-xs">{COOLDOWN_MIN[r]} min</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
        <p className="mt-4 text-sm text-muted-foreground">
          {tr(
            `Agent Wallet caps: ${RULES.perWalletPerDay} catches per day, ${RULES.walletCooldownMin} minutes between catches, and the same signal cannot be caught twice within 24 hours. Site-wide, payouts are capped at $${RULES.hourlyUsdCap} per rolling hour, valued at live Chainlink quotes — when the budget is spent, claims pause until the window refills.`,
            `钱包限制：每个 Agent 钱包每天 ${RULES.perWalletPerDay} 次，两次领取间隔 ${RULES.walletCooldownMin} 分钟，同一信号 24 小时内不可重复领取。全站层面，每个滚动小时的发放总额封顶 $${RULES.hourlyUsdCap}（按 Chainlink 实时报价折算）——预算用完即暂停，窗口滚动后自动恢复。`,
          )}
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Panel>
            <h3 className="label-caps text-[11px] text-primary">{tr("A day of catching", "每日领取示例")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {tr(
                `Imagine you are in Shanghai. At 9:00 you catch a bank drop (QQQB, 20-minute cooldown). At 11:00 you catch an internet café (NVDAB). At 14:00 you hit a Tesla charger (TSLAB, 45-minute cooldown). By 18:00 you have used ${RULES.perWalletPerDay} of your ${RULES.perWalletPerDay} daily catches. The same Apple store cannot be used again until tomorrow, but other Apple stores are still live.`,
                `假设你在上海。9:00 在银行网点领取（QQQB，20 分钟冷却）；11:00 在网吧领取（NVDAB）；14:00 在特斯拉超充站领取（TSLAB，45 分钟冷却）。到 18:00 你已经用完当天 ${RULES.perWalletPerDay} 次机会。同一 Apple 门店在 24 小时内不可重复领取；其他门店仍须满足领取规则。`,
              )}
            </p>
          </Panel>
          <Panel>
            <h3 className="label-caps text-[11px] text-primary">{tr("Why the rolling hour cap", "为什么有每小时滚动上限")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {tr(
                `The site pays out at most $${RULES.hourlyUsdCap} worth of fragments every rolling hour. If a burst of claims uses up the budget early in the hour, new claims pause until the rolling hour frees budget again. This protects the prize pool from bursts, not from normal use.`,
                `全站每小时滚动发放不超过 $${RULES.hourlyUsdCap}。如果一小时内领取集中、提前用完额度，之后的领取会暂停，直到滚动窗口推进、额度恢复。该限制用于控制短时间集中发放对奖池的影响。`,
              )}
            </p>
          </Panel>
        </div>
      </Section>

      <Section title={tr("Payouts and restocking", "发放与补货")}>
        <Panel className="mt-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {tr(
              "Per-claim token amounts are calculated from the current rarity-based value targets and live prices. Reward funds in the vault buy stock tokens to replenish the prize pool. The number of open points follows actual token inventory, not the number of candidate locations. With limited stock, opening too many points would dilute each reward; the current rule preserves the reward target and opens only as many points as inventory can pay for. Following claim-flow testing, more cities, points and activities may open in stages as inventory permits. Legendary events remain closed. Any changes to reward standards will be reflected in the rules.",
              "单次代币数量按当前稀有度参考价值与实时价格换算。金库中用于奖励的资金会买入股票代币，补充奖池。开放点位数量按真实代币库存确定，并不是候选点位越多就全部开放。有限库存若分给过多点位，每份奖励会被摊薄；目前保留单次奖励标准，库存够支付多少份，就开放多少个点位。领取流程测试完成后，更多城市、点位与活动将视库存逐步开放，传奇活动仍暂未开放。后续如调整奖励标准，领取规则会同步更新。",
            )}
          </p>
        </Panel>
      </Section>

      <Section title={tr("Token list", "代币列表")}>
        <Panel className="mt-6 overflow-x-auto p-0 sm:p-0">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="label-caps border-b border-border text-[10px] text-muted-foreground">
                <th className="px-6 py-4">{tr("Symbol", "代码")}</th>
                <th className="px-6 py-4">{tr("Address", "合约地址")}</th>
                <th className="px-6 py-4">{tr("Fragment", "碎片大小")}</th>
                <th className="px-6 py-4">{tr("Target stock", "目标库存")}</th>
              </tr>
            </thead>
            <tbody>
              {TOKENS.map((t) => (
                <tr key={t.symbol} className="border-b border-border/60 last:border-0">
                  <td className="px-6 py-3 label-caps text-xs">{t.symbol}</td>
                  <td className="px-6 py-3 font-mono text-[11px] break-all">{t.address}</td>
                  <td className="px-6 py-3 font-mono text-xs">≈${TIER_USD[t.rarity]}</td>
                  <td className="px-6 py-3 font-mono text-xs">{t.targetDrops} {tr("catches", "次")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <p className="mt-4 text-sm text-muted-foreground">
          {tr(
            `These are the live contract addresses on ${CHAIN.short}; verify them on BscScan.`,
            `以下为 ${CHAIN.short} 上的真实合约地址，可在 BscScan 核对。`,
          )}{" "}
          <Link to="/proof" className="text-primary underline underline-offset-4">
            {tr("The proof page", "储备证明页")}
          </Link>{" "}
          {tr("reports inventory and data sources; actual reserves must be verified on-chain.", "展示库存及其数据来源，实际储备以链上余额为准。")}
        </p>
      </Section>

      <Section title={tr("Fee split", "手续费分账")}>
        <Panel className="mt-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {tr(
              "$CATCH is a BEP-20 with a fixed one billion supply. Trading fees route through an immutable splitter: the larger share funds the treasury that buys stock tokens for the vault, the rest buys and burns $CATCH on PancakeSwap. The ratio is compiled in — no key can change it, and no key can raise the fee.",
              "$CATCH 是总量固定十亿枚的 BEP-20 代币。交易手续费全部流经一个不可变分账合约：较大的一份进入国库、用于为金库买入股票代币，其余部分在 PancakeSwap 上回购并销毁 $CATCH。比例写死在合约里——没有任何私钥能改动，也没有任何私钥能提高费率。",
            )}
          </p>
        </Panel>
      </Section>
    </>
  );
}
