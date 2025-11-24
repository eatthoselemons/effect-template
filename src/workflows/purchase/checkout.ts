import { Effect, Console } from "effect"
import * as Cart from "../../domain/models/Cart.js"
import { USD } from "../../domain/models/Money.js"
import { PaymentSvc } from "../../domain/interfaces/PaymentSvc.js"
import * as DiscountPolicy from "../../policies/purchase/DiscountPolicy.js"

// The Workflow
export const checkout = (cart: Cart.Cart) => Effect.gen(function*(_) {
  // 1. Logging (Side Effect)
  yield* _(Console.log(`Starting checkout for Cart ${cart.id}`))

  // 2. Domain Logic (Pure)
  const total = Cart.total(cart)
  
  // 3. Policy Decision (Pure)
  const discountDecision = DiscountPolicy.determineDiscount(cart)
  
  let finalAmount = total
  
  if (discountDecision._tag === "ApplyDiscount") {
    const discountAmount = USD(total * (discountDecision.percentage / 100))
    finalAmount = USD(total - discountAmount)
    yield* _(Console.log(`Discount Applied: ${discountDecision.percentage}%`))
  }

  // 4. Service Call (Impure)
  const payment = yield* _(PaymentSvc)
  yield* _(payment.charge(finalAmount))
  
  yield* _(Console.log(`Charged: ${finalAmount}`))
  
  return { status: "SUCCESS", amount: finalAmount }
})
