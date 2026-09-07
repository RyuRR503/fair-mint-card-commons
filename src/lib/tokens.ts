export type Rarity = "common" | "rare" | "epic" | "legendary";

export type StockToken = {
  symbol: string;
  name: string;
  /** BEP-20 address on BNB Smart Chain (chainId 56). */
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

export const TOKENS: StockToken[] = [
  {
    symbol: "AMZN",
    name: "Amazon",
    address: "0x1111111111111111111111111111111111110001",
    decimals: 18,
    fragment: 0.008,
    rarity: "common",
    color: "#FF9900",
    color2: "#E07B00",
    glyph: "a",
    ink: "dark",
  },
  {
    symbol: "GME",
    name: "GameStop",
    address: "0x1111111111111111111111111111111111110002",
    decimals: 18,
    fragment: 0.11,
    rarity: "common",
    color: "#E4002B",
    color2: "#9E0020",
    glyph: "GS",
    ink: "light",
  },
  {
    symbol: "AAPL",
    name: "Apple",
    address: "0x1111111111111111111111111111111111110003",
    decimals: 18,
    fragment: 0.011,
    rarity: "rare",
    color: "#4B4B4F",
    color2: "#131315",
    glyph: "",
    ink: "light",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet",
    address: "0x1111111111111111111111111111111111110004",
    decimals: 18,
    fragment: 0.011,
    rarity: "rare",
    color: "#4285F4",
    color2: "#0F62D0",
    glyph: "G",
    ink: "light",
  },
  {
    symbol: "META",
    name: "Meta",
    address: "0x1111111111111111111111111111111111110005",
    decimals: 18,
    fragment: 0.0055,
    rarity: "rare",
    color: "#0866FF",
    color2: "#0146BE",
    glyph: "M",
    ink: "light",
  },
  {
    symbol: "MSFT",
    name: "Microsoft",
    address: "0x1111111111111111111111111111111111110006",
    decimals: 18,
    fragment: 0.007,
    rarity: "rare",
    color: "#00A4EF",
    color2: "#0078D4",
    glyph: "▦",
    ink: "light",
  },
  {
    symbol: "TSLA",
    name: "Tesla",
    address: "0x1111111111111111111111111111111111110007",
    decimals: 18,
    fragment: 0.013,
    rarity: "epic",
    color: "#E82127",
    color2: "#8E0B10",
    glyph: "T",
    ink: "light",
  },
  {
    symbol: "NVDA",
    name: "Nvidia",
    address: "0x1111111111111111111111111111111111110008",
    decimals: 18,
    fragment: 1,
    rarity: "legendary",
    color: "#76B900",
    color2: "#4C7A00",
    glyph: "N",
    ink: "light",
  },
];

export const EXTRA_BADGES = ["NFLX", "COST", "LULU", "UPS", "NU"];

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
