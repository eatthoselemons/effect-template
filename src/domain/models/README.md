# Domain Models

**Content**: Data Schemas (Types) and Pure Logic.

## Rules
1. **Co-location**: Define the Schema and the pure functions that operate on it in the same file.
2. **Purity**: Functions here must be 100% pure. No side effects.
3. **Scope**: Functions here should primarily operate on the entity defined in the file.

## Example (`Cart.ts`)

```typescript
import { Schema } from "@effect/schema"

export const Cart = Schema.Struct({ ... })
export type Cart = Schema.Schema.Type<typeof Cart>

// Pure Logic
export const isEmpty = (cart: Cart): boolean => cart.items.length === 0
```
