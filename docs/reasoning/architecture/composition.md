# Composition over Events

## The Decision
We prioritize **Direct Function Composition** (via `pipe`) for core business logic. We use **Events** only for side effects that do not impact the transaction's success.

## The Reasoning

### 1. The "Microservice Envy" Trap
Developers often break monoliths into event-driven fragments to "decouple" them. Inside a single application, this leads to:
- **Loss of Observability**: You can't trace a request top-to-bottom.
- **Error Handling Complexity**: If the event consumer fails, the producer doesn't know.
- **Refactoring Pain**: "Find Usages" breaks.

### 2. Local Reasoning
With Effect, `step1.pipe(step2)` provides:
- **Transactional Integrity**: If step2 fails, the whole block fails (or recovers).
- **Type Safety**: The output of step1 is typed as the input of step2.
- **Readability**: The linear flow is visible.

### 3. When to use Events
Use events for **Fire-and-Forget** side effects:
- Sending analytics
- Sending welcome emails
- Notifying external webhooks

If the business outcome depends on it (e.g., "Charge Card"), it must be a function call, not an event.
