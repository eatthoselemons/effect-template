---
globs:
  - "src/**/*.ts"
  - "design/**/*.md"
---
# Naming Conventions

## 1. Structural Naming (File & Module Level)

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

## 2. Semantic Heuristics (Domain Modeling)

1. **State-First Types**: Avoid generic containers with status fields.
   - ❌ `Item` (with `status: 'sold'`)
   - ✅ `DraftItem` → `OpenItem` → `SoldItem`

2. **Capability-Based Naming**: Name by *role* or *purpose*, not data shape.
   - ❌ `ItemWithBids` (Data description)
   - ✅ `BiddableItem` (What can I do with it?)
   - ✅ `BidHistory` (What is its role?)

3. **The Domain Grammar**:
   - **Objects** = Nouns (`ActiveItem`)
   - **Events** = Past Verbs (`BidPlaced`)
   - **Commands** = Imperative Verbs (`PlaceBid`)
