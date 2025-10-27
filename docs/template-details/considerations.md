Purity and immutability
1. [Pure-Business-Logic] Domain ops, checks, and policies are pure and deterministic; no I/O, no services.
2. [Workflows-Use-Services] Workflows may do I/O, but only via services/layers; keep vendor details out.
3. [Immutable-Data] Prefer immutable data from effect: return new values instead of mutating.
4. [Data-Last-Signatures] Use data-last function signatures (data as final parameter) to enable composition with `pipe`.

Schema and data modeling
5. [Schema-Structs] Prefer Schema.struct (plain objects)
6. [Branded-Primitives] Use branded primitives for units
7. [Schema-Validation] Use Schema.struct.pipe() to do validation on every "preferie type"

glossary:
8. [Checks-Definition] Check: A small, context-light predicate that answers a domain question with yes/no. It operates on one concept or a small cluster and doesn't usually need to explain itself.
9. [Policies-Definition] Policy: A business decision rule. It composes checks, considers context (time, role, configuration, jurisdiction), and returns a reasoned decision (not just true/false).

Policies and checks:
10. [Rich-Types] Use types to encode state and results; new types for new states, rich return types instead of primitives

Workflows (use-cases)
11. [Decision-Interpretation] Interpret decision results; sequence of calls to services
12. [Events-After-Effects] Publish events after confirmed effects (emitting to a bus is an effect).
13. [Effect-Ordering] Handle retries, compensations, and transactional ordering (e.g., reserve → charge → ship).
14. [No-Vendor-Logic] Do not encode vendor-specific logic or business policy here, that goes in platform/domain services

Idempotency and retries:
15. [Idempotent-Actions] All externally visible actions should be idempotent; use idempotency keys
  - Include idempotency keys (orderId, commandId) in service requests.
  - Adapters must implement idempotency with the vendor (e.g., Stripe idempotency keys).
16. [Safe-Effect-Order] Order effects safely; irreversible effects last

Error handling and return shapes
17. [Typed-Errors] Prefer explicit, typed errors (discriminated unions) over generic exceptions.

Naming conventions:
18. [Workflow-Naming] Workflows: verb-noun/scenario (Checkout, FulfillOrder, GetNode).
19. [Decision-Naming] Decisions: verb-noun with decide/validate/calculate (decideEnoughPoints, validateCart).
20. [Ops-Naming] Values/ops: Money (schema) and MoneyOps (functions).

Heuristics for "where does this go?"
21. [Type-Utilities-Location] Value-level utility tied to one type → domain/ops (MoneyOps, PointsOps).
22. [Business-Rules-Location] Cross-entity business rule/policy → policies (pure).
23. [Orchestration-Location] Sequencing of steps, calling external systems → workflows.

Temporal-like workflows without Temporal
24. [Deterministic-Workflows] Keep workflows deterministic with respect to inputs + persisted state.
25. [Persist-State-Transitions] Persist state transitions (commands/events) if you need durability/replay.
26. [Idempotent-Services] Make service calls idempotent and retryable.

Testing strategy
27. [Values-Unit-Tests] Values/ops: unit tests
28. [Checks-Unit-Tests] checks: unit tests
29. [Policies-Scenario-Tests] policies: scenario-based tests with test layers
30. [Workflows-Test-Layers] Workflows: test with test layers for services (Effect Test/Layer).
31. [Domain-Test-Layers] Domain services: test with test layers
32. [Platform-Integration-Tests] Platform services: integration tests against sandboxes/containers

Anti-patterns to avoid
33. [No-Boolean-Policies] Booleans from policies without context (checks can be booleans if answer is yes/no, some checks will result in list of options)
34. [No-Logic-In-Services] Putting checks/policies in platform or domain services
35. [No-God-Module] Centralizing every if into one "god decisions" module

Adoption tips
36. [Start-With-Schema] Start with Schema.struct + ops modules
37. [Self-Documenting-Types] With the number of explicit types code should be fairly self documenting
