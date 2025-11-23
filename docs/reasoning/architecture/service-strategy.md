# Service Strategy: Interfaces, Adapters, and Registries

## The Decision
We define Services as **Interfaces** (Contracts) in the Domain layer, and **Implementations** (Adapters) in the Infrastructure layer. We use **Registries** only for dynamic runtime selection.

**Vocabulary Note:** In Effect, a "Layer" is a *Constructor* for a Service, not the Service itself. `PostgresLive` is a Layer that constructs the `Postgres` Service.

## The Reasoning

### 1. The Interface is the Service
The Domain logic should not know about `Stripe` or `Neo4j`. It should only know about `PaymentInterface` and `GraphInterface`.
This allows the Domain to be stable while Infrastructure churns.

### 2. The Naming Problem
- **Bad**: `StripeService` injected into Workflow. (Coupled).
- **Bad**: `SmallPaymentService` (Ambiguous, semantic drift).
- **Good**: `PaymentInterface` injected, wired to `StripeService` in the main layer.

### 3. Strategy Pattern & Registries
Sometimes, the implementation *does* depend on domain data (e.g., "Use Stripe for < $10").
- We do NOT put this logic in the Workflow (Pollutes flow).
- We do NOT put this logic in the Service (Hides rules).

**The Solution**: A **Registry**.
1. **Policy**: Decides the *Strategy* (`RETAIL` vs `WHOLESALE`).
2. **Registry**: Maps `RETAIL` -> `StripeService`.
3. **Workflow**: Asks Registry for the service, then calls it.

This keeps the wiring explicit and testable.
