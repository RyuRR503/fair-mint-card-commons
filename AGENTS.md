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
- FAGENT navigation uses independent leaf routes: mint at `/`, market at `/market`, commands at `/commands`, vault at `/vault`, and rules at `/rules`; shared CardNavigation and CardExperience preserve consistent styling while each URL remains directly accessible with its own metadata.
- FAGENT reads the deployed BNB Chain Vault through read-only server functions and TanStack Query; never call unrelated game services or initialize Cloud auth for public chain data.
- Generate the contract ABI from the selected Solidity source; one shared deployment configuration supplies all readers and Agent commands to avoid address/signature drift.
- Transactions remain user-confirmed Binance Agent Wallet commands; the website never signs, submits transactions, or fabricates successful on-chain actions.
- Reuse FagentLogo and AgentCardArt with project-owned asset pointers; this preserves the approved identity after remixing.
- Keep colors and card treatments in semantic tokens in src/styles.css; this preserves the established theme across all card views.
- Keep drizzle/schema.ts blank and the new project's migration journal empty until a new schema is explicitly requested; copied migrations must never initialize this database.
- Preserve generated Cloud integration files but leave them unused by the standalone preview; platform-managed configuration must not be hand-edited.
