import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { hashTypedData, keccak256, stringToHex } from "viem";
import { VAULT_ABI, EIP712_NAME, EIP712_VERSION, VOUCHER_TYPES } from "./vault";

const source = readFileSync("contracts/reference/MapCityBeaconFactory.flat.sol", "utf8");

describe("uploaded contract claim compatibility", () => {
  it("provides setGameSigner(address) without changing claim inputs", () => {
    const setter = VAULT_ABI.find((item) => item.type === "function" && item.name === "setGameSigner");
    assert.deepEqual(setter?.inputs?.map((input) => input.type), ["address"]);
    const claim = VAULT_ABI.find((item) => item.type === "function" && item.name === "claimGameVoucher");
    assert.deepEqual(claim?.inputs?.map((input) => input.type), ["address", "uint8", "uint256", "bytes32", "uint256", "uint256", "bytes"]);
  });
  it("preserves the EIP712 voucher shape and domain", () => {
    const declaration = `GameVoucher(${VOUCHER_TYPES.GameVoucher.map(({ name, type }) => `${type} ${name}`).join(",")})`;
    assert.ok(source.includes(`"${declaration}"`));
    assert.ok(source.includes(`keccak256(bytes("${EIP712_NAME}"))`));
    assert.ok(source.includes(`keccak256(bytes("${EIP712_VERSION}"))`));
    assert.equal(declaration, "GameVoucher(address to,uint8 district,uint256 amount,bytes32 spawnId,uint256 nonce,uint256 deadline)");
  });
  it("binds signed vouchers to the recipient and deployed vault address", () => {
    const domain = { name: EIP712_NAME, version: EIP712_VERSION, chainId: 56, verifyingContract: "0x0000000000000000000000000000000000000001" as const };
    const message = { to: "0x0000000000000000000000000000000000000002" as const, district: 1, amount: 20_000_000_000_000_000n, spawnId: keccak256(stringToHex("AAPLB-TEST")), nonce: 1n, deadline: 1792758600n };
    const digest = hashTypedData({ domain, types: VOUCHER_TYPES, primaryType: "GameVoucher", message });
    assert.notEqual(digest, hashTypedData({ domain: { ...domain, verifyingContract: "0x0000000000000000000000000000000000000003" }, types: VOUCHER_TYPES, primaryType: "GameVoucher", message }));
    assert.notEqual(digest, hashTypedData({ domain, types: VOUCHER_TYPES, primaryType: "GameVoucher", message: { ...message, to: "0x0000000000000000000000000000000000000004" } }));
  });
  it("requires every recipient to submit through its own Agent ID wallet", () => {
    const claimSource = source.slice(source.indexOf("function claimGameVoucher("), source.indexOf("function _recoverSigner("));
    assert.ok(claimSource.includes("if (msg.sender != to) revert NotRecipient();"));
    assert.ok(claimSource.includes("if (IERC721(AGENT_ID_NFT).balanceOf(msg.sender) == 0) revert AgentIdRequired();"));
    assert.ok(claimSource.includes("if (gameNonceUsed[nonce]) revert GameNonceUsed();"));
  });
});