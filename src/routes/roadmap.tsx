import { createFileRoute } from "@tanstack/react-router";
import { Section, Panel } from "@/components/site/Section";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap — where CATCH goes next, and what is in the way" },
      {
        name: "description",
        content:
          "The phone, Asia, the rest of the world, money in, and the structure. Including the parts that are not planned and the questions still open.",
      },
      { property: "og:title", content: "CATCH roadmap" },
      {
        property: "og:description",
        content:
          "What is live, what is built but dark, what is being built, and what we have decided not to do.",
      },
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
    title: ["The phone", "手机端"],
    lead: [
      "A browser can tell you where you are. A phone can prove you stood there.",
      "浏览器能告诉你在哪儿，原生 App 才能证明你真的站过那儿。",
    ],
    items: [
      {
        s: "live",
        h: ["The web app", "网页版"],
        p: ["Full map, full claim flow, works on any modern browser.", "完整地图、完整领取流程，任何现代浏览器都能用。"],
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
        p: ["One codebase, already runs. Blocked on store paperwork, not engineering.", "同一套代码，已经能跑。卡在上架流程，不是技术问题。"],
      },
      {
        s: "next",
        h: ["One account everywhere", "全端同一账号"],
        p: ["Web and app land on the same wallet instead of two.", "网页和 App 落到同一个钱包，而不是两个。"],
      },
    ],
  },
  {
    title: ["Asia first", "亚洲优先"],
    lead: [
      "Most maps of this kind start in Europe and North America. This one does not.",
      "这类项目的地图通常从欧美开始，我们不。",
    ],
    items: [
      {
        s: "live",
        h: ["Chinese cities on the map", "中文城市already上线"],
        p: [
          "Beijing, Shanghai, Shenzhen, Guangzhou, Hangzhou, Chengdu and more are in the spawn table from day one.",
          "北京、上海、深圳、广州、杭州、成都等城市第一天就在投放表里。",
        ],
      },
      {
        s: "building",
        h: ["Local doors", "本地门店"],
        p: [
          "Authorised resellers count, not only flagship stores. That is how retail actually works across most of Asia.",
          "授权经销商也算，不只是旗舰店——这才是亚洲零售的真实样子。",
        ],
      },
      {
        s: "next",
        h: ["Per-city midnight", "按城市重置"],
        p: ["Signals should refill at your midnight, not UTC's.", "信号应该按你所在城市的午夜刷新，而不是 UTC 的午夜。"],
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
        p: ["Catch caps scaled to local purchasing power, so farming never beats working.", "按当地购买力调整每日上限，确保刷量永远比不上正经工作。"],
      },
      {
        s: "next",
        h: ["Lite mode", "轻量模式"],
        p: ["Low-end phones and 3G. The map should not need a flagship device.", "面向低端机和 3G 网络。看地图不该需要旗舰手机。"],
      },
      {
        s: "open",
        h: ["OS-level attestation", "系统级设备认证"],
        p: ["Strong, but it locks out rooted and older phones. Undecided.", "很强，但会把 root 过的和老机型挡在门外。尚未决定。"],
      },
      {
        s: "no",
        h: ["Selling this as an income", "把这个包装成收入来源"],
        p: ["It is a game with real loot. It is not a job and we will not market it as one.", "这是一个有真实战利品的游戏，不是工作，我们也不会那样宣传。"],
      },
    ],
  },
  {
    title: ["Money in", "资金来源"],
    lead: [
      "Sponsors fund the vault. Fees fund the vault. Nothing depends on new buyers.",
      "赞助方给金库注资，手续费给金库注资。整套机制不依赖新买家接盘。",
    ],
    items: [
      {
        s: "building",
        h: ["Fee split contract", "手续费分账合约"],
        p: [
          "Immutable on-chain split: one share to the treasury that buys stock tokens for the vault, the other buys and burns $CATCH. The ratio is not adjustable by keys.",
          "链上不可变分账：一部分进国库、用于为金库买入股票代币，另一部分回购并销毁 $CATCH。比例无法用私钥改动。",
        ],
      },
      {
        s: "dark",
        h: ["Multi-chain sponsor deposits", "多链赞助入金"],
        p: ["Built, merged and switched off. A per-spot deposit address, priced by router quote. Nothing bridges.", "已写好、已合并、暂时关闭。每个点位一个入金地址，按路由报价计价，不做跨链桥。"],
      },
      {
        s: "next",
        h: ["The shop", "商店"],
        p: [
          "$CATCH buys memory, identity, constraint and the world. Never a catch. Half of every purchase is burned on the way through.",
          "$CATCH 可以买记忆、身份、约束和地图扩展，但永远买不到一次领取。每笔消费的一半直接销毁。",
        ],
      },
      {
        s: "open",
        h: ["Gasless approvals", "免 Gas 授权"],
        p: ["$CATCH has no permit(), so a fresh wallet with zero BNB cannot spend it yet.", "$CATCH 还没有 permit()，所以零 BNB 的新钱包暂时无法花它。"],
      },
    ],
  },
  {
    title: ["The structure", "运营结构"],
    lead: ["A hundred cities is a spreadsheet. A thousand is an operation.", "一百个城市是一张表格，一千个城市是一套运营。"],
    items: [
      {
        s: "building",
        h: ["The keeper", "自动补给机器人"],
        p: [
          "Hourly top-ups from the treasury through a swapper contract, simulated first, capped per run, logged publicly.",
          "每小时从国库经兑换合约补货：先模拟、每轮限额、全程公开记录。",
        ],
      },
      {
        s: "next",
        h: ["Sponsor dashboard", "赞助方后台"],
        p: ["Self-serve spots, budgets, and a live visit ledger.", "自助选点、自助预算、实时到店流水。"],
      },
      {
        s: "next",
        h: ["Decentralising the treasury key", "国库私钥去中心化"],
        p: ["The split is already trustless. The wallet that feeds it is not, yet.", "分账已经无需信任，给它供货的钱包还没有。"],
      },
    ],
  },
];

function Roadmap() {
  const t = useT();
  return (
    <>
      <Section
        eyebrow={t("roadmap", "路线图")}
        title={t("Where this goes next. And what is in the way.", "接下来往哪走，以及路上有什么。")}
        lead={t(
          "Including the things we decided not to build, and the questions we have not answered.",
          "包括我们决定不做的东西，和还没想清楚的问题。",
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
