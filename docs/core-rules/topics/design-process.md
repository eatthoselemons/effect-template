---
globs:
  - "design/**/*.md"
---
# The Design Process (TDFDDD)

## Core Philosophy
**"Make Illegal States Unrepresentable."** Design types so that *invalid data cannot exist*.

## The 5 Phases

### Phase 1: Event Storming (The Flow)
**Goal:** Identify what happens, not how.
1.  **Commands (Inputs):** Imperative Verbs (`PlaceOrder`).
2.  **Events (Outputs):** Past-tense Verbs (`OrderPlaced`).
3.  **Dependencies:** What data is needed?

### Phase 2: Context Mapping (The Nouns)
**Goal:** Define the Types.
*   **Lifecycle Rule:** No status fields. Use separate types (`DraftOrder` -> `PaidOrder`).
*   **Context Rule:** Create specific types for the workflow (`UserContactInfo`), don't reuse massive entities.

### Phase 3: Signature Design (The Verbs)
**Goal:** Define the Contract.
Write the function signature using Effect types *before* implementation.
```typescript
type MyWorkflow = (cmd: Command) => Effect<SuccessEvent, DomainError, Dependencies>
```

### Phase 4: Partitioning (The Strategy)
**Goal:** Enforce Purity.
*   **Decisions** -> **Policy** (Pure).
*   **Actions** -> **Service** (IO).
*   **Workflow** -> Coordinates Policy and Service.

### Phase 5: Implementation (The Assembly)
**Goal:** Connect the pipes.
*   Use `Effect.gen`.
*   Satisfy the compiler.
