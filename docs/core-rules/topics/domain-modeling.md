# Domain Modeling

## Philosophy
**"Make Illegal States Unrepresentable."**

Use types to encode business rules. If invalid data cannot be constructed, it cannot cause bugs.

## The Design Protocol (TDFDDD)

### Phase 1: Event Storming
1.  Identify the **Command** (User Intent).
2.  Identify the **Events** (What Happened: Success/Failure).
3.  Gather domain context from the expert.

### Phase 2: Core Sketch
1.  Draft the Policy signature: `decide : Input -> State -> Result<SuccessEvent, FailureEvent>`
2.  List the information required to make the decision.

### Phase 3: Domain Modeling
1.  **Primitives:** Branded types for units (`Weight`, `Volume`).
2.  **Compounds:** Group primitives into Structs (`Package`, `TruckCapacity`).
3.  **Aggregates:** Define State variants (`LoadingTruck | SealedTruck`).
4.  **Events:** Define Outcomes (`PackageLoaded`, `LoadFailure`).

### Phase 4: The Contract
1.  **Policy:** `decide : Input -> State -> Result<SuccessEvent, FailureEvent>` (Pure)
2.  **Model:** `apply : State -> SuccessEvent -> State` (Pure)
3.  **Workflow:** `workflow : InputId -> Effect<Response>` (Impure)

### Phase 5: Implementation
1.  Translate F# types to Effect Schemas.
2.  Implement Policy (Pure).
3.  Implement Workflow: Decide -> Match -> Apply.

## The Orchestration Pattern

```typescript
const workflow = (id) => Effect.gen(function*(_) {
  // 1. Gather (IO)
  const state = yield* _(Repo.get(id));
  
  // 2. Decide (Pure)
  const decision = Policy.decide(input, state);
  
  // 3. Match & Apply
  return yield* _(Match.value(decision).pipe(
    Match.when({ _tag: "Success" }, (event) => Effect.gen(function*(_) {
        const newState = Model.apply(state, event);
        yield* _(Repo.save(newState));
        return { success: true };
    })),
    Match.when({ _tag: "Failure" }, (err) => Effect.fail(err)),
    Match.exhaustive
  ));
});
```

## Rules
1.  **Policies are Pure:** No IO, no services, only data in -> decision out.
2.  **Models are Pure:** State transitions are deterministic.
3.  **Workflows are Impure:** They orchestrate IO and call Policies/Models.
4.  **Events are Data:** They describe "What Happened," not "What To Do."
