Purity and immutability
1. Domain ops are pure and deterministic; no I/O.
2. Decisions are pure; no I/O; no access to ports/services.
3. Workflows may do I/O, but only via services/layers; keep vendor details out.
4. Prefer immutable data from effect: return new values instead of mutating.
5. Use data-first function signatures to make composition easy.

Schema and data modeling
6. Prefer Schema.struct (plain objects)
7. Use branded primitives for units
8. Use Schema.struct.pipe() to do validation on every "preferie type"

glossary:
9. Check: A small, context-light predicate that answers a domain question with yes/no. It operates on one concept or a small cluster and doesn't usually need to explain itself.
10. Policy: A business decision rule. It composes checks, considers context (time, role, configuration, jurisdiction), and returns a reasoned decision (not just true/false).

Policies and checks:
11. compute facts from data
12. are always pure, no side effects
13. follow state machine design as laid out in domain modeling. New types for new states, functions handle state transitions
14. return rich results via new types, allowing easy reading

Workflows (use-cases)
15. Interpret decision results; sequence of calls to services
16. Publish events after confirmed effects (emitting to a bus is an effect).
17. Handle retries, compensations, and transactional ordering (e.g., reserve → charge → ship).
18. Do not encode vendor-specific logic or business policy here, that goes in services

Idempotency and retries:
19. All externally visible actions should be idempotent (safe to retry):
  - Include idempotency keys (orderId, commandId) in service requests.
  - Adapters must implement idempotency with the vendor (e.g., Stripe idempotency keys).
20. Workflows should be retry-safe; don't mix irreversible effects before reversible ones.

Error handling and return shapes
21. Prefer explicit, typed errors (discriminated unions) over generic exceptions.

Naming conventions:
22. Workflows: verb-noun/scenario (Checkout, FulfillOrder, GetNode).
23. Decisions: verb-noun with decide/validate/calculate (decideEnoughPoints, validateCart).
24. Values/ops: Money (schema) and MoneyOps (functions).

Heuristics for "where does this go?"
25. Value-level utility tied to one type → domain/ops (MoneyOps, PointsOps).
26. Cross-entity business rule/policy → decisions (pure).
27. Sequencing of steps, calling external systems → workflows.

Temporal-like workflows without Temporal
28. Keep workflows deterministic with respect to inputs + persisted state.
29. Persist state transitions (commands/events) if you need durability/replay.
30. Make activities (port calls) idempotent and retryable.

Testing strategy
31. Values/ops: property tests and unit tests.
32. checks: unit tests
33. policies: scenario-based tests
34. Workflows: test with test layers for services (Effect Test/Layer).
35. services: integration tests against sandboxes/containers; contract tests for mapping.

Anti-patterns to avoid
36. Booleans from policies without context (checks can be booleans if answer is yes/no, some checks will result in list of options)
37. Putting policy/checks in services or layers
38. Centralizing every if into one "god decisions" module

Adoption tips
39. Start with Schema.struct + ops modules
40. With the number of explicit types code should be fairly self documenting
