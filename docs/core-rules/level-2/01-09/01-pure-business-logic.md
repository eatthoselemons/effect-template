# [Pure-Business-Logic] Domain ops, checks, and policies are pure and deterministic

Domain operations, checks, and policies should be pure functions with no I/O or service dependencies. This keeps your business logic testable, composable, and easy to reason about.

**❌ WRONG - Check using database service:**
```typescript
// DON'T DO THIS - check calls a service
import { Effect } from "effect"
import { Database } from "../services/Database"

export const hasActiveSubscription = (userId: UserId): Effect.Effect<boolean, DatabaseError> =>
  Effect.gen(function*() {
    const db = yield* Database
    const user = yield* db.findUser(userId)
    return user.subscription.status === "active"
  })
```

**❌ WRONG - Policy with I/O:**
```typescript
// DON'T DO THIS - policy does I/O
export const canPurchaseItem = (userId: UserId, itemId: ItemId): Effect.Effect<Decision, PurchaseError> =>
  Effect.gen(function*() {
    const inventory = yield* InventoryService
    const stock = yield* inventory.getStock(itemId)
    
    return stock > 0 ? Allow : Deny
  })
```

**✅ CORRECT - Pure check function:**
```typescript
// Pure function - takes all data as parameters
export const hasActiveSubscription = (user: User): boolean =>
  user.subscription.status === "active" && 
  user.subscription.expiresAt > new Date()
```

**✅ CORRECT - Pure policy with all context:**
```typescript
// Pure function - all dependencies passed as parameters
export const canPurchaseItem = (
  user: User,
  item: Item,
  inventory: Inventory
): Decision => {
  const hasStock = inventory.items[item.id]?.quantity > 0
  const hasEnoughPoints = user.points >= item.cost
  
  if (!hasStock) {
    return { allowed: false, reason: "out-of-stock" }
  }
  
  if (!hasEnoughPoints) {
    return { allowed: false, reason: "insufficient-points" }
  }
  
  return { allowed: true }
}
```

**✅ CORRECT - Workflow orchestrates I/O and calls pure policy:**
```typescript
// Workflows handle I/O, policies stay pure
export const purchaseItem = (userId: UserId, itemId: ItemId): Effect.Effect<PurchaseResult, PurchaseError> =>
  Effect.gen(function*() {
    const userService = yield* UserService
    const inventoryService = yield* InventoryService
    
    // Gather data from services
    const user = yield* userService.getUser(userId)
    const item = yield* inventoryService.getItem(itemId)
    const inventory = yield* inventoryService.getInventory()
    
    // Call pure policy
    const decision = canPurchaseItem(user, item, inventory)
    
    if (!decision.allowed) {
      return yield* Effect.fail({ _tag: "PurchaseDenied", reason: decision.reason })
    }
    
    // Continue with purchase...
    return yield* inventoryService.reserveItem(itemId)
  })
```

This separation ensures your business logic is deterministic and can be unit tested without mocking services.
