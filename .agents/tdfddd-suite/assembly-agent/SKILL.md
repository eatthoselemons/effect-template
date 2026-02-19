# Assembly Agent: The Implementer

## Description
Phase 3: Implementation Assembly. Translates F# models into TypeScript/Effect code.

## When to Use This Skill
Activate when the user:
- Says "Implement the code".
- Says "Phase 3" or "Start assembly".
- Says "Generate TypeScript" or "Write Effect code".
- Has already completed Phase 2 (Blueprint).

## Core Function: The Translator

**Goal:** Mechanically translate the F# Domain Model into idiomatic TypeScript/Effect code.

**Constraints:**
- Read `design/active/02-model.fs` (or the blueprint) as input.
- Generate valid, **type-safe** TypeScript code using the Effect library.
- **Do not** deviate from the F# model.
- **Do not** invent new business rules.

**Instructions:**
1.  Read `design/active/02-model.fs`.
2.  **Follow Strict Project Structure:**
    - **`src/domain/models/`** (Pure Domain Knowledge):
      - Place `Effect.Schema` definitions here.
      - Place `Brand` types here.
      - Place Pure Logic (e.g., `Money.add`, `Cart.isEmpty`).
      - **NO** external dependencies, **NO** `Effect<...>`, **NO** Side Effects.
    - **`src/domain/interfaces/`** (Service Contracts):
      - Define interfaces for repositories and services (e.g., `interface PaymentRepo`).
      - Use `Context.Tag` for dependency injection.
    - **`src/policies/`** (Business Decisions):
      - Pure functions that make decisions based on multi-entity context.
      - Returns `Result` or `Strategy Decision`.
      - **NO** Side Effects.
      - Example: `determinePaymentStrategy(amount)`, `canAccessResource(user, resource)`.
    - **`src/workflows/`** (Orchestration):
      - The "Impure Shell". Connects pieces, manages transaction flow.
      - Uses `Effect.gen(function*(_) { ... })`.
      - Orchestrates: 1. Fetch State (Repo) -> 2. Policy Decision (Policy) -> 3. Apply Change (Model) -> 4. Save (Repo).
    - **`src/registries/`** (Dynamic Wiring):
      - Strategy Pattern implementation (e.g., selecting Stripe vs PayPal based on Policy).
    - **`src/services/`** (Infrastructure):
      - Concrete implementations of interfaces (e.g., `Stripe.service.ts`).
      - Place adapters here.
    - **`src/layers/`** (Dependency Injection):
      - `Main.layer.ts` for wiring production dependencies.
3.  Translate **Primitives**:
    - `type Weight = int<kg>` -> `const Weight = Schema.Number.pipe(Schema.brand("Kg"))`
    - Always export the type: `export type Weight = typeof Weight.Type`
4.  Translate **Structures (Records)**:
    - `type User = { Name: string }` -> `const User = Schema.Struct({ name: Schema.String })`
5.  Translate **Unions (Aggregates/Events)**:
    - `type State = A | B` -> `Schema.Union(A, B)` (Discriminated Union)
6.  Implement the **Contract**:
    - `decide : State -> Command -> Result` -> `export const decide = (state: State, cmd: Command): Either<Error, Event> => ...`
    - `apply : State -> Event -> State` -> `export const apply = (state: State, event: Event): State => ...`
    - `workflow : Command -> Effect<Result>` -> `export const workflow = (cmd: Command) => Effect.gen(...)`
7.  **Action:** Write the implementation files to `src/`.
    - `src/domain/models/`: Types & Schemas
    - `src/policies/`: Pure Logic (`decide`)
    - `src/workflows/`: Effect Orchestration (`workflow`)
8.  **Format:** Use strict TypeScript with Effect.

## Translation Table

| F# Concept | TypeScript / Effect Implementation |
| :--- | :--- |
| `type T = int<brand>` | `const T = Schema.Number.pipe(Schema.brand("Brand"))` |
| `type R = { f: T }` | `const R = Schema.Struct({ f: T })` |
| `type U = A | B` | `Schema.Union(A, B)` |
| `Result<T, E>` | `Either<E, T>` |
| `Async<Result<T, E>>` | `Effect<T, E>` |

## Usage Examples

**User:** "Implement it."
**Agent (Implementer):** [Reads `02-model.fs`]
[Generates `src/domain/models/Truck.ts`]
[Generates `src/policies/LoadPolicy.ts`]
[Generates `src/workflows/LoadWorkflow.ts`]
"Implementation complete based on the blueprint."
