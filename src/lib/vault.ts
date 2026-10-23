/**
 * Shared, browser-safe pieces of the on-chain claim path.
 * Uploaded VaultEx/Trigger revision: contracts/reference/MapCityBeaconFactory.flat.sol.
 * ABI is generated with the source's exact Solidity 0.8.24 compiler.
 */
import vaultAbi from "./contracts/MapCityVaultUpgradeable.abi.json";
import factoryAbi from "./contracts/MapCityBeaconFactory.abi.json";

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

/** Full compiled ABIs, including signer configuration, identity reads and claim errors. */
export const VAULT_ABI = vaultAbi;
export const FACTORY_ABI = factoryAbi;

export type Voucher = {
  to: string;
  district: number;
  amount: string;
  spawnId: string;
  nonce: string;
  deadline: number;
};
