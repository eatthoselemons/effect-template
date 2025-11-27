# Amp Agent Configuration

## Primary Context
@docs/core-rules/global-context.md

## Topic-Specific Rules (Conditional)
@docs/core-rules/topics/architecture.md
@docs/core-rules/topics/data-modeling.md
@docs/core-rules/topics/workflows.md
@docs/core-rules/topics/testing.md
@docs/core-rules/topics/naming.md
@docs/core-rules/topics/design-process.md

## Common Commands
- Build: `pnpm build`
- Test: `pnpm test`
- Typecheck: `pnpm tsc --noEmit`
- Lint: `pnpm lint`
- Format: `pnpm prettier --write .`

## Development Workflow
1. **Types**: Iterate with `tb__check-types` until valid. Use `tb__hover` to debug.
2. **Tests**: Once types pass, iterate with `tb__run-tests` until passing.

