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
- This standalone FAGENT project serves the card experience at `/` and its separate rules at `/rules`; keep the TanStack Start bootstrap and leaf metadata so navigation and sharing remain independent.
- FAGENT remains a local-only preview backed by agent-card-model until deployment addresses are supplied; do not call unrelated game services or initialize Cloud auth for preview interactions.
- Reuse FagentLogo and AgentCardArt with project-owned asset pointers; this preserves the approved identity after remixing.
- Keep colors and card treatments in semantic tokens in src/styles.css; this preserves the established theme across all card views.
- Keep drizzle/schema.ts blank and the new project's migration journal empty until a new schema is explicitly requested; copied migrations must never initialize this database.
- Preserve generated Cloud integration files but leave them unused by the standalone preview; platform-managed configuration must not be hand-edited.
