Purity and immutability
- Domain ops are pure and deterministic; no I/O.
- Decisions are pure; no I/O; no access to ports/services.
- Workflows may do I/O, but only via services/layers; keep vendor details out.
- Prefer immutable data from effect: return new values instead of mutating.
- Use data-first function signatures to make composition easy.

Schema and data modeling
- Prefer Schema.struct (plain objects)
- Use branded primitives for units
- Use Schema.struct.pipe() to do validation on every "preferie type"

glossary:
- Check: A small, context-light predicate that answers a domain question with yes/no. It operates on one concept or a small cluster and doesn’t usually need to explain itself.
- Policy: A business decision rule. It composes checks, considers context (time, role, configuration, jurisdiction), and returns a reasoned decision (not just true/false).

Policies and checks:
- compute facts from data
- are always pure, no side effects
- follow state machine design as laid out in domain modeling. New types for new states, functions handle state transitions
- return rich results via new types, allowing easy reading
- 
Workflows (use-cases)
- Interpret decision results; sequence of calls to services
- Publish events after confirmed effects (emitting to a bus is an effect).
- Handle retries, compensations, and transactional ordering (e.g., reserve → charge → ship).
- Do not encode vendor-specific logic or business policy here, that goes in services

Idempotency and retries:
- All externally visible actions should be idempotent (safe to retry):
  - Include idempotency keys (orderId, commandId) in service requests.
  - Adapters must implement idempotency with the vendor (e.g., Stripe idempotency keys).
- Workflows should be retry-safe; don’t mix irreversible effects before reversible ones.

Error handling and return shapes
- Prefer explicit, typed errors (discriminated unions) over generic exceptions.

Naming conventions:
- Workflows: verb-noun/scenario (Checkout, FulfillOrder, GetNode).
- Decisions: verb-noun with decide/validate/calculate (decideEnoughPoints, validateCart).
- Values/ops: Money (schema) and MoneyOps (functions).

Heuristics for “where does this go?”
- Value-level utility tied to one type → domain/ops (MoneyOps, PointsOps).
- Cross-entity business rule/policy → decisions (pure).
- Sequencing of steps, calling external systems → workflows.

Temporal-like workflows without Temporal
- Keep workflows deterministic with respect to inputs + persisted state.
- Persist state transitions (commands/events) if you need durability/replay.
- Make activities (port calls) idempotent and retryable.

Testing strategy
- Values/ops: property tests and unit tests.
- checks: unit tests
- policies: scenario-based tests
- Workflows: test with test layers for services (Effect Test/Layer).
- services: integration tests against sandboxes/containers; contract tests for mapping.

Anti-patterns to avoid
- Booleans from policies without context (checks can be booleans if answer is yes/no, some checks will result in list of options)
- Putting policy/checks in services or layers
- Centralizing every if into one “god decisions” module

Adoption tips
- Start with Schema.struct + ops modules
- With the number of explicit types code should be fairly self documenting
