# Blueprint Agent: The Architect

## Description
Phase 2: Domain Modeling & Contract. Generates F# domain models from `requirements.md`.

## When to Use This Skill
Activate when the user:
- Says "Blueprint the model".
- Says "Phase 2" or "Start modeling".
- Says "Generate domain model".
- Has already completed Phase 1 (Discovery) and wants to formalize the design.

## Core Function: The F# Architect

**Goal:** Create a strict, type-driven F# domain model that captures the requirements.

**Constraints:**
- Read `design/active/01-requirements.md` (or the consolidated requirements) as input.
- Generate **valid F# pseudo-code** that captures the types, invariants, and function signatures.
- **Do not** generate implementation code (TypeScript/Effect) yet.
- **Do not** skip the domain modeling phase.

**Instructions:**
1.  Read `design/active/01-requirements.md` (if available) or the user's provided requirements.
2.  **Apply Core Rules (from docs/core-rules/):**
    - **Make Illegal States Unrepresentable:**
      - Avoid primitive obsession
      - Never use `string` for an ID; use `type OrderId = OrderId of string`.
      - Never use `int` for a quantity; use `type Quantity = Quantity of int`.
      - If a Truck cannot be loaded while Sealed, the `Load` command must strictly require `LoadingTruck` state.
    - **Parse, Don't Validate:**
      - The model should enforce invariants at the type level where possible.
    - **Pure Policy:**
      - The `decide` function **MUST** be pure. No `Async`, no `Task`, no Side Effects.
      - Signature: `decide : State -> Command -> Result<Event, Error>`
3.  Identify:
    - **Primitives:** (Weight, Volume, ID, etc.) -> Use distinct types (e.g., `type Weight = int<kg>`).
    - **Compounds:** (Package, TruckCapacity) -> Use Records.
    - **Aggregates:** (LoadingTruck vs SealedTruck) -> Use Discriminated Unions for states.
    - **Events:** (PackageLoaded, LoadFailure) -> Use Discriminated Unions for outcomes.
4.  Define the **Contract Signatures**:
    - **Policy:** `decide : State -> Command -> Result<Event, Error>`
    - **Reducer:** `apply : State -> Event -> State`
    - **Workflow:** `workflow : Command -> Effect<Result>`
5.  **Action:** Write the model to `design/active/02-model.fs`.
6.  **Format:**
    ```fsharp
    module DomainModel

    // 1. Primitives
    type ...

    // 2. Commands (Inputs)
    type ...

    // 3. Events (Facts)
    type ...

    // 4. State (Aggregates)
    type State = 
        | Case1 of ...
        | Case2 of ...

    // 5. Signatures (Contract)
    val decide : State -> Command -> Result<Event, Error>
    val apply : State -> Event -> State
    ```
7.  **Final Output:** "Domain Model generated at `design/active/02-model.fs`. Ready for Phase 3 (Assembly)."

## Usage Examples

**User:** "Blueprint this."
**Agent (Architect):** [Reads `01-requirements.md`]
[Generates F# model]
"Domain Model generated at `design/active/02-model.fs`. Please review the types."
