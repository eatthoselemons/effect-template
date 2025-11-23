# Pure Logic vs Orchestration

## The Decision
We strictly separate **Decisions** (Policies) from **Mechanics** (Workflows).

## The Reasoning

### 1. The "Process vs. Rule" Conflict
In many codebases, the rule "User must be over 18" is mixed with the code that "fetches the user from DB." This means to test the rule, you have to mock the DB.

We separate them:
- **Policy**: `canAccess(user)` -> Pure function. Returns Result.
- **Workflow**: `fetchUser()` -> `canAccess(user)` -> `return`.

### 2. Checks vs Policies
We originally considered a "Checks" layer but merged it into "Domain Models" and "Policies" to avoid bloat.

- **Domain Model Functions**: "Is this data valid?" (Internal Consistency).
  - `Cart.isEmpty(cart)`
  - Co-located with the Type definition.
  
- **Policies**: "Is this action allowed?" (Business Rules).
  - `PurchasePolicy.canCheckout(user, cart)`
  - Context-aware (Time, Permissions, Balance).

### 3. Determinism
By keeping Policies pure, we ensure that for any given input, the business decision is always the same. This makes debugging trivial—you just replay the inputs.
