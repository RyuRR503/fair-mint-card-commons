<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Public map display reads use bounded, abortable per-isolate caching and in-flight coalescing; unavailable summaries must not block the homepage or imply zero inventory, and claim/payout validation must remain uncached by this display layer.
- Stock company and ETF logos are centrally mapped in brandMarks and rendered by TokenChip using static asset pointers (Apple/Tesla retain vector marks), so all pages share consistent identities without runtime logo lookup.
- Keep the uploaded VaultEx/Trigger revision verbatim in contracts/reference/MapCityBeaconFactory.flat.sol and generate its vault/factory ABIs with Solidity 0.8.24; legacy contracts/MapCityVault.sol and its fork tests remain separate because this revision is not a validated storage-compatible upgrade.
- Use the shared CatchLettering image component for homepage and coming-soon brand lettering; derive the shared header/footer logo and square favicon from the same approved upload, giving replacement icons new URLs to avoid stale browser caches.
- Vault inventory is the live bStocks balance (`gamePool` = balanceOf), never a counter — bStocks can rebase.
- Vault refills BNB->bStocks via per-district PancakeSwap V3/V2 routes stored on-chain, permissionless and guarded by a per-district price ruler; tokens without Chainlink use contracts/TwapUsdFeed.sol (immutable V3 TWAP) so every district stays swappable by anyone.
- District order in contracts/MapCityVault.sol is fixed and must match DISTRICT_BY_SYMBOL in src/lib/tokens.ts.
- Contract fork tests live in contracts/test/Fork.t.sol (Foundry, BSC mainnet fork via BSC_RPC + BLOCK env).

- Shared website colors and cover-image treatments are defined in src/styles.css semantic tokens; company identity and rarity colors remain distinct so theme changes do not erase asset recognition.
- Decorative city signals are isolated from live map data and claim status; motion uses transforms and opacity with reduced-motion fallbacks so visual polish cannot imply GPS validation or payouts.
- CitySignals owns sequential decorative location capture and expanding stock labels; CityMarketScene owns one geometry-aware scroll signal and Agent step illumination timeline, so each step lights only as that same signal arrives. Keep both independent of real GPS, pricing and claims, and honor playback pause and reduced-motion preference.
- The city photograph is a single stationary image; CityMarketScene only coordinates scroll handoff and does not render a canvas or pointer-driven photograph movement, so location signals remain the main city animation without blur.
- The homepage uses one bounded sticky city backdrop with explicit non-negative internal layers; scroll choreography updates through a passive scroll listener independently of WebGL availability, preserves native scrolling and readable content, and restores inline properties on cleanup.
- SiteMotion owns decorative reading progress and section emphasis; shared Reveal provides hydration-safe staggered entrances, while CityMarketScene owns the desktop sticky Agent journey. Preserve native scrolling, reduced-motion and playback fallbacks so motion never gates content or touches claim logic.

- Agent claims are two-step: the map's claimDrop runs on-site GPS and inventory checks and issues a single-use 15-minute claim code (claim_codes table, no wallet); the AI redeems it at /api/public/agent-claim with its own address, where Agent ID, wallet caps and signing happen, returning claimGameVoucher calldata. Users never type a wallet; on-site checks are skippable only on preview hosts.
- Claim size and live points derive from on-chain prices and vault inventory (src/lib/allocation.ts, liveBook in game.functions.ts), so the map never shows points the vault cannot pay.
- Published hosts are gated to /coming-soon by the root beforeLoad (src/lib/site-gate.ts); preview/dev hosts see the full site, so development stays previewable before launch.
- AI agent commands always target the published host's /api/public/agent-claim (catch.fun), never window.location.origin: preview hosts are login-walled and return 401 to outside callers.
- Claim progress is derived on read (src/lib/claim-status.ts): claim_codes → matching catches row → on-chain gameNonceUsed, with tx hash found via windowed eth_getLogs; the device keeps its own code list in localStorage, so no wallet login is needed to follow a claim.
