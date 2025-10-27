# [Schema-Validation] Use Schema.Struct.pipe() to do validation on every "preferie type"

Every domain type should use `Schema.Struct` with validation pipelines to ensure data integrity. Validate constraints, business rules, and invariants at the schema level.

**❌ WRONG - No validation:**
```typescript
// DON'T DO THIS - accepts invalid data
export const UserSchema = Schema.Struct({
  name: Schema.String,  // ❌ Could be empty
  age: Schema.Number,  // ❌ Could be negative
  email: Schema.String,  // ❌ Could be invalid format
  password: Schema.String  // ❌ No length requirement
})

// Invalid data passes through ❌
const invalidUser = {
  name: "",
  age: -5,
  email: "not-an-email",
  password: "123"
}
```

**❌ WRONG - Validation in separate functions:**
```typescript
// DON'T DO THIS - validation separate from type
export const UserSchema = Schema.Struct({
  name: Schema.String,
  age: Schema.Number,
  email: Schema.String
})

export const validateUser = (user: User): boolean => {
  // ❌ Validation logic disconnected from schema
  return user.name.length > 0 &&
         user.age >= 0 &&
         /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)
}

// Can construct invalid User without validation ❌
```

**✅ CORRECT - Validation in schema pipes:**
```typescript
import { Schema } from "@effect/schema"

// All validation in the schema
export const UserSchema = Schema.Struct({
  name: Schema.String.pipe(
    Schema.nonEmpty(),  // ✅ Cannot be empty
    Schema.maxLength(100)  // ✅ Maximum length
  ),
  age: Schema.Number.pipe(
    Schema.int,  // ✅ Must be integer
    Schema.greaterThanOrEqualTo(0),  // ✅ Non-negative
    Schema.lessThan(150)  // ✅ Reasonable max
  ),
  email: Schema.String.pipe(
    Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),  // ✅ Email format
    Schema.toLowerCase  // ✅ Normalize to lowercase
  ),
  password: Schema.String.pipe(
    Schema.minLength(8),  // ✅ Minimum length
    Schema.maxLength(128)  // ✅ Maximum length
  )
})

export type User = Schema.Schema.Type<typeof UserSchema>

// Invalid data is rejected ✅
const parseUser = Schema.decode(UserSchema)
```

**✅ CORRECT - Complex business rules in schema:**
```typescript
// Custom validation with filter
export const PasswordSchema = Schema.String.pipe(
  Schema.minLength(8),
  Schema.maxLength(128),
  Schema.filter(
    password => /[A-Z]/.test(password),
    { message: () => "Password must contain uppercase letter" }
  ),
  Schema.filter(
    password => /[a-z]/.test(password),
    { message: () => "Password must contain lowercase letter" }
  ),
  Schema.filter(
    password => /[0-9]/.test(password),
    { message: () => "Password must contain number" }
  )
)

export const OrderItemSchema = Schema.Struct({
  productId: Schema.UUID,
  quantity: Schema.Number.pipe(
    Schema.int,
    Schema.positive,  // ✅ Must be positive
    Schema.lessThanOrEqualTo(100)  // ✅ Max order quantity
  ),
  price: Schema.Number.pipe(
    Schema.positive,
    Schema.finite  // ✅ No Infinity or NaN
  )
})

export const OrderSchema = Schema.Struct({
  id: Schema.UUID,
  items: Schema.Array(OrderItemSchema).pipe(
    Schema.minItems(1),  // ✅ Order must have at least one item
    Schema.maxItems(50)  // ✅ Maximum items per order
  ),
  total: Schema.Number.pipe(Schema.positive),
  createdAt: Schema.Date
}).pipe(
  // ✅ Cross-field validation
  Schema.filter(
    order => {
      const calculatedTotal = order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )
      return Math.abs(order.total - calculatedTotal) < 0.01
    },
    { message: () => "Order total must match sum of items" }
  )
)
```

**✅ CORRECT - Date and time validation:**
```typescript
// Validate dates are in valid ranges
export const EventSchema = Schema.Struct({
  name: Schema.String.pipe(Schema.nonEmpty()),
  startDate: Schema.Date.pipe(
    Schema.filter(
      date => date >= new Date(),
      { message: () => "Event must be in the future" }
    )
  ),
  endDate: Schema.Date
}).pipe(
  Schema.filter(
    event => event.endDate > event.startDate,
    { message: () => "End date must be after start date" }
  )
)

export const TimestampSchema = Schema.Date.pipe(
  Schema.filter(
    date => date.getTime() > 0,
    { message: () => "Invalid timestamp" }
  )
)
```

**✅ CORRECT - Enum and literal validation:**
```typescript
// Strict validation of allowed values
export const UserRoleSchema = Schema.Literal("user", "admin", "moderator")

export const OrderStatusSchema = Schema.Literal(
  "pending",
  "processing", 
  "shipped",
  "delivered",
  "cancelled"
)

export const CurrencySchema = Schema.Literal("USD", "EUR", "GBP", "JPY")

export const PriceSchema = Schema.Struct({
  amount: Schema.Number.pipe(
    Schema.positive,
    Schema.finite
  ),
  currency: CurrencySchema  // ✅ Only valid currencies
})
```

**✅ CORRECT - Optional fields with validation:**
```typescript
// Validate optional fields when present
export const UserProfileSchema = Schema.Struct({
  bio: Schema.optional(
    Schema.String.pipe(
      Schema.nonEmpty(),
      Schema.maxLength(500)  // ✅ Validate when present
    )
  ),
  website: Schema.optional(
    Schema.String.pipe(
      Schema.pattern(/^https?:\/\/.+/),  // ✅ Valid URL when present
      Schema.maxLength(200)
    )
  ),
  age: Schema.optional(
    Schema.Number.pipe(
      Schema.int,
      Schema.between(13, 120)  // ✅ Valid range when present
    )
  )
})
```

**✅ CORRECT - Transformations with validation:**
```typescript
// Transform and validate in pipeline
export const MoneySchema = Schema.Struct({
  cents: Schema.Number.pipe(
    Schema.int,
    Schema.greaterThanOrEqualTo(0)
  )
})

export const MoneyInputSchema = Schema.Number.pipe(
  Schema.finite,
  Schema.greaterThanOrEqualTo(0)
).pipe(
  // ✅ Transform dollars to cents with validation
  Schema.transform(
    Schema.Struct({
      cents: Schema.Number.pipe(Schema.int, Schema.greaterThanOrEqualTo(0))
    }),
    {
      decode: dollars => ({ cents: Math.round(dollars * 100) }),
      encode: money => money.cents / 100
    }
  )
)

// API accepts dollars, internally stores cents ✅
const parseMoney = Schema.decode(MoneyInputSchema)
```

**✅ CORRECT - Nested validation:**
```typescript
export const AddressSchema = Schema.Struct({
  street: Schema.String.pipe(Schema.nonEmpty()),
  city: Schema.String.pipe(Schema.nonEmpty()),
  state: Schema.String.pipe(Schema.length(2)),  // US state code
  zipCode: Schema.String.pipe(
    Schema.pattern(/^\d{5}(-\d{4})?$/)  // ZIP or ZIP+4
  )
})

export const UserWithAddressSchema = Schema.Struct({
  name: Schema.String.pipe(Schema.nonEmpty()),
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  addresses: Schema.Array(AddressSchema).pipe(
    Schema.maxItems(5)  // ✅ Nested array validation
  ),
  primaryAddressIndex: Schema.Number.pipe(
    Schema.int,
    Schema.greaterThanOrEqualTo(0)
  )
}).pipe(
  // ✅ Cross-field validation with nested data
  Schema.filter(
    user => user.primaryAddressIndex < user.addresses.length,
    { message: () => "Primary address index out of bounds" }
  )
)
```

Schema validation ensures all data is valid before entering your domain, eliminating entire classes of runtime errors.
