# Uploaded VaultEx / Trigger revision

`MapCityBeaconFactory.flat.sol` is the user's verbatim upload received on 2026-10-23.

- SHA-256: `1aa031a185f2e3fc4089908d927cf9a56e55aa422e0d145abef305e1494c2b71`.
- Exact compiler: Solidity `0.8.24`.
- ABI-only standard JSON compilation succeeded. This is not bytecode-size validation, a security audit, a fork execution test, or deployed-state verification.
- Generated vault and factory ABIs are in `src/lib/contracts/`. `src/lib/vault.ts` exports them; the EIP-712 voucher type and domain remain unchanged.
- The legacy PancakeSwap contract and its tests are deliberately not overwritten. Do not deploy this as an upgrade of an existing legacy proxy without comparing storage layouts.

## Signer setup

Call `setGameSigner(address)` on the deployed **vault proxy**, not the factory, beacon, or implementation. Only that vault's owner or Flap Guardian can call it. Initialization leaves `gameSigner` unset. Read it back afterward.

The configured address must match the account derived from the backend `CLAIM_SIGNER_KEY`. This revision verifies a 65-byte ECDSA signature with `ecrecover`; it does not support ERC-1271 contract-wallet signatures. Use a dedicated signing key held only in backend secrets, not the owner's funding key. Setting the signer to zero blocks future voucher claims; rotating it invalidates unredeemed signatures from the old signer.

EIP-712 domain: name `MapCityVault`, version `1`, chain ID `56` on BSC mainnet, verifying contract = deployed vault proxy. Voucher fields, in order:

`GameVoucher(address to,uint8 district,uint256 amount,bytes32 spawnId,uint256 nonce,uint256 deadline)`

The calling address must equal `to`, and its NFT balance at the hardcoded `AGENT_ID_NFT` address must exceed zero. Ordinary relaying from a different caller cannot satisfy this requirement. The identity constant and the actual Agent wallet call mode must be verified on-chain and against the wallet provider before enabling claims.

## Outstanding end-to-end work

1. Obtain and verify deployed factory/vault addresses, owner, chain, implementation, and signer.
2. Prove the claimant controls the Agent recipient; do not trust a client-supplied address or a label saying "Agent".
3. Apply server-side location/rate-limit checks and atomically reserve each point/voucher before signing. GPS is not verified by this contract.
4. Provide a short-lived command resolved by an authenticated Agent caller, bound to the same recipient. Submit the voucher from that exact Agent address.
5. Verify the successful transaction receipt and `GameRewardClaimed` event (vault, recipient, district, spawn ID, amount, nonce), then confirm payment in the UI. The legacy transaction-record endpoint accepts a hash without validating a receipt and is not sufficient.
6. Replace proof-page fallback/demo amounts and legacy refill descriptions with this revision's actual reads and VaultEx/Trigger lifecycle before declaring it live.
7. Test real payout, expired/replayed/wrong-recipient/ordinary-wallet/wrong-signer/insufficient-stock cases, and Trigger reserve and VaultEx settlement failures.

## Material differences requiring user attention

- This revision routes swaps through Flap VaultEx and automation through Flap Trigger; it is not the legacy direct PancakeSwap router implementation. Trigger reserve and asynchronous settlement are essential.
- Guardian has fund-withdrawal control; the owner does **not**. This conflicts with the user's previously requested owner-full-control policy. Preserve the upload and ask for a decision before changing those permissions.
- Factory upgrades affect every proxy using its beacon. Owner/Guardian factory upgrade permission does not establish storage compatibility with older vaults.
- The contract enforces identity, recipient, signature, expiry, nonce and inventory checks, not GPS, per-user daily rules, or truth of AI execution. A compromised signer can authorize payouts to eligible Agent ID holders up to available stock.