import { createFileRoute } from "@tanstack/react-router";
import { Section, Panel } from "@/components/site/Section";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "CATCH — 开发计划与接入进度" },
      {
        name: "description",
        content:
          "查看 CATCH 的 Agent 领取接入、客户端、城市覆盖与金库功能开发计划，以及尚待确定的事项。",
      },
      { property: "og:title", content: "CATCH roadmap" },
      {
        property: "og:description",
        content:
          "What is live, what is built but dark, what is being built, and what we have decided not to do.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Roadmap,
});

type Status = "live" | "building" | "next" | "dark" | "open" | "no";

const TAG: Record<Status, { en: string; zh: string; cls: string }> = {
  live: { en: "live", zh: "已上线", cls: "bg-primary text-primary-foreground" },
  building: { en: "building", zh: "开发中", cls: "bg-accent text-accent-foreground" },
  next: { en: "next", zh: "下一步", cls: "bg-foreground text-background" },
  dark: { en: "built, dark", zh: "已完成未开启", cls: "bg-muted text-muted-foreground" },
  open: { en: "open question", zh: "待定", cls: "bg-secondary text-secondary-foreground" },
  no: { en: "not planned", zh: "不做", cls: "bg-destructive text-destructive-foreground" },
};

type Pair = [string, string];

const CHAPTERS: {
  title: Pair;
  lead: Pair;
  items: { s: Status; h: Pair; p: Pair }[];
}[] = [
  {
    title: ["Agent-first claims", "Agent 专属领取"],
    lead: ["Human presence and Agent execution are separate. Live integration is pending.", "现场位置验证与 Agent 链上执行分别完成。真实领取功能接入中。"],
    items: [
      { s: "live", h: ["Flow preview and rules", "流程展示与规则"], p: ["All rarities are intended for Agent Wallets only. Preview does not issue vouchers or tokens.", "所有稀有度均计划仅限 Agent 钱包。预览不签发凭证、不发放代币。"] },
      { s: "next", h: ["Identity and real commands", "身份验证与真实指令"], p: ["Connect verifiable Agent identity, bind GPS commands to the recipient and implement Agent transaction submission.", "接入可验证的 Agent 身份，绑定定位指令与收款钱包，完成 Agent 交易提交。"] },
    ],
  },
  {
    title: ["The phone", "手机端"],
    lead: [
      "A browser can tell you where you are. A phone can prove you stood there.",
      "浏览器可显示定位；可靠的现场验证还需结合设备与运动数据。",
    ],
    items: [
      {
        s: "live",
        h: ["The web app", "网页版"],
        p: ["Map browsing and Agent flow preview. Live Agent claims are not connected.", "可浏览地图与预览 Agent 流程；真实 Agent 领取尚未接通。"],
      },
      {
        s: "building",
        h: ["Android build", "安卓客户端"],
        p: [
          "Same map, same catch, same account, plus real motion sensors and background GPS.",
          "同样的地图、同样的领取、同一个账号，另加真实运动传感器与后台定位。",
        ],
      },
      {
        s: "next",
        h: ["iOS", "iOS 版"],
        p: ["One codebase, already runs. Blocked on store paperwork, not engineering.", "基于共用代码开发，上架流程尚待完成。"],
      },
      {
        s: "next",
        h: ["One account everywhere", "全端同一账号"],
        p: ["Web and app land on the same wallet instead of two.", "网页与客户端使用同一钱包身份。"],
      },
    ],
  },
  {
    title: ["Asia first", "亚洲优先"],
    lead: [
      "Most maps of this kind start in Europe and North America. This one does not.",
      "优先完善亚洲城市的真实点位覆盖。",
    ],
    items: [
      {
        s: "live",
        h: ["Chinese cities on the map", "中国城市已上线"],
        p: [
          "Beijing, Shanghai, Shenzhen, Guangzhou, Hangzhou, Chengdu and more are in the spawn table from day one.",
          "点位数据已覆盖北京、上海、深圳、广州、杭州、成都等城市。",
        ],
      },
      {
        s: "building",
        h: ["Local doors", "本地门店"],
        p: [
          "Authorised resellers count, not only flagship stores. That is how retail actually works across most of Asia.",
          "点位范围包含授权经销商与旗舰店，以适应本地零售场景。",
        ],
      },
      {
        s: "live",
        h: ["Points that respawn by themselves", "点位冷却与重新开放"],
        p: [
          "Signals are tied to real venues and sleep on a cooldown after a catch instead of being regenerated at some faraway midnight.",
          "点位绑定真实场所，完成领取后按规则进入冷却，结束后重新开放，无需每日重新生成。",
        ],
      },

      {
        s: "next",
        h: ["More languages", "更多语言"],
        p: ["zh-Hant, JA, KO, TH, VI, ID, HI after the current English and Chinese.", "在现有中英文之外，继续加繁中、日、韩、泰、越、印尼、印地语。"],
      },
    ],
  },
  {
    title: ["Rest of world", "全球其他地区"],
    lead: [
      "A fragment worth a coffee in Zurich is worth a day's work somewhere else. That asymmetry has to be designed for, not ignored.",
      "在苏黎世值一杯咖啡的碎片，在别处可能值一天工资。这种不对称必须被设计进去，而不是假装看不见。",
    ],
    items: [
      {
        s: "building",
        h: ["Banded caps", "分档上限"],
        p: ["Catch caps scaled to local purchasing power, so farming never beats working.", "按当地购买力调整每日上限，降低自动化或重复领取的激励。"],
      },
      {
        s: "next",
        h: ["Lite mode", "轻量模式"],
        p: ["Low-end phones and 3G. The map should not need a flagship device.", "面向低端机和 3G 网络。降低地图浏览对设备性能的要求。"],
      },
      {
        s: "open",
        h: ["OS-level attestation", "系统级设备认证"],
        p: ["Strong, but it locks out rooted and older phones. Undecided.", "很强，但会把 root 过的和老机型挡在门外。尚未决定。"],
      },
      {
        s: "no",
        h: ["Selling this as an income", "把这个包装成收入来源"],
        p: ["It is a game with real loot. It is not a job and we will not market it as one.", "项目提供基于真实地点的资产探索体验，不作为工作或稳定收入来源宣传。"],
      },
    ],
  },
  {
    title: ["Money in", "资金来源"],
    lead: [
      "Sponsors fund the vault. Fees fund the vault. Nothing depends on new buyers.",
      "金库资金来源包括赞助注资与交易手续费，用于补充代币库存。",
    ],
    items: [
      {
        s: "building",
        h: ["Trading tax into the nine districts", "交易税进入九个区"],
        p: [
          "Incoming BNB pays a 10% operating fee, and the rest is split evenly across the nine district buckets. The ratio lives in the contract, not in a key.",
          "收到的 BNB 中，10% 用于运营，其余平均分配至九个区的补货池，分配规则由合约执行。",
        ],
      },
      {
        s: "building",
        h: ["Permissionless refill transactions", "无需许可的补货"],
        p: [
          "Anyone may trigger refillViaSwap to exchange a district’s BNB for its bStocks token through PancakeSwap V2/V3, subject to the contract’s reference-price checks.",
          "任何人均可发起 refillViaSwap 补货交易，由合约通过 PancakeSwap V2/V3 将该区 BNB 兑换为对应 bStocks，并执行参考价格校验。",
        ],
      },
      {
        s: "next",
        h: ["Sponsor dashboard", "赞助方后台"],
        p: ["Self-serve spots, budgets, and a live visit ledger.", "自助选点、自助预算、实时到店流水。"],
      },
      {
        s: "open",
        h: ["Catching with an empty wallet", "Agent 交易费用代付"],
        p: [
          "Agent gas sponsorship remains undecided. The intended rules still require Agent identity; ordinary relaying does not qualify.",
          "Agent Gas 代付尚待确定；领取仍须 Agent 身份，普通钱包代交不等于具备资格。",
        ],
      },
    ],
  },
  {
    title: ["The structure", "运营结构"],
    lead: ["A hundred cities is a spreadsheet. A thousand is an operation.", "扩展至更多城市，需要配套的数据维护与运营支持。"],
    items: [
      {
        s: "building",
        h: ["Venues that match the asset", "场所与资产关联"],
        p: [
          "Bank branches, internet cafés, computer malls, phone shops, superchargers, Apple Stores, science museums — pulled from real map data, not invented.",
          "银行网点、网吧、电脑城、手机店、超充站、Apple 直营店、科技馆——依据真实地图数据确定。",
        ],
      },
      {
        s: "next",
        h: ["Public payout ledger", "公开发放流水"],
        p: [
          "Every catch, every voucher, every transfer, readable on chain and mirrored on the proof page.",
          "每一次领取、每一张凭证、每一笔转账，链上可查，并同步在储备证明页。",
        ],
      },
      {
        s: "open",
        h: ["The signing key", "签名密钥"],
        p: [
          "The vault owner keeps full control and can withdraw the pool; one key also decides who gets a voucher. Reducing that trust is the open problem.",
          "金库 owner 保留全部权限，可以提走奖池；同时由一把密钥决定谁能拿到凭证。如何进一步削弱这份信任，是尚未解决的问题。",
        ],
      },
    ],
  },

];

function Roadmap() {
  const t = useT();
  return (
    <>
      <Section hero
        eyebrow={t("roadmap", "路线图")}
        title={t("Where this goes next. And what is in the way.", "开发计划与接入进度")}
        lead={t(
          "Including the things we decided not to build, and the questions we have not answered.",
          "展示当前进度、后续开发安排与尚待确定的事项。",
        )}
        className="mt-10"
      />
      {CHAPTERS.map((c) => (
        <Section key={c.title[0]} title={t(...c.title)} lead={t(...c.lead)}>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {c.items.map((i) => (
              <Panel key={i.h[0]}>
                <span className={cn("label-caps rounded-md px-3 py-1 text-[9px]", TAG[i.s].cls)}>
                  {t(TAG[i.s].en, TAG[i.s].zh)}
                </span>
                <h3 className="mt-3 text-lg">{t(...i.h)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(...i.p)}</p>
              </Panel>
            ))}
          </div>
        </Section>
      ))}
    </>
  );
}
