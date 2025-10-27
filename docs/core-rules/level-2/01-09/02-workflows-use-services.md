# [Workflows-Use-Services] Workflows may do I/O, but only via services/layers

Workflows orchestrate business processes and may perform I/O, but they must do so through Effect services and layers. Never access vendor-specific APIs directly in workflows.

**❌ WRONG - Direct vendor access in workflow:**
```typescript
// DON'T DO THIS - directly using Stripe API
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_KEY!)

export const processPayment = (orderId: OrderId, amount: Money): Effect.Effect<PaymentResult, PaymentError> =>
  Effect.gen(function*() {
    // ❌ Direct vendor coupling
    const charge = await stripe.charges.create({
      amount: amount.cents,
      currency: "usd",
      description: `Order ${orderId}`
    })
    
    return { chargeId: charge.id, status: charge.status }
  })
```

**❌ WRONG - Directly accessing database:**
```typescript
// DON'T DO THIS - direct database access
import { db } from "../database/client"

export const createUser = (userData: UserData): Effect.Effect<User, DatabaseError> =>
  Effect.gen(function*() {
    // ❌ Direct database coupling
    const result = await db.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [userData.name, userData.email]
    )
    
    return result.rows[0]
  })
```

**✅ CORRECT - Use PaymentService abstraction:**
```typescript
// Define service interface
export interface PaymentService {
  readonly charge: (orderId: OrderId, amount: Money) => Effect.Effect<ChargeResult, PaymentError>
  readonly refund: (chargeId: ChargeId) => Effect.Effect<void, PaymentError>
}

export class PaymentService extends Context.Tag("PaymentService")<
  PaymentService,
  PaymentService
>() {}

// Workflow uses the service
export const processPayment = (orderId: OrderId, amount: Money): Effect.Effect<PaymentResult, PaymentError> =>
  Effect.gen(function*() {
    const paymentService = yield* PaymentService
    
    // ✅ Using service abstraction
    const charge = yield* paymentService.charge(orderId, amount)
    
    return { 
      chargeId: charge.id, 
      status: charge.status 
    }
  })
```

**✅ CORRECT - Service implementation with vendor details:**
```typescript
// Platform service implementation (services/platform/StripePayment.service.ts)
import Stripe from "stripe"

export const StripePaymentServiceLive = Layer.effect(
  PaymentService,
  Effect.gen(function*() {
    const config = yield* Config
    const stripe = new Stripe(config.stripeKey)
    
    return PaymentService.of({
      charge: (orderId, amount) => 
        Effect.tryPromise({
          try: () => stripe.charges.create({
            amount: amount.cents,
            currency: "usd",
            description: `Order ${orderId}`,
            idempotency_key: orderId  // Vendor-specific feature
          }),
          catch: (error) => ({ _tag: "PaymentError", error })
        }),
      
      refund: (chargeId) =>
        Effect.tryPromise({
          try: () => stripe.refunds.create({ charge: chargeId }),
          catch: (error) => ({ _tag: "PaymentError", error })
        })
    })
  })
)
```

**✅ CORRECT - Test implementation:**
```typescript
// Test service for unit tests
export const TestPaymentServiceLive = Layer.succeed(
  PaymentService,
  PaymentService.of({
    charge: (orderId, amount) =>
      Effect.succeed({ 
        id: "test-charge-123", 
        status: "succeeded" 
      }),
    
    refund: (chargeId) => Effect.void
  })
)
```

This separation allows you to:
- Swap implementations (production vs test)
- Change vendors without touching workflows
- Test workflows with mock services
- Maintain vendor-specific logic in one place
