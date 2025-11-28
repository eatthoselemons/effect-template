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
1.  **Flow**: Define `Command` (Input) → `Event` (Output).
2.  **Contract**: Write `(Input) => Effect<Success, Error>` signatures.
3.  **Partition**: Isolate pure rules (Policies) from side-effects (Services).
4.  **Model**: Bridge Input to Output with specific types (Success & Failure).
5.  **Assembly**: Implement logic only after types verify.
