import { Effect, Layer, Console } from "effect"
import { PaymentSvc } from "../../domain/interfaces/PaymentSvc.js"

// A Console-logging implementation for Development/Testing
export const PaymentSvcLive = Layer.succeed(
  PaymentSvc,
  PaymentSvc.of({
    charge: (amount: any) => Console.log(`[Stripe Adapter] Charging card: ${amount}`)
  })
)

// A Test implementation that captures calls (mock-like)
// In a real test, you might use a Ref to store the calls.
export const PaymentSvcTest = Layer.succeed(
  PaymentSvc,
  PaymentSvc.of({
    charge: (amount: any) => Effect.log(`[Test Mock] Charging: ${amount}`)
  })
)
