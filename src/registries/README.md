# Registries

**Content**: Dynamic Runtime Selection Logic.

## Usage
Use this ONLY when you need to select an implementation at runtime based on data (Strategy Pattern). 
For static wiring (e.g., "Always use Postgres in Prod"), use `src/layers/`.

## Example

```typescript
export const getPaymentService = (strategy: 'RETAIL' | 'WHOLESALE') =>
  strategy === 'RETAIL' ? StripeService : BankService
```
