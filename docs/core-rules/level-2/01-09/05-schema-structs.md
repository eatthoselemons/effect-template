# [Schema-Structs] Prefer Schema.Struct (plain objects)

Use `Schema.Struct` to define domain types as plain objects with validation. Avoid classes and inheritance - prefer composition of plain data structures.

**❌ WRONG - Using classes:**
```typescript
// DON'T DO THIS - class-based domain model
export class User {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public role: string
  ) {}

  isAdmin(): boolean {  // ❌ Methods on data
    return this.role === "admin"
  }

  toJSON() {  // ❌ Behavior mixed with data
    return { ...this }
  }
}

export class AdminUser extends User {  // ❌ Inheritance
  constructor(id: string, name: string, email: string) {
    super(id, name, email, "admin")
  }
}
```

**❌ WRONG - Plain TypeScript interfaces without validation:**
```typescript
// DON'T DO THIS - no runtime validation
export interface User {
  id: string  // ❌ No validation that this is a valid UUID
  name: string  // ❌ Could be empty string
  email: string  // ❌ Could be invalid email
  age: number  // ❌ Could be negative
}

// Data can be invalid at runtime
const user: User = {
  id: "not-a-uuid",
  name: "",
  email: "invalid",
  age: -5
}
```

**✅ CORRECT - Schema.Struct for domain types:**
```typescript
import { Schema } from "@effect/schema"

// Define schema with validation
export const UserSchema = Schema.Struct({
  id: Schema.UUID,  // ✅ Validates UUID format
  name: Schema.NonEmptyString,  // ✅ Cannot be empty
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),  // ✅ Email format
  age: Schema.Number.pipe(Schema.positive, Schema.int),  // ✅ Positive integer
  role: Schema.Literal("user", "admin", "moderator"),  // ✅ Only valid roles
  createdAt: Schema.Date
})

// Extract type from schema
export type User = Schema.Schema.Type<typeof UserSchema>

// Runtime validation
export const parseUser = (data: unknown): Effect.Effect<User, ParseError> =>
  Schema.decode(UserSchema)(data)
```

**✅ CORRECT - Composing schemas:**
```typescript
// Build complex schemas from simple ones
export const AddressSchema = Schema.Struct({
  street: Schema.NonEmptyString,
  city: Schema.NonEmptyString,
  state: Schema.String.pipe(Schema.length(2)),  // US state code
  zipCode: Schema.String.pipe(Schema.pattern(/^\d{5}$/))
})

export const UserProfileSchema = Schema.Struct({
  bio: Schema.optional(Schema.String),
  website: Schema.optional(Schema.String.pipe(Schema.pattern(/^https?:\/\//))),
  address: Schema.optional(AddressSchema)  // ✅ Compose schemas
})

export const UserWithProfileSchema = Schema.Struct({
  ...UserSchema.fields,  // ✅ Extend existing schema
  profile: UserProfileSchema
})

export type UserWithProfile = Schema.Schema.Type<typeof UserWithProfileSchema>
```

**✅ CORRECT - Domain functions operate on plain data:**
```typescript
// Pure functions on plain objects
export const isAdmin = (user: User): boolean =>
  user.role === "admin"

export const canModerate = (user: User): boolean =>
  user.role === "admin" || user.role === "moderator"

export const isAdult = (user: User): boolean =>
  user.age >= 18

// Functions are separate from data
export const upgradeToAdmin = (user: User): User => ({
  ...user,
  role: "admin"
})
```

**✅ CORRECT - Discriminated unions with Schema:**
```typescript
// Type-safe discriminated unions
export const PaymentMethodSchema = Schema.Union(
  Schema.Struct({
    _tag: Schema.Literal("CreditCard"),
    cardNumber: Schema.String,
    expiryDate: Schema.String,
    cvv: Schema.String
  }),
  Schema.Struct({
    _tag: Schema.Literal("PayPal"),
    email: Schema.String
  }),
  Schema.Struct({
    _tag: Schema.Literal("BankTransfer"),
    accountNumber: Schema.String,
    routingNumber: Schema.String
  })
)

export type PaymentMethod = Schema.Schema.Type<typeof PaymentMethodSchema>

// Pattern match on plain data
export const formatPaymentMethod = (method: PaymentMethod): string => {
  switch (method._tag) {
    case "CreditCard":
      return `Card ending in ${method.cardNumber.slice(-4)}`
    case "PayPal":
      return `PayPal: ${method.email}`
    case "BankTransfer":
      return `Bank: ${method.accountNumber}`
  }
}
```

**✅ CORRECT - Nested composition:**
```typescript
export const OrderItemSchema = Schema.Struct({
  productId: Schema.UUID,
  quantity: Schema.Number.pipe(Schema.positive, Schema.int),
  price: Schema.Number.pipe(Schema.positive)
})

export const OrderSchema = Schema.Struct({
  id: Schema.UUID,
  userId: Schema.UUID,
  items: Schema.Array(OrderItemSchema),  // ✅ Array of structs
  status: Schema.Literal("pending", "processing", "shipped", "delivered"),
  total: Schema.Number.pipe(Schema.positive),
  createdAt: Schema.Date
})

export type Order = Schema.Schema.Type<typeof OrderSchema>
export type OrderItem = Schema.Schema.Type<typeof OrderItemSchema>

// Work with plain, validated data
export const calculateOrderTotal = (items: OrderItem[]): number =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0)
```

Plain objects with Schema.Struct give you runtime validation, type safety, and composability without the complexity of classes.
