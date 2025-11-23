# Layers & Granularity: The "Onion" vs The "3-Layer"

## The Decision
We utilize a granular, N-layer "Onion" architecture instead of the traditional 3-layer (Controller -> Service -> Repository) pattern.

## The Reasoning

### 1. The Trap of the "Service" Layer
In traditional 3-layer architectures, the "Service" layer becomes a dumping ground. It often handles:
- Validation
- Business Rules
- Orchestration
- I/O
- Data Transformation

This makes "Service" classes massive, hard to test (requires mocking databases), and coupled to specific implementations.

### 2. Functional Granularity
In a Functional Domain-Driven Design (FDDD) approach (and specifically with Effect), layers are cheap. We separate concerns based on their *purity* and *intent*, not just their technical role.

| Our Layer | Traditional Equivalent | Difference |
|-----------|------------------------|------------|
| **Workflows** | Service Method | Pure orchestration only. Readable script. |
| **Policies** | Service Logic | Pure decision making. No I/O. Easy to test. |
| **Domain Models** | DTO / Entity | Rich models with logic, not just data holders. |
| **Interfaces** | Service Interface | Defines the *capability*, not the implementation. |
| **Platform** | Repository/Client | Dumb adapters. No logic. |

### 3. Benefits
- **Testability**: You can unit test `Policies` and `Domain Models` without any mocks. They are pure functions.
- **Swapability**: By separating `Interfaces` from `Platform`, we can swap Neo4j for Postgres without touching the business logic.
- **Cognitive Load**: Workflows read like English sentences because the complex logic is pushed into named Policies.
