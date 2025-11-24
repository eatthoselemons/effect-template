---
globs:
  - "src/workflows/**/*.ts"
---
# Workflows & Effects Rules

1. **Use Effect.gen**: Prefer `Effect.gen` generators over chained combinators for readability.
   `Effect.gen(function*() { const user = yield* UserService.get(id); ... })`

2. **Data-Last Signatures**: Functions should accept data as the last argument to support `pipe`.
   `const multiply = (factor: number) => (value: number) => value * factor`

3. **Typed Errors**: Use Discriminated Unions for errors. Avoid generic `Error`.
   `class UserNotFound extends Data.TaggedError("UserNotFound")<{ id: string }> {}`

4. **Explicit Service Dependencies**: Workflows must consume Services via Context/Tag, never direct import of implementations.
   `const program = Effect.gen(function*() { const db = yield* DatabaseService; ... })`

5. **Safe Ordering**: Perform irreversible effects (Emails, Charges) *last* in the workflow.
   `yield* Database.save(); yield* Email.send();` (Retrying DB is safe; retrying Email is spam).

6. **Idempotency**: All Workflows should be designed to be retried. Accept `idempotencyKey` where applicable.

7. **State Persistence**: If a workflow is critical (money, data), persist state transitions (e.g., "OrderCreated" event) *before* performing external effects. This enables replay/recovery.
   `yield* EventStore.append("OrderCreated"); yield* Payment.charge();`
