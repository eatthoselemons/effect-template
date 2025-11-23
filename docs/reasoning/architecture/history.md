# History & Architectural Decisions

This document tracks the evolution of our architectural decisions, including the paths we considered and ultimately rejected.

## 1. The "3-Layer" vs "N-Layer" Debate

**The Consideration:**
Should we stick to the industry-standard 3-Layer architecture (Controller -> Service -> Repository) for simplicity?

**The Counter-Argument (Why we rejected 3-Layer):**
- **The "Fat Service" Problem:** In 3-layer systems, the "Service" layer becomes a magnet for *everything*—business logic, validation, I/O, and orchestration.
- **Testing Difficulty:** To test a business rule in a Service, you often have to mock the Repository, because they are tightly coupled.
- **Effect Granularity:** In Effect, layers are cheap. There is no performance penalty for splitting Logic (Policies) from Mechanics (Services).

**The Decision:**
We adopted the **Onion Architecture** with granular layers:
1. Domain Models (Pure Logic)
2. Policies (Pure Decisions)
3. Workflows (Impure Orchestration)
4. Infrastructure (Impure I/O)

## 2. The "Event-Driven Everything" Debate

**The Consideration:**
Should we use Effect's Event system (Pub/Sub) to decouple workflows? (e.g., `Workflow A` emits `Event X`, `Workflow B` listens).

**The Counter-Argument (Why we rejected internal events):**
- **Loss of Locality:** You cannot click "Go to Definition" to see what happens next. The control flow becomes invisible.
- **Error Propagation:** If the listener fails, the emitter doesn't know. You lose the transactional integrity of `Effect.gen`/`pipe`.
- **Complexity:** It requires an internal event bus infrastructure that mimics microservices but inside a monolith ("Microservice Envy").

**The Decision:**
Use **Direct Composition** (Functions calling Functions) for all core business logic.
Use **Events** ONLY for "fire-and-forget" side effects (e.g., sending analytics, welcome emails) where failure does not invalidate the transaction.

## 3. The "Naming" of Services

**The Consideration:**
Should we name services by their implementation (e.g., `StripeService`) or their role (e.g., `SmallPaymentService`)?

**The Counter-Argument:**
- **Implementation Names (`StripeService`)**: Couples the domain to the vendor. If we switch to PayPal, we have to rename everything.
- **Role Names (`SmallPaymentService`)**: Can drift semantically. What if "Small" becomes "VIP"? The name becomes a lie.

**The Decision:**
Use **Strategy Pattern**:
- **Interface**: `PaymentInterface` (Generic).
- **Policy**: Returns a Strategy Value (e.g., `RETAIL_CHANNEL`).
- **Registry**: Maps `RETAIL_CHANNEL` -> `StripeService`.
- **Workflow**: Asks Registry for the implementation.

## 4. The "Checks" Layer

**The Consideration:**
Should we have a top-level `checks/` folder for simple predicates?

**The Rejection:**
It encouraged "Anemic Domain Models" where logic was stripped away from the data types.

**The Decision:**
Move "Checks" into the **Domain Model** modules (`src/domain/models/`). Logic about an entity belongs *with* the entity schema.
