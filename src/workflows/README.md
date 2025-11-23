# Workflows

**Content**: Orchestration Scripts (Transaction Scripts).

## Rules
1. **Orchestration**: Calls Domain Interfaces, Policies, and other Workflows.
2. **Impure**: This is where side effects happen (via the Interfaces).
3. **Composition**: Use `Effect.gen` to compose steps linearly.

## Example

```typescript
export const checkout = (cart: Cart) => Effect.gen(function*(_) {
  const strategy = Policy.determinePaymentStrategy(cart.total)
  const paymentSvc = yield* _(PaymentRegistry.get(strategy))
  yield* _(paymentSvc.charge(cart.total))
})
```
