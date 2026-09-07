export type Rarity = "common" | "rare" | "epic" | "legendary";

export type StockToken = {
  symbol: string;
  name: string;
  /** Chinese brand name shown to zh users. */
  nameZh: string;
  /** OpenStreetMap brand:wikidata ids used to find the real stores. */
  wikidata: string[];
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

/**
 * Every token maps to a real, physically visitable retail brand.
 * Store coordinates come from OpenStreetMap, matched on `brand:wikidata`.
 */
export const TOKENS: StockToken[] = [
  {
    symbol: "SBUX",
    name: "Starbucks",
    nameZh: "星巴克",
    wikidata: ["Q37158"],
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    fragment: 0.02,
    rarity: "common",
    color: "#00704A",
    color2: "#004E34",
    glyph: "S",
    ink: "light",
  },
  {
    symbol: "MCD",
    name: "McDonald's",
    nameZh: "麦当劳",
    wikidata: ["Q38076"],
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    fragment: 0.02,
    rarity: "common",
    color: "#FFC72C",
    color2: "#DA291C",
    glyph: "M",
    ink: "dark",
  },
  {
    symbol: "YUMC",
    name: "Yum China (KFC / Pizza Hut)",
    nameZh: "百胜中国（肯德基 / 必胜客）",
    wikidata: ["Q524757", "Q191615"],
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    fragment: 0.05,
    rarity: "common",
    color: "#E4002B",
    color2: "#9E0020",
    glyph: "K",
    ink: "light",
  },
  {
    symbol: "LKNCY",
    name: "Luckin Coffee",
    nameZh: "瑞幸咖啡",
    wikidata: ["Q56222066"],
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    fragment: 0.08,
    rarity: "common",
    color: "#0A2D82",
    color2: "#04174A",
    glyph: "L",
    ink: "light",
  },
  {
    symbol: "NKE",
    name: "Nike",
    nameZh: "耐克",
    wikidata: ["Q483915"],
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    fragment: 0.01,
    rarity: "rare",
    color: "#F5F5F5",
    color2: "#B8B8B8",
    glyph: "N",
    ink: "dark",
  },
  {
    symbol: "WMT",
    name: "Walmart / Sam's Club",
    nameZh: "沃尔玛 / 山姆会员店",
    wikidata: ["Q483551", "Q1972120"],
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    fragment: 0.008,
    rarity: "rare",
    color: "#0071CE",
    color2: "#004F91",
    glyph: "W",
    ink: "light",
  },
  {
    symbol: "AAPL",
    name: "Apple",
    nameZh: "苹果",
    wikidata: ["Q421253"],
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    fragment: 0.004,
    rarity: "epic",
    color: "#4B4B4F",
    color2: "#131315",
    glyph: "",
    ink: "light",
  },
  {
    symbol: "TSLA",
    name: "Tesla",
    nameZh: "特斯拉",
    wikidata: ["Q478214"],
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    fragment: 0.005,
    rarity: "epic",
    color: "#E82127",
    color2: "#8E0B10",
    glyph: "T",
    ink: "light",
  },
  {
    symbol: "COST",
    name: "Costco",
    nameZh: "开市客",
    wikidata: ["Q715583"],
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    fragment: 0.002,
    rarity: "legendary",
    color: "#E31837",
    color2: "#005DAA",
    glyph: "C",
    ink: "light",
  },
];

/** Wikidata brand id -> token symbol, for the OSM importer. */
export const SYMBOL_BY_WIKIDATA: Record<string, string> = Object.fromEntries(
  TOKENS.flatMap((t) => t.wikidata.map((w) => [w, t.symbol])),
);


export const TOKEN_BY_SYMBOL: Record<string, StockToken> = Object.fromEntries(
  TOKENS.map((t) => [t.symbol, t]),
);

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
