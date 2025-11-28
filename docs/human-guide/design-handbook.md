# The Design Handbook: Type-Driven Functional Domain Modeling

This guide outlines the philosophy and process for designing software in this repository. It is heavily inspired by Scott Wlaschin's "Domain Modeling Made Functional."

## The Core Philosophy
**"Make Illegal States Unrepresentable."**

We do not write code to *check* if data is valid. We design types so that *invalid data cannot exist*.

## The Process (TDFDDD)
**Type-Driven Functional Domain-Driven Design**

We strictly separate **Design** (High Inference/Intelligence) from **Implementation** (Mechanical Assembly). Do not write implementation code until the design is frozen.

### Phase 1: Event Storming (The Flow)
**Goal:** Identify what happens, not how it happens.

1.  **Identify Commands (Inputs):** What triggers the action?
    *   *Convention:* Imperative Verbs (`PlaceOrder`, `RegisterUser`).
2.  **Identify Events (Outputs):** What happened as a result?
    *   *Convention:* Past-tense Verbs (`OrderPlaced`, `UserRegistered`).
3.  **Identify Dependencies:** What data do we need to get from A to B?

### Phase 2: Signature Design (The Verbs)
**Goal:** Define the contract.

Write the function signatures using Effect types before writing any logic. This is your blueprint.

```typescript
type PlaceOrder = (cmd: PlaceOrderCommand) => Effect<OrderPlaced, InvalidOrderError, _>
```

### Phase 3: Partitioning (The Strategy)
**Goal:** Enforce Purity.

Before implementing the workflow, decide *where* the logic lives:
*   **Is it a Decision?** (e.g., "Can this user afford this?") -> **Policy** (Pure).
*   **Is it an Action?** (e.g., "Save to DB") -> **Service** (IO).

*Rule:* The Workflow should mostly coordinate these two, containing very little logic itself.

### Phase 4: Context Mapping (The Nouns)
**Goal:** Define the data structures (Types).

*   **The "Lifecycle" Rule:** Never use a `status` field to distinguish states. Create separate types.
    *   *Bad:* `Order` with `status: 'Draft' | 'Paid'`.
    *   *Good:* `DraftOrder` -> `PaidOrder`.
*   **Context-Specific Types:** Do not reuse database entities if they don't match the context.
    *   If a workflow only needs `UserId` and `Email`, define a `UserContactInfo` type. Do not pass the full `User` entity.

### Phase 5: Implementation (The Assembly)
**Goal:** Connect the pipes.

Once types and signatures are defined, implementation is merely satisfying the compiler. This is where you use `Effect.gen`, pipe data through policies, and call services.

---

## Naming Conventions (The Language)

### Structural Naming
*   **Workflows:** `VerbNoun` (e.g., `checkout.ts`). Represents a process.
*   **Policies:** `Verb` (e.g., `validateCart.ts`). Represents a pure decision.
*   **Ops:** `EntityOps` (e.g., `OrderOps.ts`). Pure transformations on an entity.

### Semantic Heuristics
*   **State-First:** If the behavior changes, the type name must change.
*   **Capability-Based:** Name types by what they *allow* you to do (`BiddableItem`), not just what data they hold.
*   **Grammar:**
    *   Objects = Nouns (`Truck`)
    *   Events = Past Verbs (`TruckLoaded`)
    *   Commands = Imperative Verbs (`LoadTruck`)
