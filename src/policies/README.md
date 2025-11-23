# Policies

**Content**: Business Rules and Decision Logic.

## Rules
1. **Purity**: Must be pure.
2. **Context**: Can accept multiple entities and configuration to make a decision.
3. **Output**: Returns a Result or a Decision (Enum/Strategy), not a side effect.

## Example

```typescript
export const determinePaymentStrategy = (amount: number) => 
  amount < 1000 ? 'RETAIL' : 'WHOLESALE'
```
