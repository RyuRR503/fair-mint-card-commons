/**
 * Shared, browser-safe pieces of the on-chain claim path.
 * The vault contract source lives in contracts/MapCityVault.sol.
 */

export const VOUCHER_TYPES = {
  GameVoucher: [
    { name: "to", type: "address" },
    { name: "district", type: "uint8" },
    { name: "amount", type: "uint256" },
    { name: "spawnId", type: "bytes32" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
} as const;

export const EIP712_NAME = "MapCityVault";
export const EIP712_VERSION = "1";
export const VOUCHER_PRIMARY_TYPE = "GameVoucher";

/** ABI of the single user-facing function plus the reads the site needs. */
export const VAULT_ABI = [
  {
    type: "function",
    name: "claimGameVoucher",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "district", type: "uint8" },
      { name: "amount", type: "uint256" },
      { name: "spawnId", type: "bytes32" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "gamePool",
    stateMutability: "view",
    inputs: [{ name: "district", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "gameNonceUsed",
    stateMutability: "view",
    inputs: [{ name: "nonce", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export type Voucher = {
  to: string;
  district: number;
  amount: string;
  spawnId: string;
  nonce: string;
  deadline: number;
};
