# 4. Implementation Guide

**Goal:** Mechanical translation from F# Design to TypeScript/Effect Code.

## The Pattern: Decide -> Match -> Apply

This is the standard orchestration pattern for all workflows. It keeps the rules pure, the math pure, and the side effects isolated.

### 1. The Policy (Pure Rules)
*Located in: `src/policies/`*

```typescript
// LoadPolicy.ts
export const decide = (truck: LoadingTruck, pkg: Package): Result<PackageLoaded, LoadFailure> => {
  // 1. Check Rules
  if (truck.currentLoad.weight + pkg.weight > truck.capacity.maxWeight) {
    return Result.fail({ tag: "LoadFailure", reason: "OverWeight", ... })
  }
  
  if (truck.currentLoad.volume + pkg.volume > truck.capacity.maxVolume) {
    return Result.fail({ tag: "LoadFailure", reason: "InsufficientVolume", ... })
  }
  
  // 2. Return Success Event (Do NOT calculate new state here, just return the fact)
  return Result.succeed({ 
    tag: "PackageLoaded", 
    package: pkg,
    truckId: truck.id 
  })
}
```

### 2. The Model (Pure Math)
*Located in: `src/domain/models/`*

```typescript
// Truck.ts
// The "Reducer" - takes state + data -> new state
export const applyLoad = (truck: LoadingTruck, pkg: Package): LoadingTruck => ({
  ...truck,
  currentLoad: {
    weight: truck.currentLoad.weight + pkg.weight,
    volume: truck.currentLoad.volume + pkg.volume
  }
})
```

### 3. The Workflow (Impure Shell)
*Located in: `src/workflows/`*

```typescript
// LoadWorkflow.ts
const loadPackageWorkflow = (truckId: TruckId, packageId: PackageId) => Effect.gen(function*(_) {
  // 0. Get Dependencies
  const repo = yield* Database
  
  // 1. Gather Data (IO)
  const truck = yield* _(repo.getTruck(truckId));
  const pkg = yield* _(repo.getPackage(packageId));
  
  // 2. Execute Policy (Decide)
  // The Workflow does not know logic. It just asks the Policy.
  const decision = LoadPolicy.decide(truck, pkg);
  
  // 3. Match & Apply (Orchestration)
  return yield* _(Match.value(decision).pipe(
    
    // CASE: SUCCESS
    Match.when({ _tag: "PackageLoaded" }, (event) => Effect.gen(function*(_) {
        // A. Apply the change (Pure Math)
        // The Policy said "Yes", so we calculate the new state.
        const newTruckState = Truck.applyLoad(truck, event.package);
        
        // B. Persist the new state (IO)
        yield* _(repo.saveTruck(newTruckState));
        
        // C. Return the response
        return { 
            success: true, 
            updatedCapacity: newTruckState.currentLoad 
        };
    })),

    // CASE: FAILURE
    Match.when({ _tag: "LoadFailure" }, (failure) => 
        // We can choose to return a failure response OR fail the effect
        Effect.fail(new BusinessError(failure.reason))
    ),
    
    Match.exhaustive
  ));
});
```

## Translation Table

| Concept | F# Design | TypeScript / Effect Implementation |
| :--- | :--- | :--- |
| **Primitive** | `type Weight = int<kg>` | `type Weight = number & Brand<"Kg">` |
| **Structure** | `type User = { Name: string }` | `const User = Schema.Struct({ name: Schema.String })` |
| **Union** | `type State = A \| B` | `Schema.Union(A, B)` (Discriminated Union) |
| **Function** | `Input -> Output` | `(input: Input) => Output` |
| **Result** | `Result<Success, Error>` | `Either<Error, Success>` (Effect's Either) |
| **Async** | `Async<Result<T, E>>` | `Effect<T, E>` |
