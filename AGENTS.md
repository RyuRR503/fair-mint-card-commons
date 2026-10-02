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
- Vault inventory is the live bStocks balance (`gamePool` = balanceOf), never a counter — bStocks can rebase.
- Vault refills BNB->bStocks via per-district PancakeSwap V3/V2 routes stored on-chain; Chainlink-guarded when a feed exists, keeper-only otherwise.
- District order in contracts/MapCityVault.sol is fixed and must match DISTRICT_BY_SYMBOL in src/lib/tokens.ts.
- Contract fork tests live in contracts/test/Fork.t.sol (Foundry, BSC mainnet fork via BSC_RPC + BLOCK env).
