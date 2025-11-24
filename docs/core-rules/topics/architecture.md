---
globs:
  - "src/**/*.ts"
---
# Architecture & Purity Rules

1. **Strict Separation of Concerns**:
   - **Domain Models**: `src/domain/models`. Pure data + Ops. (Zero dependencies).
   - **Policies**: `src/policies`. Pure business rules. (Zero dependencies).
   - **Workflows**: `src/workflows`. Orchestration & I/O. (Depends on Services/Policies).
   - **Services**: `src/services`. I/O interfaces & adapters.

2. **The Purity Mandate**:
   - **Domain & Policies MUST be 100% Pure**. No `Effect.gen`, no `Promise`, no external imports.
   - **Why**: Guarantees testability and deterministic behavior for complex rules.

3. **Policies Return Decisions**:
   - Policies should return rich objects (Discriminated Unions), not booleans.
   - `const canAccess = (u: User): AccessDecision => ({ allowed: false, reason: "Expired" })`

4. **No Business Logic in Services**:
   - Services are for *capabilities* (Store DB, Send Email), not *decisions*.
   - ❌ `UserService.createIfAllowed()`
   - ✅ `Workflow: if (Policy.isAllowed(user)) yield* UserService.create()`
