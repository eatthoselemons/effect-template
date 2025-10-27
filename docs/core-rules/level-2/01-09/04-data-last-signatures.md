# [Data-Last-Signatures] Use data-last function signatures to enable composition with `pipe`

Functions should take their primary data parameter last to enable elegant composition with Effect's `pipe` function. This makes data flow clear and eliminates nested function calls.

**❌ WRONG - Data-first signature:**
```typescript
// DON'T DO THIS - data comes first
export const filterActiveUsers = (users: User[]): User[] =>
  users.filter(u => u.status === "active")

export const sortByName = (users: User[]): User[] =>
  users.sort((a, b) => a.name.localeCompare(b.name))

export const take = (users: User[], n: number): User[] =>
  users.slice(0, n)

// Results in nested function calls ❌
const result = take(sortByName(filterActiveUsers(users)), 10)
// Hard to read - must read inside-out
```

**❌ WRONG - Inconsistent parameter ordering:**
```typescript
// DON'T DO THIS - mixing data positions
export const validateOrder = (order: Order, rules: ValidationRule[]): boolean => { }
export const applyDiscount = (discount: Discount, order: Order): Order => { }
export const calculateTax = (order: Order, rate: number): Money => { }

// Can't compose smoothly
```

**✅ CORRECT - Data-last signature:**
```typescript
// Configuration/options first, data last
export const filterActiveUsers = (users: User[]): User[] =>
  users.filter(u => u.status === "active")

export const sortByName = (users: User[]): User[] =>
  users.sort((a, b) => a.name.localeCompare(b.name))

export const take = (n: number) => (users: User[]): User[] =>
  users.slice(0, n)

// Clean composition with pipe ✅
const result = pipe(
  users,
  filterActiveUsers,
  sortByName,
  take(10)
)
// Clear top-to-bottom data flow
```

**✅ CORRECT - Complex data transformations:**
```typescript
// Each function takes config first, data last
export const filterByStatus = (status: UserStatus) => (users: User[]): User[] =>
  users.filter(u => u.status === status)

export const sortBy = <T>(compareFn: (a: T, b: T) => number) => (items: T[]): T[] =>
  [...items].sort(compareFn)

export const paginate = (page: number, pageSize: number) => <T>(items: T[]): T[] =>
  items.slice(page * pageSize, (page + 1) * pageSize)

// Compose multiple operations
const getActiveUserPage = (page: number) =>
  pipe(
    filterByStatus("active"),
    sortBy((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
    paginate(page, 20)
  )

const users = getActiveUserPage(0)(allUsers)
```

**✅ CORRECT - Effect operations follow data-last:**
```typescript
// Effect functions are designed for pipe
export const validateUserEmail = (email: string): Effect.Effect<Email, ValidationError> =>
  pipe(
    email,
    Schema.decode(EmailSchema),  // ✅ Schema goes through data
    Effect.mapError(error => ({ _tag: "ValidationError", error }))
  )

export const processOrder = (orderId: OrderId): Effect.Effect<ProcessedOrder, OrderError> =>
  pipe(
    getOrder(orderId),  // Returns Effect
    Effect.flatMap(order => validateOrder(order)),  // ✅ Data flows through
    Effect.flatMap(order => calculateTotal(order)),
    Effect.flatMap(order => applyDiscounts(order)),
    Effect.tap(order => logProcessing(order))
  )
```

**✅ CORRECT - Custom business functions:**
```typescript
// Domain functions with data-last pattern
export const applyDiscount = (discount: Discount) => (order: Order): Order => ({
  ...order,
  items: order.items.map(item => ({
    ...item,
    price: item.price * (1 - discount.percentage)
  })),
  discountApplied: discount
})

export const addShipping = (shippingCost: Money) => (order: Order): Order => ({
  ...order,
  shippingCost,
  total: order.total + shippingCost
})

export const calculateFinalOrder = (discount: Discount, shipping: Money) => (order: Order): Order =>
  pipe(
    order,
    applyDiscount(discount),
    addShipping(shipping)
  )
```

**✅ CORRECT - Service methods can use data-last:**
```typescript
export interface UserService {
  // When it makes sense, data-last even in services
  readonly findByStatus: (status: UserStatus) => Effect.Effect<User[], UserError>
  readonly updateUser: (updates: Partial<User>) => (userId: UserId) => Effect.Effect<User, UserError>
}

// Usage enables clean composition
const activateUser = (userId: UserId): Effect.Effect<User, UserError> =>
  pipe(
    userId,
    userService.updateUser({ status: "active", activatedAt: new Date() })
  )
```

Data-last signatures make your code read like a pipeline, clearly showing data transformations from top to bottom.
