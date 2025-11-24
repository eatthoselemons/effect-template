import { Schema } from "@effect/schema"
import { Brand } from "effect"

// 1. Branded Type for Type Safety (cannot mix USD with EUR or plain numbers)
export type USD = Brand.Branded<number, "USD">
export const USD = Brand.nominal<USD>()

// 2. Schema for serialization/validation
export const MoneySchema = Schema.Number.pipe(Schema.brand("USD"))

// 3. Pure Operations
export const add = (a: USD, b: USD): USD => USD(a + b)
export const format = (amount: USD): string => `$${amount.toFixed(2)}`
