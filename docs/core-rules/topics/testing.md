---
globs:
  - "**/*.test.ts"
  - "**/test/**"
---
# Testing Strategy

## 1. The "Triad" Rule (Coverage Heuristic)
For every feature/workflow, you must write at least three specs:
1.  **Happy Path**: The standard success case.
2.  **Sad Path**: The expected failure mode (Typed Errors).
3.  **Edge Case**: Boundary conditions or empty states.

## 2. Unit Tests for Pure Logic
- Test `domain/ops` and `policies` using standard `vitest` assertions. No mocks needed.
- `expect(MoneyOps.add(a, b)).toEqual(c)`

## 3. Test Layers for Workflows
- Test Workflows by providing *Test Layers* (in-memory implementations) for Services.
- `const result = await program.pipe(Effect.provide(TestDatabaseLayer), Effect.runPromise)`

## 4. Integration Tests for Adapters
- Test `src/services/adapters` against real infrastructure (Docker/TestContainers).
- Do not mock the database in an adapter test; that defeats the purpose.

## 5. No Mocks
- Avoid `jest.fn()` or traditional spies. Use `Effect` layers to swap implementations.
