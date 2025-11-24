# Amp Agent Configuration

## Primary Context
@docs/core-rules/global-context.md

## Topic-Specific Rules (Conditional)
@docs/core-rules/topics/architecture.md
@docs/core-rules/topics/data-modeling.md
@docs/core-rules/topics/workflows.md
@docs/core-rules/topics/testing.md
@docs/core-rules/topics/naming.md

## Common Commands
- Build: `pnpm build`
- Test: `pnpm test`
- Typecheck: `pnpm tsc --noEmit`
- Lint: `pnpm lint`
- Format: `pnpm prettier --write .`

## Development Workflow
1. **Iterate on Types**: Develop the feature and iterate until it passes type checks using the toolbox (`tb__check-types`).
   - **Tip**: Use the `tb__hover` tool to inspect variables and help fix type issues.
2. **Iterate on Tests**: Once types are valid, iterate until tests pass using the toolbox (`tb__run-tests`).

