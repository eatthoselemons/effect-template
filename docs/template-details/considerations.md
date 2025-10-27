Purity and immutability
1. Domain ops, checks, and policies are pure and deterministic; no I/O, no services.
2. Workflows may do I/O, but only via services/layers; keep vendor details out.
3. Prefer immutable data from effect: return new values instead of mutating.
4. Use data-last function signatures (data as final parameter) to enable composition with `pipe`.

Schema and data modeling
5. Prefer Schema.struct (plain objects)
6. Use branded primitives for units
7. Use Schema.struct.pipe() to do validation on every "preferie type"

glossary:
8. Check: A small, context-light predicate that answers a domain question with yes/no. It operates on one concept or a small cluster and doesn't usually need to explain itself.
9. Policy: A business decision rule. It composes checks, considers context (time, role, configuration, jurisdiction), and returns a reasoned decision (not just true/false).

Policies and checks:
10. Use types to encode state and results; new types for new states, rich return types instead of primitives

Workflows (use-cases)
11. Interpret decision results; sequence of calls to services
12. Publish events after confirmed effects (emitting to a bus is an effect).
13. Handle retries, compensations, and transactional ordering (e.g., reserve → charge → ship).
14. Do not encode vendor-specific logic or business policy here, that goes in platform/domain services

Idempotency and retries:
15. All externally visible actions should be idempotent; use idempotency keys
  - Include idempotency keys (orderId, commandId) in service requests.
  - Adapters must implement idempotency with the vendor (e.g., Stripe idempotency keys).
16. Order effects safely; irreversible effects last

Error handling and return shapes
17. Prefer explicit, typed errors (discriminated unions) over generic exceptions.

Naming conventions:
18. Workflows: verb-noun/scenario (Checkout, FulfillOrder, GetNode).
19. Decisions: verb-noun with decide/validate/calculate (decideEnoughPoints, validateCart).
20. Values/ops: Money (schema) and MoneyOps (functions).

Heuristics for "where does this go?"
21. Value-level utility tied to one type → domain/ops (MoneyOps, PointsOps).
22. Cross-entity business rule/policy → policies (pure).
23. Sequencing of steps, calling external systems → workflows.

Temporal-like workflows without Temporal
24. Keep workflows deterministic with respect to inputs + persisted state.
25. Persist state transitions (commands/events) if you need durability/replay.
26. Make service calls idempotent and retryable.

Testing strategy
27. Values/ops: property tests and unit tests.
28. checks: unit tests
29. policies: scenario-based tests
30. Workflows: test with test layers for services (Effect Test/Layer).
31. services: integration tests against sandboxes/containers; contract tests for mapping.

Anti-patterns to avoid
32. Booleans from policies without context (checks can be booleans if answer is yes/no, some checks will result in list of options)
33. Putting checks/policies in platform or domain services
34. Centralizing every if into one "god decisions" module

Adoption tips
35. Start with Schema.struct + ops modules
36. With the number of explicit types code should be fairly self documenting
