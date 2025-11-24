---
globs:
  - "src/**/*.ts"
---
# Naming Conventions

1. **Workflows**: Use `Verb-Noun` or `Scenario` names.
   - They represent *actions* or *processes*.
   - ✅ `checkout`, `fulfillOrder`, `registerUser`
   - ❌ `userOrder` (Ambiguous), `orders.ts` (Too generic)

2. **Policies**: Use `Verb` with `decide`, `validate`, or `calculate`.
   - They represent *decisions*.
   - ✅ `decideDiscount`, `validateCart`, `calculateShipping`
   - ❌ `discountRules`, `cartLogic`

3. **Ops Modules**: Use `Entity` + `Ops`.
   - ✅ `MoneyOps`, `CartOps`
   - ❌ `MoneyUtils`, `CartHelper`

4. **Variables**:
   - **Services**: PascalCase when used as a Tag/dependency. `yield* DatabaseService`.
   - **Data**: camelCase. `const user = ...`
