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
  NVDAON: 0,
  AAPLON: 1,
  TSLAON: 2,
  MSFTON: 3,
  GOOGLON: 4,
  SPCXON: 5,
  FXION: 6,
  MUON: 7,
  AMDON: 8,
};


/** BNB/USD Chainlink feed on BSC, used by the vault for quoting. */
export const BNB_USD_FEED = "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE";

/** Flap tokenized-stock registry on BSC (NAV multiplier per asset). */
export const FLAP_STOCKS_REGISTRY = "0x5418f7e8fF90354DB0eCD48c8b710219244Eb3C5";

/** Minutes a drop stays on cooldown after someone catches it, by rarity. */
export const COOLDOWN_MIN: Record<Rarity, number> = {
  common: 20,
  rare: 45,
  epic: 90,
  legendary: 120,
};

/**
 * Nine tokenised stocks. Every one of them is a live BEP-20 on BNB Smart Chain
 * with a working Chainlink USD feed and a Flap NAV multiplier, so the vault can
 * price them fully on-chain. Each one is tied to the kind of real place in
 * China that matches the company: chips at computer malls, memory at phone
 * shops, GPUs at internet cafés, and so on.
 */
export const TOKENS: StockToken[] = [
  {
    symbol: "FXION",
    name: "China Large-Cap ETF",
    nameZh: "中国大盘 ETF",
    venue: "Bank branches and brokerage offices",
    venueZh: "银行网点、证券营业部",
    osm: ['amenity=bank'],
    address: "0x9b8E987e6fEc8Cf1380C4dcA7071e2C7853AEEA1",
    feed: "0x7D48744FB285b884dF1Ee8005f04B62FF1404a98",
    decimals: 18,
    fragment: 0.085,
    targetDrops: 25,
    rarity: "common",
    color: "#1B4F9C",
    color2: "#0C2E5E",
    glyph: "FXI",
    ink: "light",
  },
  {
    symbol: "NVDAON",
    name: "NVIDIA",
    nameZh: "英伟达",
    venue: "Internet cafés and esports lounges",
    venueZh: "网吧、电竞馆",
    osm: ["amenity=internet_cafe", "leisure=adult_gaming_centre"],
    address: "0xA9eE28C80f960B889dFbd1902055218cBa016F75",
    feed: "0xea5c2Cbb5cD57daC24E26180b19a929F3E9699B8",
    decimals: 18,
    fragment: 0.013,
    targetDrops: 25,
    rarity: "common",
    color: "#76B900",
    color2: "#3F6300",
    glyph: "NVDA",
    ink: "dark",
  },
  {
    symbol: "AMDON",
    name: "AMD",
    nameZh: "超微半导体",
    venue: "Computer malls and PC-build shops",
    venueZh: "电脑城、装机与数码店",
    osm: ["shop=computer", "shop=electronics"],
    address: "0x75Fd4cF6f8392E41E70391D60c90C0D5211603a1",
    feed: "0x4442f488fba0b27D970b68b761336224d6d30492",
    decimals: 18,
    fragment: 0.006,
    targetDrops: 25,
    rarity: "common",
    color: "#ED1C24",
    color2: "#8E0B10",
    glyph: "AMD",
    ink: "light",
  },
  {
    symbol: "MUON",
    name: "Micron",
    nameZh: "美光科技",
    venue: "Phone shops and repair counters",
    venueZh: "手机店、数码维修点",
    osm: ["shop=mobile_phone"],
    address: "0xcdf2f3e0fa43C47A6662a91C9E4a7C5f69762699",
    feed: "0x75F4285d8e8687A9b5bd7b36A26D672A8C4C1c7a",
    decimals: 18,
    fragment: 0.003,
    targetDrops: 25,
    rarity: "common",
    color: "#0057B8",
    color2: "#003370",
    glyph: "MU",
    ink: "light",
  },
  {
    symbol: "TSLAON",
    name: "Tesla",
    nameZh: "特斯拉",
    venue: "Superchargers and experience centres",
    venueZh: "特斯拉超充站、体验中心",
    osm: ["amenity=charging_station (Tesla)", "shop=car (Tesla)"],
    address: "0x2494b603319d4D9F9715c9f4496d9E0364B59d93",
    feed: "0xEEA2ae9c074E87596A85ABE698B2Afebc9B57893",
    decimals: 18,
    fragment: 0.008,
    targetDrops: 25,
    rarity: "rare",
    color: "#E82127",
    color2: "#8E0B10",
    glyph: "T",
    ink: "light",
  },
  {
    symbol: "MSFTON",
    name: "Microsoft",
    nameZh: "微软",
    venue: "Office and gaming retail counters",
    venueZh: "办公/电脑连锁店、Xbox 体验点",
    osm: ["shop=video_games", "shop=stationery"],
    address: "0x6Bfe75D1ad432050eA973C3A3DcD88F02e2444C3",
    feed: "0x5D209cE1fBABeAA8E6f9De4514A74FFB4b34560F",
    decimals: 18,
    fragment: 0.006,
    targetDrops: 25,
    rarity: "rare",
    color: "#0078D4",
    color2: "#004E8C",
    glyph: "MSFT",
    ink: "light",
  },
  {
    symbol: "GOOGLON",
    name: "Alphabet",
    nameZh: "谷歌母公司",
    venue: "Android flagship stores and tech parks",
    venueZh: "安卓旗舰体验店、科技园区",
    osm: ["shop=mobile_phone (Huawei/Xiaomi/OPPO/vivo/Honor)"],
    address: "0x091FC7778e6932d4009B087B191D1EE3bac5729A",
    feed: "0xeDA73F8acb669274B15A977Cb0cdA57a84F18c2a",
    decimals: 18,
    fragment: 0.009,
    targetDrops: 25,
    rarity: "rare",
    color: "#4285F4",
    color2: "#1A56B0",
    glyph: "GOOGL",
    ink: "light",
  },
  {
    symbol: "AAPLON",
    name: "Apple",
    nameZh: "苹果",
    venue: "Apple stores and authorised resellers",
    venueZh: "Apple 官方直营与授权店",
    osm: ["brand=Apple"],
    address: "0x390a684EF9cADE28A7AD0DFa61AB1Eb3842618c4",
    feed: "0xb7Ed5bE7977d61E83534230f3256C021e0fae0B6",
    decimals: 18,
    fragment: 0.011,
    targetDrops: 25,
    rarity: "epic",
    color: "#4B4B4F",
    color2: "#131315",
    glyph: "A",
    ink: "light",
  },
  {
    symbol: "SPCXON",
    name: "SpaceX",
    nameZh: "太空探索",
    venue: "Science, space and planetarium venues — event only",
    venueZh: "科技馆、天文馆、航天主题场馆（限定活动）",
    osm: ["tourism=museum (science)", "amenity=planetarium"],
    address: "0xd0a58BC9D88D3FF48C0294Cb7e45937d0E41A928",
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
