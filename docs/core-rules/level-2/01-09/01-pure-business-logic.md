# [Pure-Business-Logic] Domain logic lives in Models and Policies

## Context
We separate logic into three distinct categories to ensure testability and clarity:
1. **Domain Models**: Internal logic and facts about a single entity.
2. **Policies**: Business rules and decisions involving multiple entities.
3. **Workflows**: Orchestration of the above.

## Rules

### 1. Domain Models are Rich (Module Pattern)
Do not create "Anemic Domain Models" (types with no logic).
Co-locate the data definition (Schema) and the pure functions that operate on it.

- **Location**: `src/domain/models/<Entity>.ts`
- **Scope**: Single Entity.
- **Purity**: 100% Pure.

```typescript
// src/domain/models/Cart.ts
export const Cart = Schema.Struct({ ... })
export type Cart = Schema.Schema.Type<typeof Cart>

// Pure logic colocated
export const isEmpty = (cart: Cart): boolean => cart.items.length === 0
export const total = (cart: Cart): Money => ...
```

### 2. Policies make Business Decisions
When you need to make a decision based on rules, external context, or multiple entities, use a Policy.
Policies do not *do* the action; they decide *if* or *how* it should be done.

- **Location**: `src/policies/<Domain>/<Policy>.ts`
- **Scope**: Multi-entity, Context-aware.
- **Purity**: 100% Pure.

```typescript
// src/policies/payment/routing.ts
export const determineStrategy = (amount: Money): PaymentStrategy => 
  amount.value < 1000 ? 'RETAIL' : 'WHOLESALE'
```
