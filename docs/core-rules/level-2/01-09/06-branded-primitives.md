# [Branded-Primitives] Use branded primitives for units

Use branded types to create distinct types for values with semantic meaning or units. This prevents mixing incompatible values and catches errors at compile time.

**❌ WRONG - Plain primitives for domain IDs:**
```typescript
// DON'T DO THIS - all IDs are just strings
export const getUser = (userId: string): Effect.Effect<User, UserError> => { }
export const getOrder = (orderId: string): Effect.Effect<Order, OrderError> => { }

// Can accidentally mix up IDs ❌
const userId = "user-123"
const orderId = "order-456"

getUser(orderId)  // ❌ Compiles! Wrong ID type passed
getOrder(userId)  // ❌ Compiles! Wrong ID type passed
```

**❌ WRONG - Numbers without units:**
```typescript
// DON'T DO THIS - unclear what units are used
export const calculateShipping = (weight: number, distance: number): number => {
  return weight * distance * 0.5
}

// What units? Pounds? Kilograms? Miles? Kilometers? ❌
const cost = calculateShipping(10, 100)

export const scheduleDelay = (delay: number): Effect.Effect<void> => {
  return Effect.sleep(delay)
}

// Milliseconds? Seconds? Minutes? ❌
scheduleDelay(5000)
```

**❌ WRONG - Mixing currency amounts:**
```typescript
// DON'T DO THIS - just plain numbers
const priceInCents = 1000
const priceInDollars = 10

const total = priceInCents + priceInDollars  // ❌ 1010, wrong!
```

**✅ CORRECT - Branded ID types:**
```typescript
import { Brand, Schema } from "@effect/schema"

// Create branded types for IDs
export type UserId = string & Brand.Brand<"UserId">
export const UserId = Brand.nominal<UserId>()

export type OrderId = string & Brand.Brand<"OrderId">
export const OrderId = Brand.nominal<OrderId>()

export type ProductId = string & Brand.Brand<"ProductId">
export const ProductId = Brand.nominal<ProductId>()

// Schemas with branding
export const UserIdSchema = Schema.String.pipe(Schema.brand("UserId"))
export const OrderIdSchema = Schema.String.pipe(Schema.brand("OrderId"))

// Type-safe functions
export const getUser = (userId: UserId): Effect.Effect<User, UserError> => { }
export const getOrder = (orderId: OrderId): Effect.Effect<Order, OrderError> => { }

// Cannot mix IDs ✅
const userId = UserId.make("user-123")
const orderId = OrderId.make("order-456")

getUser(orderId)  // ✅ Compile error!
getOrder(userId)  // ✅ Compile error!
```

**✅ CORRECT - Branded units for measurements:**
```typescript
// Distinct types for different units
export type Kilograms = number & Brand.Brand<"Kilograms">
export const Kilograms = Brand.nominal<Kilograms>()

export type Kilometers = number & Brand.Brand<"Kilometers">
export const Kilometers = Brand.nominal<Kilometers>()

export type Euros = number & Brand.Brand<"Euros">
export const Euros = Brand.nominal<Euros>()

// Type-safe calculation
export const calculateShipping = (
  weight: Kilograms, 
  distance: Kilometers
): Euros => {
  const rate = 0.5
  return Euros.make(weight * distance * rate)
}

// Units are clear ✅
const weight = Kilograms.make(10)
const distance = Kilometers.make(100)
const cost = calculateShipping(weight, distance)

// Cannot mix units ✅
calculateShipping(distance, weight)  // ✅ Compile error!
```

**✅ CORRECT - Time units:**
```typescript
// Branded time durations
export type Milliseconds = number & Brand.Brand<"Milliseconds">
export const Milliseconds = Brand.nominal<Milliseconds>()

export type Seconds = number & Brand.Brand<"Seconds">
export const Seconds = Brand.nominal<Seconds>()

export type Minutes = number & Brand.Brand<"Minutes">
export const Minutes = Brand.nominal<Minutes>()

// Conversion functions
export const secondsToMillis = (seconds: Seconds): Milliseconds =>
  Milliseconds.make(seconds * 1000)

export const minutesToSeconds = (minutes: Minutes): Seconds =>
  Seconds.make(minutes * 60)

// Type-safe delays
export const scheduleDelay = (delay: Milliseconds): Effect.Effect<void> =>
  Effect.sleep(delay)

// Clear semantics ✅
const delay = pipe(
  Minutes.make(5),
  minutesToSeconds,
  secondsToMillis
)

scheduleDelay(delay)  // ✅ Units are explicit
```

**✅ CORRECT - Currency types:**
```typescript
// Separate types for different currency representations
export type Cents = number & Brand.Brand<"Cents">
export const Cents = Brand.nominal<Cents>()

export type Dollars = number & Brand.Brand<"Dollars">
export const Dollars = Brand.nominal<Dollars>()

// Safe conversions
export const dollarsToCents = (dollars: Dollars): Cents =>
  Cents.make(Math.round(dollars * 100))

export const centsToDollars = (cents: Cents): Dollars =>
  Dollars.make(cents / 100)

// Type-safe calculations
export const addPrices = (a: Cents, b: Cents): Cents =>
  Cents.make(a + b)

export const applyTax = (price: Cents, taxRate: number): Cents =>
  Cents.make(Math.round(price * (1 + taxRate)))

// Cannot accidentally mix ✅
const priceInCents = Cents.make(1000)
const priceInDollars = Dollars.make(10)

addPrices(priceInCents, priceInDollars)  // ✅ Compile error!
```

**✅ CORRECT - Email and validated strings:**
```typescript
// Branded validated types
export type Email = string & Brand.Brand<"Email">

export const EmailSchema = Schema.String
  .pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
  .pipe(Schema.brand("Email"))

export type PhoneNumber = string & Brand.Brand<"PhoneNumber">

export const PhoneNumberSchema = Schema.String
  .pipe(Schema.pattern(/^\+?[1-9]\d{1,14}$/))
  .pipe(Schema.brand("PhoneNumber"))

// Functions only accept validated branded types
export const sendEmail = (to: Email, subject: string): Effect.Effect<void, EmailError> => { }

export const sendSMS = (to: PhoneNumber, message: string): Effect.Effect<void, SMSError> => { }

// Must validate to get branded type
const validateEmail = (input: string): Effect.Effect<Email, ValidationError> =>
  Schema.decode(EmailSchema)(input)

// Usage ✅
const sendWelcome = (emailString: string): Effect.Effect<void, EmailError | ValidationError> =>
  pipe(
    validateEmail(emailString),  // Validates and brands
    Effect.flatMap(email => sendEmail(email, "Welcome!"))
  )
```

Branded primitives make your types precise, prevent mixing incompatible values, and document units directly in the type system.
