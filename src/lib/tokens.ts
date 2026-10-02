export type Rarity = "common" | "rare" | "epic" | "legendary";

export type StockToken = {
  symbol: string;
  name: string;
  /** Chinese brand name shown to zh users. */
  nameZh: string;
  /** The kind of real place in China this stock is caught at. */
  venue: string;
  venueZh: string;
  /** OpenStreetMap tag filters used to find those real places. */
  osm: string[];
  /** BEP-20 address on BNB Smart Chain (chainId 56). */
  address: string;
  /** Chainlink USD price feed on BSC. Required for on-chain vault pricing. */
  feed: string;
  decimals: number;
  /** Fragment size handed out per catch. One drop rule everywhere. */
  fragment: number;
  /** How many payable drops the vault should keep in stock for this token. */
  targetDrops: number;
  rarity: Rarity;
  /** Brand color used for the 3D chip. */
  color: string;
  /** Secondary color for the chip gradient. */
  color2: string;
  /** Text drawn on the chip. */
  glyph: string;
  /** Foreground of the glyph: light or dark. */
  ink: "light" | "dark";
  /** Legendary drops have no permanent store pins — timed events only. */
  eventOnly?: boolean;
};

export const CHAIN = {
  id: 56,
  hexId: "0x38",
  name: "BNB Smart Chain",
  short: "BSC",
  currency: { name: "BNB", symbol: "BNB", decimals: 18 },
  rpc: "https://bsc-dataseed.bnbchain.org",
  explorer: "https://bscscan.com",
} as const;

/** Vault holding the fragments. Set once the contract is deployed. */
export const VAULT_ADDRESS = "0x0000000000000000000000000000000000000000";

/** Treasury that buys fragments and refills the vault. */
export const TREASURY_ADDRESS = "0x0000000000000000000000000000000000000000";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * District index each token occupies inside MapCityVault. The order is fixed by
 * the contract (assetOf(district)) and must never be reshuffled here.
 */
export const DISTRICT_BY_SYMBOL: Record<string, number> = {
  NVDAB: 0,
  AAPLB: 1,
  TSLAB: 2,
  MSFTB: 3,
  GOOGLB: 4,
  SPCXB: 5,
  QQQB: 6,
  MUB: 7,
  SPYB: 8,
};


/** BNB/USD Chainlink feed on BSC, used by the vault for quoting. */
export const BNB_USD_FEED = "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE";

/** PancakeSwap routers the vault swaps BNB -> bStocks through. */
export const PANCAKE_V3_ROUTER = "0x1b81D678ffb9C0263b24A97847620C99d213eB14";
export const PANCAKE_V2_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E";

/** Minutes a drop stays on cooldown after someone catches it, by rarity. */
export const COOLDOWN_MIN: Record<Rarity, number> = {
  common: 20,
  rare: 45,
  epic: 90,
  legendary: 120,
};

/**
 * Nine tokenised stocks. Every one of them is a live BEP-20 on BNB Smart Chain
 * (bStocks), bought by the vault on PancakeSwap and guarded by Chainlink, so the vault can
 * price them fully on-chain. Each one is tied to the kind of real place in
 * China that matches the company: chips at computer malls, memory at phone
 * shops, GPUs at internet cafés, and so on.
 */
export const TOKENS: StockToken[] = [
  {
    symbol: "QQQB",
    name: "Nasdaq-100 ETF",
    nameZh: "纳斯达克 100 ETF",
    venue: "Bank branches and brokerage offices",
    venueZh: "银行网点、证券营业部",
    osm: ['amenity=bank'],
    address: "0x205812CdBed920aFf76C6580abD681a46D11efc7",
    feed: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    fragment: 0.0027,
    targetDrops: 25,
    rarity: "common",
    color: "#00A3E0",
    color2: "#00405C",
    glyph: "QQQ",
    ink: "light",
  },
  {
    symbol: "NVDAB",
    name: "NVIDIA",
    nameZh: "英伟达",
    venue: "Internet cafés and esports lounges",
    venueZh: "网吧、电竞馆",
    osm: ["amenity=internet_cafe", "leisure=adult_gaming_centre"],
    address: "0x02Fca66C1D1aFB4E2A7884261eB00F63598a7436",
    feed: "0xea5c2Cbb5cD57daC24E26180b19a929F3E9699B8",
    decimals: 18,
    fragment: 0.0085,
    targetDrops: 25,
    rarity: "common",
    color: "#76B900",
    color2: "#3F6300",
    glyph: "NVDA",
    ink: "dark",
  },
  {
    symbol: "SPYB",
    name: "S&P 500 ETF",
    nameZh: "标普 500 ETF",
    venue: "Brokerages and financial advisory offices",
    venueZh: "证券公司、理财与金融网点",
    osm: ["office=financial", "office=insurance"],
    address: "0x7138b48df7D98D7e3cc221BfE7192D0a178182D8",
    // No Chainlink SPY feed on BSC: vault uses TwapUsdFeed (30-min PancakeSwap TWAP) as its price ruler.
    feed: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    fragment: 0.0033,
    targetDrops: 25,
    rarity: "common",
    color: "#1F3864",
    color2: "#0D1B2E",
    glyph: "SPY",
    ink: "light",
  },
  {
    symbol: "MUB",
    name: "Micron",
    nameZh: "美光科技",
    venue: "Phone shops and repair counters",
    venueZh: "手机店、数码维修点",
    osm: ["shop=mobile_phone"],
    address: "0xcdf2f3e0fa43C47A6662a91C9E4a7C5f69762699",
    feed: "0x75F4285d8e8687A9b5bd7b36A26D672A8C4C1c7a",
    decimals: 18,
    fragment: 0.002,
    targetDrops: 25,
    rarity: "common",
    color: "#0057B8",
    color2: "#003370",
    glyph: "MU",
    ink: "light",
  },
  {
    symbol: "TSLAB",
    name: "Tesla",
    nameZh: "特斯拉",
    venue: "Superchargers and experience centres",
    venueZh: "特斯拉超充站、体验中心",
    osm: ["amenity=charging_station (Tesla)", "shop=car (Tesla)"],
    address: "0x5b1910eAaD6450E50f816082Aa078C41F10C292f",
    feed: "0xEEA2ae9c074E87596A85ABE698B2Afebc9B57893",
    decimals: 18,
    fragment: 0.0095,
    targetDrops: 25,
    rarity: "rare",
    color: "#E82127",
    color2: "#8E0B10",
    glyph: "T",
    ink: "light",
  },
  {
    symbol: "MSFTB",
    name: "Microsoft",
    nameZh: "微软",
    venue: "Office and gaming retail counters",
    venueZh: "办公/电脑连锁店、Xbox 体验点",
    osm: ["shop=video_games", "shop=stationery"],
    address: "0x80106cb3EAD06659A5ad19DF39D9b4733863B9b0",
    feed: "0x5D209cE1fBABeAA8E6f9De4514A74FFB4b34560F",
    decimals: 18,
    fragment: 0.007,
    targetDrops: 25,
    rarity: "rare",
    color: "#0078D4",
    color2: "#004E8C",
    glyph: "MSFT",
    ink: "light",
  },
  {
    symbol: "GOOGLB",
    name: "Alphabet",
    nameZh: "谷歌母公司",
    venue: "Android flagship stores and tech parks",
    venueZh: "安卓旗舰体验店、科技园区",
    osm: ["shop=mobile_phone (Huawei/Xiaomi/OPPO/vivo/Honor)"],
    address: "0x3F53De71c126BdaBAe20f9cD64848d317f6C3238",
    feed: "0xeDA73F8acb669274B15A977Cb0cdA57a84F18c2a",
    decimals: 18,
    fragment: 0.0105,
    targetDrops: 25,
    rarity: "rare",
    color: "#4285F4",
    color2: "#1A56B0",
    glyph: "GOOGL",
    ink: "light",
  },
  {
    symbol: "AAPLB",
    name: "Apple",
    nameZh: "苹果",
    venue: "Apple stores and authorised resellers",
    venueZh: "Apple 官方直营与授权店",
    osm: ["brand=Apple"],
    address: "0x431a3BEE82E2ca41e49895CbECE5bB0F76A89b7A",
    feed: "0xb7Ed5bE7977d61E83534230f3256C021e0fae0B6",
    decimals: 18,
    fragment: 0.02,
    targetDrops: 25,
    rarity: "epic",
    color: "#4B4B4F",
    color2: "#131315",
    glyph: "A",
    ink: "light",
  },
  {
    symbol: "SPCXB",
    name: "SpaceX",
    nameZh: "太空探索",
    venue: "Science, space and planetarium venues — event only",
    venueZh: "科技馆、天文馆、航天主题场馆（限定活动）",
    osm: ["tourism=museum (science)", "amenity=planetarium"],
    address: "0xbe9D156892E55e7154BcD3cB0FEA677F9D3103E1",
    feed: "0x5Bd3a7c076011800900e52689C0ed46ef931e3e6",
    decimals: 18,
    fragment: 1,
    targetDrops: 2,
    rarity: "legendary",
    color: "#4FA3D9",
    color2: "#00223A",
    glyph: "SPCX",
    ink: "dark",
    eventOnly: true,
  },
];

export const TOKEN_BY_SYMBOL: Record<string, StockToken> = Object.fromEntries(
  TOKENS.map((t) => [t.symbol, t]),
);

/** Tokens that get permanent pins on the map. */
export const MAP_TOKENS = TOKENS.filter((t) => !t.eventOnly);

export const RARITY_LABEL: Record<Rarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

export function rarityVar(r: Rarity) {
  return r === "legendary"
    ? "var(--gold)"
    : r === "epic"
      ? "var(--epic)"
      : r === "rare"
        ? "var(--rare)"
        : "var(--common)";
}
