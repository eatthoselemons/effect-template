---
globs:
  - "**/*.test.ts"
  - "**/test/**"
---
# Testing Strategy

1. **Unit Tests for Pure Logic**:
   - Test `domain/ops` and `policies` using standard `vitest` assertions. No mocks needed.
   - `expect(MoneyOps.add(a, b)).toEqual(c)`

2. **Test Layers for Workflows**:
   - Test Workflows by providing *Test Layers* (in-memory implementations) for Services.
   - `const result = await program.pipe(Effect.provide(TestDatabaseLayer), Effect.runPromise)`

3. **Integration Tests for Adapters**:
   - Test `src/services/adapters` against real infrastructure (Docker/TestContainers).
   - Do not mock the database in an adapter test; that defeats the purpose.

4. **No Mocks**: Avoid `jest.fn()` or traditional spies. Use `Effect` layers to swap implementations.
