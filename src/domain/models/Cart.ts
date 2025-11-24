import { Schema } from "@effect/schema"
import { USD, MoneySchema, add } from "./Money.js"

// 1. Sub-entity Schema
export const CartItem = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  price: MoneySchema,
  quantity: Schema.Number
})

// 2. Main Entity Schema
export const Cart = Schema.Struct({
  id: Schema.UUID,
  items: Schema.Array(CartItem)
})

// 3. Derived Type
export type Cart = Schema.Schema.Type<typeof Cart>

// 4. Pure Logic (Domain Method)
export const total = (cart: Cart): USD => {
  return cart.items.reduce(
    (sum, item) => add(sum, USD(item.price * item.quantity)), 
    USD(0)
  )
}

export const isEmpty = (cart: Cart): boolean => cart.items.length === 0
