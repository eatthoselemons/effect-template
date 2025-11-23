# Policies

**Content**: Business Rules and Decision Logic.

## Rules
1. **Purity**: Must be pure.
2. **Context**: Can accept multiple entities and configuration to make a decision.
3. **Output**: Returns a Result or a Decision (Enum/Strategy), not a side effect.

## Example

```typescript
export type PaymentStrategy = 'RETAIL' | 'WHOLESALE'

export const determinePaymentStrategy = (amount: number): PaymentStrategy => 
  amount < 1000 ? 'RETAIL' : 'WHOLESALE'
```
