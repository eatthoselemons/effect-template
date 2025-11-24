import { Context, Effect } from "effect"
import type { USD } from "../models/Money.js"

// 1. The Service Error
export class PaymentFailedError {
  readonly _tag = "PaymentFailedError"
  constructor(readonly message: string) {}
}

// 2. The Service Interface (Tag)
export class PaymentSvc extends Context.Tag("PaymentSvc")<
  PaymentSvc,
  {
    readonly charge: (amount: USD) => Effect.Effect<void, PaymentFailedError>
  }
>() {}
