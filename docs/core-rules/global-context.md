# Global Context & Core Philosophy

**Root Philosophy**: Functional Domain-Driven Design (Scott Wlaschin).
*Make illegal states unrepresentable. Use types as documentation.*

## 1. The Golden Rule: Purity vs. IO
- **Domain (Pure)**: `src/domain/models` and `src/policies` MUST be 100% pure. Deterministic, no side effects, no service dependency.
- **Workflows (Impure)**: `src/workflows` orchestrate logic. They verify policies and call Services.
- **Services (IO)**: `src/services` handle all I/O (DB, API). They are called *only* by Workflows.

## 2. Data & Composition
- **Immutable**: Never mutate. Return new copies.
- **Data-Last**: Functions take data as the last argument to support `pipe`.
- **Schema First**: Use `@effect/schema` for all domain objects. No Classes.
- **Branded Types**: Use `Brand<"USD">` instead of raw primitives.

## 3. Error Handling
- **Typed Errors**: Use discriminated unions for errors. No generic `throw`.
- **Fail Fast**: Validate inputs at the edge (Workflows/Controllers).

## 4. Structure
- `domain/models/`: Schema + Pure Ops (one file per entity or folder with index).
- `policies/`: Cross-entity business rules (Pure). Returns Decision objects.
- `workflows/`: The "glue". `Effect.gen`, Service wiring.
- `services/`: Interfaces (Ports) and Implementations (Adapters).

## 5. The Design Protocol (TDFDDD)
*Do not implement logic until the types exist.*

1.  **Event Storming (The Flow)**:
    - Identify the **Input** (Command) and **Output** (Event/Result).
    - *Example*: `PlaceOrder` -> `OrderPlaced` or `OrderRejected`.

2.  **Type Modeling (The Nouns)**:
    - Define the states required to bridge Input to Output.
    - Group data by *usage*, not by database table. If a step needs `id` and `balance`, create a type for that specific context.

3.  **Signature First (The Verbs)**:
    - Write the function signatures using Effect types.
    - `(input: Input) => Effect<Success, Error, Deps>`
    - *This defines the contract before the complexity enters.*

4.  **Implementation (The Assembly)**:
    - Only now do you write the code to connect the pipes.
