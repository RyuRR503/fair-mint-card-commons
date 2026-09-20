import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, Panel } from "@/components/site/Section";
import { RULES } from "@/lib/game.functions";
import { CHAIN, TOKENS, VAULT_ADDRESS, COOLDOWN_MIN, RARITY_LABEL, type Rarity } from "@/lib/tokens";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Docs — contracts, endpoints and rules" },
      {
        name: "description",
        content:
          "The vault contract interface, the claim endpoints, the spawn rules, the token list and the fee split, on BNB Smart Chain.",
      },
      { property: "og:title", content: "CATCH docs" },
      { property: "og:description", content: "Everything an integrator or a sceptic needs." },
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
  const totalSpawns = 1378;
  const totalPlaces = 1443;
  const totalCities = 30;

  return (
    <>
      <Section
        eyebrow={tr("docs", "文档")}
        title={tr("The whole machine, written down.", "整台机器，全部写下来。")}
        lead={tr(
          "Nothing here needs an account. Everything on this page can be checked against the chain.",
          "这里不需要任何账号。本页所有内容都可以直接拿去链上核对。",
        )}
        className="mt-10"
      />

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
            <p className="label-caps text-[10px] text-muted-foreground">{tr("Permanent drops", "永久掉落点")}</p>
            <p className="mt-2 font-display text-4xl">{totalSpawns.toLocaleString()}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {tr("Each one sleeps after a catch and respawns automatically.", "每个点位被捡走后会进入冷却，时间一到自动复活。")}
            </p>
          </Panel>
        </div>
        <Panel className="mt-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {tr(
              "Think of it like a nationwide scavenger hunt with 1,378 fixed coordinates. Beijing has 96 drops, Shanghai 102, Shenzhen 86, and Chengdu 85. Smaller cities still have dozens: a 24-hour trip can cover banks in Beijing, internet cafés in Chengdu, and Tesla chargers in Shenzhen. The numbers are not decoration — they come from OpenStreetMap and are written into the database as real latitude and longitude.",
              "可以理解为一场覆盖全国 1378 个固定坐标的寻宝。北京有 96 个掉落点，上海 102 个，深圳 86 个，成都 85 个；小一些的城市也有几十个：24 小时内你可以在北京的银行、成都的网吧、深圳的超充站之间切换。这些数字不是装饰，全部来自 OpenStreetMap，以真实经纬度写进数据库。",
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
              "The vault never mints. Each of the nine districts holds one BEP-20 stock token, and stock only leaves against an EIP-712 voucher signed by the claim key. Nonces are burned on use, deadlines are enforced, and anyone may relay a voucher — the stock still goes to the address inside it. There is no admin exit from the map pool; the only map parameter an operator can touch is the signer address.",
              "金库永不增发。九个区各持有一种 BEP-20 股票代币，只有凭领取私钥签发的 EIP-712 凭证才能取出。nonce 用后即废、deadline 强制生效，任何人都可以代为提交凭证，代币仍然只会转给凭证里写明的地址。地图奖池没有管理员提现出口，运营方唯一能改的地图参数就是签名地址。",
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
) external;                       // anyone may relay
function gameNonceUsed(uint256 nonce) external view returns (bool);
function gamePool(uint8 district) external view returns (uint256);
          function setGameSigner(address signer) external;  // guardian only`}</Code>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Panel>
              <h3 className="label-caps text-[11px] text-primary">{tr("A concrete example", "一个具体例子")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {tr(
                  "You stand in front of the Apple store on Shanghai Nanjing East Road. The server checks your GPS, signs a voucher for 0.011 AAPLON, and gives it a 15-minute deadline. You submit it to the contract. The contract checks the signature against the game signer, makes sure the nonce has never been used, and transfers 0.011 AAPLON to your wallet. The server cannot take the money back, and the voucher cannot be reused tomorrow.",
                  "你站在上海南京东路 Apple 店门口。服务器校验 GPS 后，签发一张 0.011 AAPLON 的凭证，有效期 15 分钟。你把凭证提交给合约，合约用 gameSigner 验签、确认 nonce 没被用过，然后把 0.011 AAPLON 转到你的钱包。服务器拿不回这笔钱，这张凭证明天也不能再用。",
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

      <Section title={tr("Endpoints", "接口")}>
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
            `Wallet caps: ${RULES.perWalletPerDay} catches per day, ${RULES.walletCooldownMin} minutes between catches, and the same signal cannot be caught twice within 24 hours. Site-wide, payouts are capped at $${RULES.hourlyUsdCap} per rolling hour, valued at live Chainlink quotes — when the budget is spent, claims pause until the window refills.`,
            `钱包限制：每天 ${RULES.perWalletPerDay} 次，两次捕捉间隔 ${RULES.walletCooldownMin} 分钟，同一信号 24 小时内不可重复捕捉。全站层面，每个滚动小时的发放总额封顶 $${RULES.hourlyUsdCap}（按 Chainlink 实时报价折算）——预算用完即暂停，窗口滚动后自动恢复。`,
          )}
        </p>
      </Section>

      <Section title={tr("Payouts and restocking", "发放与补货")}>
        <Panel className="mt-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {tr(
              "Every token has one fixed fragment size — the same amount at every pin on the map. The vault aims to keep 25 payable catches per token in stock (2 for the legendary SPCXON). Trading tax arrives as BNB, 10% goes to operations, and the rest is split evenly across the nine districts. Restocking is permissionless: anyone can sell a district's stock token to the vault at the Chainlink price × Flap NAV multiplier × a 2% premium and receive BNB. Every token bought this way goes 100% into the map prize pool — the only way out is a signed claim.",
              "每种代币的碎片大小固定，地图上所有同类点位数量一致。金库为每种代币维持 25 次可领取库存（传奇 SPCXON 为 2 次）。交易税以 BNB 流入，10% 归运营，其余平均分到九个区。补货无需许可：任何人都可以按 Chainlink 报价 × Flap NAV 系数 × 2% 溢价把该区股票代币卖给金库并获得 BNB。买入的代币 100% 进入地图奖池——唯一出口是签名领取。",
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
                  <td className="px-6 py-3 font-mono text-xs">{t.fragment}</td>
                  <td className="px-6 py-3 font-mono text-xs">{t.targetDrops} {tr("catches", "次")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <p className="mt-4 text-sm text-muted-foreground">
          {tr(
            `Addresses are placeholders until the vault and the token wrappers are deployed on ${CHAIN.short}.`,
            `在金库与代币封装合约部署到 ${CHAIN.short} 之前，这些地址都是占位值。`,
          )}{" "}
          <Link to="/proof" className="text-primary underline underline-offset-4">
            {tr("The proof page", "储备证明页")}
          </Link>{" "}
          {tr("always shows what is really there.", "永远显示真实存在的东西。")}
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
