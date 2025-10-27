# [Policies-Definition] Policy: A business decision rule. It composes checks, considers context

Policies are pure functions that make business decisions by composing checks and considering context. They return structured decisions with reasons, not just booleans.

**❌ WRONG - Policy doing I/O:**
```typescript
// DON'T DO THIS - policy calls services
export const canCheckout = (userId: UserId, cartId: CartId): Effect.Effect<Decision, CheckoutError> =>
  Effect.gen(function*() {
    const db = yield* Database
    const user = yield* db.getUser(userId)  // ❌ I/O in policy
    const cart = yield* db.getCart(cartId)
    
    return user.balance >= cart.total
      ? { allowed: true }
      : { allowed: false, reason: "insufficient-funds" }
  })
```

**❌ WRONG - Policy returning only boolean:**
```typescript
// DON'T DO THIS - no reason for decision
export const canPurchase = (user: User, product: Product): boolean => {
  // ❌ Returns boolean, loses information about why
  return user.points >= product.cost && product.stockQuantity > 0
}

// Caller doesn't know why purchase was denied
```

**❌ WRONG - Policy with unclear decision structure:**
```typescript
// DON'T DO THIS - inconsistent return values
export const validateOrder = (order: Order): string | null | boolean => {
  if (order.items.length === 0) return "empty-cart"  // ❌ string
  if (order.total < 0) return false  // ❌ boolean  
  return null  // ❌ What does null mean?
}
```

**✅ CORRECT - Policy with structured decision:**
```typescript
// Decision type with clear structure
export type Decision<TReason extends string = string> =
  | { allowed: true }
  | { allowed: false; reason: TReason }

// Policy composes checks and returns structured decision
export const canPurchaseProduct = (
  user: User, 
  product: Product
): Decision<"user-inactive" | "email-unverified" | "out-of-stock" | "insufficient-points"> => {
  // Compose multiple checks
  if (!isActiveUser(user)) {
    return { allowed: false, reason: "user-inactive" }
  }
  
  if (!hasVerifiedEmail(user)) {
    return { allowed: false, reason: "email-unverified" }
  }
  
  if (!isInStock(product)) {
    return { allowed: false, reason: "out-of-stock" }
  }
  
  if (!hasEnoughPoints(user, product.pointsCost)) {
    return { allowed: false, reason: "insufficient-points" }
  }
  
  return { allowed: true }
}
```

**✅ CORRECT - Policy with rich context:**
```typescript
// Policy considers multiple aspects of context
export type OrderDecision = Decision<
  | "empty-cart"
  | "minimum-not-met"
  | "address-invalid"
  | "payment-method-missing"
  | "items-unavailable"
>

export const canPlaceOrder = (
  order: Order,
  user: User,
  inventory: Inventory
): OrderDecision => {
  // Check each business rule
  if (order.items.length === 0) {
    return { allowed: false, reason: "empty-cart" }
  }
  
  if (order.total < 10) {  // $10 minimum
    return { allowed: false, reason: "minimum-not-met" }
  }
  
  if (!hasValidAddress(order.shippingAddress)) {
    return { allowed: false, reason: "address-invalid" }
  }
  
  if (!order.paymentMethodId) {
    return { allowed: false, reason: "payment-method-missing" }
  }
  
  // Check all items against inventory
  const unavailableItems = order.items.filter(
    item => !isAvailableInInventory(item, inventory)
  )
  
  if (unavailableItems.length > 0) {
    return { allowed: false, reason: "items-unavailable" }
  }
  
  return { allowed: true }
}
```

**✅ CORRECT - Composing policies:**
```typescript
// Small policies compose into larger ones
export const canAccessResource = (user: User, resource: Resource): Decision<"not-owner" | "insufficient-permission"> => {
  if (resource.ownerId !== user.id) {
    return { allowed: false, reason: "not-owner" }
  }
  
  if (!hasPermission(user, resource.requiredPermission)) {
    return { allowed: false, reason: "insufficient-permission" }
  }
  
  return { allowed: true }
}

export const canDeleteResource = (
  user: User, 
  resource: Resource
): Decision<"not-owner" | "insufficient-permission" | "resource-locked"> => {
  // Compose with another policy
  const accessDecision = canAccessResource(user, resource)
  if (!accessDecision.allowed) {
    return accessDecision  // ✅ Forward the decision
  }
  
  if (resource.locked) {
    return { allowed: false, reason: "resource-locked" }
  }
  
  return { allowed: true }
}
```

**✅ CORRECT - Policy with detailed decision metadata:**
```typescript
// Rich decision with metadata
export type DetailedDecision<TReason extends string = string> =
  | { allowed: true }
  | { 
      allowed: false
      reason: TReason
      message: string
      details?: Record<string, unknown>
    }

export const canApplyDiscount = (
  user: User,
  discount: Discount,
  cart: Cart
): DetailedDecision<"discount-expired" | "minimum-not-met" | "already-applied" | "user-ineligible"> => {
  if (isExpired(discount.expiresAt)) {
    return {
      allowed: false,
      reason: "discount-expired",
      message: "This discount code has expired",
      details: { expiredAt: discount.expiresAt }
    }
  }
  
  if (cart.total < discount.minimumPurchase) {
    return {
      allowed: false,
      reason: "minimum-not-met",
      message: `Minimum purchase of $${discount.minimumPurchase} required`,
      details: { 
        currentTotal: cart.total,
        required: discount.minimumPurchase,
        remaining: discount.minimumPurchase - cart.total
      }
    }
  }
  
  if (cart.discountCode !== null) {
    return {
      allowed: false,
      reason: "already-applied",
      message: "A discount is already applied to this cart"
    }
  }
  
  if (discount.eligibleUserIds && !discount.eligibleUserIds.includes(user.id)) {
    return {
      allowed: false,
      reason: "user-ineligible",
      message: "This discount is not available for your account"
    }
  }
  
  return { allowed: true }
}
```

**✅ CORRECT - Policy for state transitions:**
```typescript
// Policy governing valid transitions
export type TransitionDecision = Decision<
  | "invalid-current-status"
  | "invalid-transition"
  | "missing-required-field"
  | "already-finalized"
>

export const canTransitionOrder = (
  order: Order,
  newStatus: OrderStatus
): TransitionDecision => {
  // Check current state validity
  if (!isValidOrderStatus(order.status)) {
    return { allowed: false, reason: "invalid-current-status" }
  }
  
  // Check if transition is allowed
  if (!canTransitionTo(order.status, newStatus)) {
    return { allowed: false, reason: "invalid-transition" }
  }
  
  // Prevent transitions from final states
  if (order.status === "delivered" || order.status === "cancelled") {
    return { allowed: false, reason: "already-finalized" }
  }
  
  // Check transition-specific requirements
  if (newStatus === "shipped" && !order.trackingNumber) {
    return { allowed: false, reason: "missing-required-field" }
  }
  
  return { allowed: true }
}
```

**✅ CORRECT - Policies used in workflows:**
```typescript
// Workflow uses policy to make decisions
export const purchaseProduct = (
  userId: UserId,
  productId: ProductId
): Effect.Effect<PurchaseResult, PurchaseError> =>
  Effect.gen(function*() {
    // Gather data from services
    const userService = yield* UserService
    const productService = yield* ProductService
    
    const user = yield* userService.getUser(userId)
    const product = yield* productService.getProduct(productId)
    
    // Call pure policy
    const decision = canPurchaseProduct(user, product)
    
    // Handle decision
    if (!decision.allowed) {
      return yield* Effect.fail({
        _tag: "PurchaseDenied",
        reason: decision.reason
      })
    }
    
    // Proceed with purchase...
    const updated = yield* userService.deductPoints(userId, product.pointsCost)
    const reserved = yield* productService.reserveProduct(productId)
    
    return {
      _tag: "PurchaseSuccess",
      user: updated,
      product: reserved
    }
  })
```

**✅ CORRECT - Testing policies:**
```typescript
// Policies are easy to test - no mocking needed
describe("canPurchaseProduct", () => {
  it("denies inactive user", () => {
    const inactiveUser: User = {
      id: UserId.make("u1"),
      status: "inactive",
      emailVerifiedAt: new Date(),
      points: 100
    }
    
    const product: Product = {
      id: ProductId.make("p1"),
      stockQuantity: 5,
      pointsCost: 50
    }
    
    const decision = canPurchaseProduct(inactiveUser, product)
    
    expect(decision).toEqual({
      allowed: false,
      reason: "user-inactive"
    })
  })
  
  it("allows valid purchase", () => {
    const activeUser: User = {
      id: UserId.make("u1"),
      status: "active",
      emailVerifiedAt: new Date(),
      points: 100
    }
    
    const product: Product = {
      id: ProductId.make("p1"),
      stockQuantity: 5,
      pointsCost: 50
    }
    
    const decision = canPurchaseProduct(activeUser, product)
    
    expect(decision).toEqual({ allowed: true })
  })
})
```

Policies encode business rules as pure, testable functions that compose checks and return structured decisions with clear reasoning.
