# 2. The Design Protocol (TDFDDD)

**Type-Driven Functional Domain-Driven Design**

This is the rigorous process we use to discover, design, and implement features. Do not skip steps. Do not write implementation code until the design is frozen.

## The Checklist

### Phase 1: Event Storming (Discovery)
*Goal: Identify "What happens" without worrying about code.*
1.  Identify the **Command** (User Input).
2.  Identify the **Process** (Business Rules).
3.  Identify the **Events** (Domain Facts/Outcomes).

### Phase 2: The Core Sketch (Policy Signature)
*Goal: Figure out what information is required to make the decision.*
1.  Draft the function signature in F# pseudo-code.
2.  Determine inputs needed to answer the question.
3.  Ignore specific types for now, just name the concepts.

### Phase 3: Domain Modeling (The Nouns)
*Goal: Create the vocabulary. Avoid primitive obsession. Make illegal states unrepresentable.*
1.  **Primitives:** Define specific units (Weight, Volume).
2.  **Compounds:** Group primitives into Objects (Package, TruckCapacity).
3.  **Aggregates:** Define the States (LoadingTruck vs SealedTruck).
4.  **Events:** Define the Outputs (PackageLoaded, LoadFailure).

### Phase 4: The Contract (The Domain Boundary)
*Goal: Finalize the pure logic signatures.*
1.  **Policy Signature:** `decide : Input -> State -> Result<SuccessEvent, FailureEvent>`
2.  **Model Signature:** `apply : State -> SuccessEvent -> State`
3.  **Workflow Signature:** `workflow : InputId -> Effect<Response>`

### Phase 5: Implementation (The Assembly)
*Goal: Mechanical translation to TypeScript.*
1.  Translate F# types to Effect Schemas.
2.  Implement the pure Policy functions.
3.  Implement the impure Workflow orchestration (Decide -> Match -> Apply).
