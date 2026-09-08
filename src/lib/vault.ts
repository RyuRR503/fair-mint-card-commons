/**
 * Shared, browser-safe pieces of the on-chain claim path.
 * The vault contract source lives in contracts/CatchVault.sol.
 */

export const VOUCHER_TYPES = {
  Voucher: [
    { name: "to", type: "address" },
    { name: "token", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "spawnId", type: "bytes32" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
} as const;

export const EIP712_NAME = "Catch";
export const EIP712_VERSION = "1";

/** ABI of the single user-facing function plus the reads the site needs. */
export const VAULT_ABI = [
  {
    type: "function",
    name: "claim",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "v",
        type: "tuple",
        components: [
          { name: "to", type: "address" },
          { name: "token", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "spawnId", type: "bytes32" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      },
      { name: "sig", type: "bytes" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "reserveOf",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "paused",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export type Voucher = {
  to: string;
  token: string;
  amount: string;
  spawnId: string;
  nonce: string;
  deadline: number;
};
