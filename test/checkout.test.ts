import { describe, it, expect } from "vitest"
import { Effect } from "effect"
import { checkout } from "../src/workflows/purchase/checkout.js"
import { PaymentSvcTest } from "../src/services/platform/Payment.service.js"
import { USD } from "../src/domain/models/Money.js"

describe("Checkout Workflow", () => {
  it("should apply discount for > 5 items", async () => {
    // 1. Setup Data
    const cart = {
      id: "123-abc",
      items: [
        { id: "p1", name: "Apple", price: USD(10), quantity: 6 } // Total 60, > 5 items
      ]
    } // Note: In real code, use Schema.decodeUnknown to parse this safely

    // 2. Run Workflow with Test Layer
    // We use the Test Layer so we don't hit real Stripe
    const program = checkout(cart as any).pipe(
      Effect.provide(PaymentSvcTest)
    )

    // 3. Execute
    const result = await Effect.runPromise(program)

    // 4. Assert
    // Total $60. 10% discount = $6. Final = $54.
    expect(result.status).toBe("SUCCESS")
    expect(result.amount).toBe(54)
  })
})
