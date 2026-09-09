export type Rarity = "common" | "rare" | "epic" | "legendary";

export type StockToken = {
  symbol: string;
  name: string;
  /** Chinese brand name shown to zh users. */
  nameZh: string;
  /** OpenStreetMap brand:wikidata ids used to find the real stores. */
  wikidata: string[];
  /** Fallback OSM name/brand regex when the brand has no clean wikidata tag. */
  brands: string[];
  /** BEP-20 address on BNB Smart Chain (chainId 56). Filled once deployed. */
  address: string;
  decimals: number;
  /** Fragment size handed out per catch. */
  fragment: number;
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


const PLACEHOLDER = "0x0000000000000000000000000000000000000000";

/** Minutes a drop stays on cooldown after someone catches it, by rarity. */
export const COOLDOWN_MIN: Record<Rarity, number> = {
  common: 20,
  rare: 45,
  epic: 90,
  legendary: 120,
};

/**
 * Nine tokenised stocks, picked so every one of them maps to a place you can
 * physically walk to in China. Contract addresses are filled in once verified.
 */
export const TOKENS: StockToken[] = [
  {
    symbol: "SBUXON",
    name: "Starbucks",
    nameZh: "星巴克",
    wikidata: ["Q37158"],
    brands: ["星巴克", "Starbucks"],
    address: PLACEHOLDER,
    decimals: 18,
    fragment: 0.02,
    rarity: "common",
    color: "#00704A",
    color2: "#004E34",
    glyph: "S",
    ink: "light",
  },
  {
    symbol: "MCDON",
    name: "McDonald's",
    nameZh: "麦当劳",
    wikidata: ["Q38076"],
    brands: ["麦当劳", "McDonald"],
    address: PLACEHOLDER,
    decimals: 18,
    fragment: 0.02,
    rarity: "common",
    color: "#FFC72C",
    color2: "#DA291C",
    glyph: "M",
    ink: "dark",
  },
  {
    symbol: "BABAON",
    name: "Alibaba (Hema / Cainiao)",
    nameZh: "阿里巴巴（盒马 / 菜鸟驿站）",
    wikidata: ["Q1359568"],
    brands: ["盒马", "Hema", "菜鸟", "Cainiao", "天猫"],
    address: PLACEHOLDER,
    decimals: 18,
    fragment: 0.03,
    rarity: "common",
    color: "#FF6A00",
    color2: "#C64300",
    glyph: "A",
    ink: "light",
  },
  {
    symbol: "NKEON",
    name: "Nike",
    nameZh: "耐克",
    wikidata: ["Q483915"],
    brands: ["耐克", "Nike"],
    address: PLACEHOLDER,
    decimals: 18,
    fragment: 0.01,
    rarity: "rare",
    color: "#F5F5F5",
    color2: "#B8B8B8",
    glyph: "N",
    ink: "dark",
  },
  {
    symbol: "NIOON",
    name: "NIO",
    nameZh: "蔚来",
    wikidata: ["Q24905510"],
    brands: ["蔚来", "NIO"],
    address: PLACEHOLDER,
    decimals: 18,
    fragment: 0.012,
    rarity: "rare",
    color: "#00BEBE",
    color2: "#04797B",
    glyph: "N",
    ink: "dark",
  },
  {
    symbol: "AAPLON",
    name: "Apple",
    nameZh: "苹果",
    wikidata: ["Q421253"],
    brands: ["Apple Store", "苹果"],
    address: PLACEHOLDER,
    decimals: 18,
    fragment: 0.004,
    rarity: "epic",
    color: "#4B4B4F",
    color2: "#131315",
    glyph: "A",
    ink: "light",
  },
  {
    symbol: "TSLAON",
    name: "Tesla",
    nameZh: "特斯拉",
    wikidata: ["Q478214"],
    brands: ["特斯拉", "Tesla"],
    address: PLACEHOLDER,
    decimals: 18,
    fragment: 0.005,
    rarity: "epic",
    color: "#E82127",
    color2: "#8E0B10",
    glyph: "T",
    ink: "light",
  },
  {
    symbol: "COSTON",
    name: "Costco",
    nameZh: "开市客",
    wikidata: ["Q715583"],
    brands: ["开市客", "Costco"],
    address: PLACEHOLDER,
    decimals: 18,
    fragment: 0.002,
    rarity: "epic",
    color: "#E31837",
    color2: "#005DAA",
    glyph: "C",
    ink: "light",
  },
  {
    symbol: "BILION",
    name: "Bilibili",
    nameZh: "哔哩哔哩",
    wikidata: [],
    brands: [],
    address: PLACEHOLDER,
    decimals: 18,
    fragment: 0.05,
    rarity: "legendary",
    color: "#FB7299",
    color2: "#B23A62",
    glyph: "B",
    ink: "dark",
    eventOnly: true,
  },
];

/** Wikidata brand id -> token symbol, for the OSM importer. */
export const SYMBOL_BY_WIKIDATA: Record<string, string> = Object.fromEntries(
  TOKENS.flatMap((t) => t.wikidata.map((w) => [w, t.symbol])),
);

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
