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
- Use the shared CatchLettering image component for homepage and navigation brand lettering so approved letter shapes remain identical across sizes.
- Vault inventory is the live bStocks balance (`gamePool` = balanceOf), never a counter — bStocks can rebase.
- Vault refills BNB->bStocks via per-district PancakeSwap V3/V2 routes stored on-chain, permissionless and guarded by a per-district price ruler; tokens without Chainlink use contracts/TwapUsdFeed.sol (immutable V3 TWAP) so every district stays swappable by anyone.
- District order in contracts/MapCityVault.sol is fixed and must match DISTRICT_BY_SYMBOL in src/lib/tokens.ts.
- Contract fork tests live in contracts/test/Fork.t.sol (Foundry, BSC mainnet fork via BSC_RPC + BLOCK env).

- Shared website colors and cover-image treatments are defined in src/styles.css semantic tokens; company identity and rarity colors remain distinct so theme changes do not erase asset recognition.
- Decorative city signals are isolated from live map data and claim status; motion uses transforms and opacity with reduced-motion fallbacks so visual polish cannot imply GPS validation or payouts.
- CityMarketScene loads Three.js only after hydration, derives its palette from CSS tokens, and owns disposable decorative scene resources; keep it independent of real GPS, pricing and claims.
- CityMarketScene owns bounded, delta-time-smoothed pointer movement for feathered photograph depth slices and independent scene depth groups; disable parallax for reduced motion and touch to preserve reading and scrolling.
- The homepage uses one bounded sticky city backdrop and CityMarketScene scroll progression through the Agent journey into the live map; keep native scrolling, restore inline animation properties on cleanup, and avoid shared-component changes for homepage-only choreography.

- Agent claim presentation policy lives in src/lib/agent-claims.ts and shared AgentJourney UI; while integration is pending, the map page must not issue vouchers or submit legacy browser-wallet claims, so previews cannot appear to award real assets.
