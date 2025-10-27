# [Checks-Definition] Check: A small, context-light predicate that answers a domain question with yes/no

Checks are pure, focused functions that answer specific domain questions with boolean results. They require minimal context and are highly composable.

**❌ WRONG - Check doing I/O:**
```typescript
// DON'T DO THIS - check calls external service
export const hasActiveSubscription = (userId: UserId): Effect.Effect<boolean, DatabaseError> =>
  Effect.gen(function*() {
    const db = yield* Database
    const user = yield* db.findUser(userId)  // ❌ I/O in check
    return user.subscription.status === "active"
  })
```

**❌ WRONG - Check with too much context:**
```typescript
// DON'T DO THIS - check needs entire system state
export const canPurchase = (
  user: User,
  product: Product,
  inventory: Inventory,
  currentPromotion: Promotion,
  shippingRules: ShippingRule[],
  paymentMethods: PaymentMethod[],
  cart: ShoppingCart
): boolean => {
  // ❌ Too much context - this is a policy, not a check
  // ...
}
```

**❌ WRONG - Check making decisions:**
```typescript
// DON'T DO THIS - check contains business logic
export const validateCheckout = (user: User, cart: Cart): CheckoutDecision => {
  // ❌ This is a policy, not a check - makes decisions
  if (!hasActiveSubscription(user)) {
    return { allowed: false, reason: "no-subscription" }
  }
  if (cart.total > user.balance) {
    return { allowed: false, reason: "insufficient-funds" }
  }
  return { allowed: true }
}
```

**✅ CORRECT - Simple domain checks:**
```typescript
// Pure predicates answering specific questions

export const hasActiveSubscription = (user: User): boolean =>
  user.subscription.status === "active" &&
  user.subscription.expiresAt > new Date()

export const isAdult = (user: User): boolean =>
  user.age >= 18

export const isEmailVerified = (user: User): boolean =>
  user.emailVerifiedAt !== null

export const hasPermission = (user: User, permission: Permission): boolean =>
  user.permissions.includes(permission)

export const isInStock = (product: Product): boolean =>
  product.stockQuantity > 0

export const isOnSale = (product: Product): boolean =>
  product.salePrice !== null &&
  product.saleEndDate > new Date()
```

**✅ CORRECT - Focused checks with minimal context:**
```typescript
// Each check answers one question clearly

export const isValidOrderStatus = (status: OrderStatus): boolean =>
  ["pending", "processing", "shipped", "delivered"].includes(status)

export const canTransitionTo = (from: OrderStatus, to: OrderStatus): boolean => {
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: []
  }
  return validTransitions[from]?.includes(to) ?? false
}

export const hasEnoughBalance = (user: User, amount: Money): boolean =>
  user.balance >= amount

export const isWithinQuantityLimit = (quantity: number, limit: number): boolean =>
  quantity > 0 && quantity <= limit

export const isExpired = (expiryDate: Date): boolean =>
  expiryDate < new Date()
```

**✅ CORRECT - Composable checks:**
```typescript
// Small checks that can be combined

export const isActiveUser = (user: User): boolean =>
  user.status === "active" && !user.deletedAt

export const hasVerifiedEmail = (user: User): boolean =>
  user.emailVerifiedAt !== null

export const hasCompletedProfile = (user: User): boolean =>
  user.name !== "" &&
  user.email !== "" &&
  user.profilePicture !== null

export const isEligibleForPremium = (user: User): boolean =>
  isActiveUser(user) &&  // ✅ Compose checks
  hasVerifiedEmail(user) &&
  hasCompletedProfile(user)
```

**✅ CORRECT - Data comparison checks:**
```typescript
// Compare values without side effects

export const isPriceMatch = (productPrice: Money, cartPrice: Money): boolean =>
  productPrice === cartPrice

export const isWithinDateRange = (date: Date, start: Date, end: Date): boolean =>
  date >= start && date <= end

export const meetsMinimumOrder = (orderTotal: Money, minimum: Money): boolean =>
  orderTotal >= minimum

export const hasRequiredFields = <T extends Record<string, unknown>>(
  obj: T,
  requiredFields: (keyof T)[]
): boolean =>
  requiredFields.every(field => obj[field] !== null && obj[field] !== undefined)
```

**✅ CORRECT - Array and collection checks:**
```typescript
// Check properties of collections

export const hasItems = <T>(items: T[]): boolean =>
  items.length > 0

export const isWithinLimit = <T>(items: T[], limit: number): boolean =>
  items.length <= limit

export const containsItem = <T>(items: T[], predicate: (item: T) => boolean): boolean =>
  items.some(predicate)

export const allItemsMatch = <T>(items: T[], predicate: (item: T) => boolean): boolean =>
  items.every(predicate)

// Usage
export const allItemsInStock = (items: OrderItem[]): boolean =>
  allItemsMatch(items, item => item.product.stockQuantity > 0)
```

**✅ CORRECT - Type guard checks:**
```typescript
// Type-safe predicates

export const isAdminUser = (user: User): user is User & { role: "admin" } =>
  user.role === "admin"

export const isPremiumProduct = (product: Product): product is PremiumProduct =>
  product.tier === "premium"

export const hasDiscount = (price: Price): price is Price & { discount: number } =>
  "discount" in price && price.discount > 0

// Used in filtering and type narrowing
const admins = users.filter(isAdminUser)  // Type: (User & { role: "admin" })[]
```

**✅ CORRECT - Checks used in policies:**
```typescript
// Checks compose into policies

// Individual checks
export const isActiveUser = (user: User): boolean =>
  user.status === "active"

export const hasVerifiedEmail = (user: User): boolean =>
  user.emailVerifiedAt !== null

export const hasEnoughPoints = (user: User, cost: number): boolean =>
  user.points >= cost

export const isProductAvailable = (product: Product): boolean =>
  product.stockQuantity > 0 && !product.discontinued

// Policy uses checks (will be detailed in next rule)
export const canPurchaseProduct = (user: User, product: Product): Decision => {
  // Policies orchestrate checks
  if (!isActiveUser(user)) {
    return { allowed: false, reason: "user-not-active" }
  }
  
  if (!hasVerifiedEmail(user)) {
    return { allowed: false, reason: "email-not-verified" }
  }
  
  if (!isProductAvailable(product)) {
    return { allowed: false, reason: "product-unavailable" }
  }
  
  if (!hasEnoughPoints(user, product.pointsCost)) {
    return { allowed: false, reason: "insufficient-points" }
  }
  
  return { allowed: true }
}
```

Checks are the atomic building blocks of business logic - small, pure, testable predicates that answer single domain questions.
