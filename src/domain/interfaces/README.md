# Domain Interfaces

**Content**: Service Contracts (Ports).

## Rules
1. **Definition**: Define the capability using `Context.Tag`.
2. **No Implementation**: Do not include implementation details (SQL, HTTP calls) here.
3. **Naming**: Use names describing the *capability*, not the tool (e.g., `PaymentRepo`, not `StripeClient`).

## Example

```typescript
import { Context, Effect } from "effect"

export class PaymentRepo extends Context.Tag("PaymentRepo")<
  PaymentRepo,
  {
    readonly charge: (amount: number) => Effect.Effect<void, PaymentError>
  }
>() {}
```
