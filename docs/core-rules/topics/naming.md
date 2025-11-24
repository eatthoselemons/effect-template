---
globs:
  - "src/**/*.ts"
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

## 2. Semantic Heuristics (The "Insightful" Rules)

These rules apply to how you name **Types** and **Domain Concepts**.

1. **The "Lifecycle" Rule (State over Generic Items)**:
   - Never name a type `Item` if it represents a specific *stage*.
   - ❌ `Item` (with a status field).
   - ✅ `DraftItem` -> `OpenItem` -> `SoldItem`.
   - *Reasoning*: `Item` is too generic; it implies a container. Specific types make state transitions explicit.

2. **The "Perspective" Rule (Utility over Holding)**:
   - Name the type based on *what it is needed for*, not just what it holds.
   - ❌ `TotalBids` (Data description).
   - ✅ `BidHistory` or `BidCounter` (Domain concept).
   - ✅ `BiddableItem` (Tells you exactly what you can do with it).

3. **The "Suffix" Rule (Events vs. Objects)**:
   - **Objects (State)**: Nouns.
     - ✅ `ActiveItem`, `Truck`.
   - **Events (History)**: Past Tense Verbs.
     - ✅ `BidPlaced`, `ItemSold`.
   - **Commands (Intent)**: Imperative Verbs.
     - ✅ `PlaceBid`, `LoadTruck`.
