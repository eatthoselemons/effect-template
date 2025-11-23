# Pure Logic vs Orchestration

## The Decision
We strictly separate **Decisions** (Policies) from **Mechanics** (Workflows).

## The Reasoning

### 1. The "Process vs. Rule" Conflict
In many codebases, the rule "User must be over 18" is mixed with the code that "fetches the user from DB." This means to test the rule, you have to mock the DB.

We separate them:
- **Policy**: `canAccess(user)` -> Pure function. Returns Result.
- **Workflow**: `fetchUser()` -> `canAccess(user)` -> `return`.

### 2. Policies
We considered a separate "Checks" layer but found it redundant. Logic now lives in two places:
1.  **Domain Models**: Pure logic about *one* entity (e.g., `Cart.isEmpty`).
2.  **Policies**: Pure logic about *decisions* or *multiple* entities (e.g., `canCheckout(user, cart)`).

This binary separation forces clear ownership.

### 3. Determinism
By keeping Policies pure, we ensure that for any given input, the business decision is always the same. This makes debugging trivial—you just replay the inputs.
