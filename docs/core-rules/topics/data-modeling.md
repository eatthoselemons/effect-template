---
globs:
  - "src/domain/models/**/*.ts"
  - "src/domain/data/**/*.ts"
---
# Data Modeling & Schema Rules

1. **Use Schema.Struct (Not Classes)**: Define data as plain objects with `Schema.Struct` for serializability. Logic goes in separate `Ops` modules.
   `const Cart = Schema.Struct({ items: Schema.Array(Item) })`

2. **Branded Primitives**: Always brand IDs and units (Money, Email) to prevent type collisions.
   `type USD = number & Brand.Brand<"USD">; const price = Brand.nominally(Schema.Number, "USD")(19.99)`

3. **Schema Validation**: Enforce invariants (regex, range) via `pipe(Schema.filter/pattern)`.
   `const Email = Schema.String.pipe(Schema.pattern(/^@/), Schema.brand("Email"))`

4. **Immutability**: Never mutate state. Return new copies using spread syntax.
   `const add = (c: Cart, i: Item): Cart => ({ ...c, items: [...c.items, i] })`

5. **Rich Types**: Encode state in types (e.g., `PendingOrder` vs `PaidOrder`) rather than using optional flags.
   `type Order = PendingOrder | PaidOrder` (Discriminated Union)
