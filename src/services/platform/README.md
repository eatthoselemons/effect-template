# Platform Services

**Content**: Infrastructure Implementations (Adapters).

## Rules
1. **Implementation**: Implements the interfaces defined in `src/domain/interfaces/`.
2. **Impure**: Contains the actual I/O (SQL, Fetch, File System).
3. **Dumb**: Should not contain business rules. Just executes the command.

## Example

```typescript
export const StripeService = Layer.succeed(PaymentRepo, {
  charge: (amount) => ...
})
```
