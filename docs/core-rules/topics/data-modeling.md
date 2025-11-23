# Data Modeling & Schema

## Rules

1. **[Schema-Structs] Prefer Schema.struct (plain objects) over Classes**
   - Data should be dumb. Logic lives in exported functions ("Ops").
   - **Why**: Serializable, composable, works with `Effect` ecosystem.

   ❌ `class Cart { constructor(public items: Item[]) {} }`
   ✅ `const Cart = Schema.Struct({ items: Schema.Array(Item) })`

2. **[Branded-Primitives] Use branded primitives for units**
   - Never use raw `number` or `string` for domain concepts like ID, Money, Email.
   - **Why**: Prevents accidental passing of "UserId" to "OrderId" function.

   ❌ `const price: number = 19.99`
   ✅ `type USD = number & Brand.Brand<"USD">; const price = Brand.nominally(Schema.Number, "USD")(19.99)`

3. **[Schema-Validation] Validate on Refinement**
   - Use `Schema.filter` or `pattern` to enforce invariants at the type level.

   ❌ `const EmailSchema = Schema.String`
   ✅ `const EmailSchema = Schema.String.pipe(Schema.pattern(/^[^@]+@[^@]+$/), Schema.brand("Email"))`

4. **[Immutable-Data] Return new values**
   - **Why**: Predictability in async contexts.

   ❌ `const addItem = (cart: Cart, item: Item) => { cart.items.push(item); return cart }`
   ✅ `const addItem = (cart: Cart, item: Item): Cart => ({ ...cart, items: [...cart.items, item] })`
