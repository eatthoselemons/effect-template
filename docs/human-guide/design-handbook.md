# The Design Handbook: Type-Driven Functional Domain Modeling

This guide outlines the philosophy and process for designing software in this repository. It is heavily inspired by Scott Wlaschin's "Domain Modeling Made Functional."

## The Core Philosophy
**"Make Illegal States Unrepresentable."**

We do not write code to *check* if data is valid. We design types so that *invalid data cannot exist*.

## Wisdom

**The "Bottom-Up" Heuristic:**
> "Let the Workflow dictate the State."

**Why you felt it was "Hard to do domain modeling correctly first":**
If you try to model the domain *before* knowing the workflow, you are **guessing**. You will likely model data you don't need (YAGNI), or model it in a shape that is annoying to use.


It is perfectly fine—and often better—to sketch the function signature with "Fake Types" first (`NeededStuff -> Result`), list out what `NeededStuff` actually is, and *then* formalize the Domain Models.

This is actually how most functional programmers work. We write the function, see what arguments we are missing, define the type for them, and repeat.

## The Process (TDFDDD)
**Type-Driven Functional Domain-Driven Design**

Wlaschin calls this the **"Type-Driven Design"** loop
We strictly separate **Design** (High Inference/Intelligence) from **Implementation** (Mechanical Assembly). Do not write implementation code until the design is frozen.


1.  **Event Storming:** Discover the timeline (Events).
2.  **Workflow Definition:** Identify the Command (Input) and Event (Output).
3.  **Domain Modeling:** Define the Nouns (Primitives, then Compound Types/Aggregates).
4.  **The Contract:** Define the Function Signature (The "Firewall").

Here is a template you can use. I have written it out for the **Truck Loading** scenario.

---

# Design Spec: Logistics - Truck Loading

## Phase 1: Event Storming (The Discovery)
*Goal: Identify "What happens" without worrying about code.*

**The Story:**
"A Warehouse Worker attempts to put a package on a truck. If it fits and the truck is open, it succeeds. If the truck is full or sealed, it fails."

**The Timeline:**
1.  **Command:** `LoadPackage` (User Input)
    *   *Input:* `TruckId`, `PackageDetails`
2.  **Process:** Business Rules Check (Weight, Volume, Status)
3.  **Events:**
    *   ✅ `PackageLoaded` (Success)
    *   ❌ `LoadFailed` (Failure)

**Gather More Information**

"However a truck might not be at the loading dock, we also take trucks out of service for maintenance"

---

## Phase 2: The Core Sketch (The "Policy")
*Goal: Figure out what information is required to make the decision. Do not worry about types yet.*

*   **Question:** "To decide if a package fits, what do I need to know?"
*   **Brainstorm:**
  *   I need the Package size (Weight/Volume).
  *   I need the Truck's max capacity.
  *   I need the Truck's *current* load.
  *   I need to know if the truck is sealed.
*   **Draft Signature:**
    *Format: F# Pseudo-code*
```fsharp
`decideLoad : packageWeight ->
              packageVolume ->
              truckRemainingVolume ->
              truckRemainingWeight ->
              Result<PackageLoaded, LoadFailed>`
```

--- 
## Phase 2: Domain Modeling (The Nouns)
*Format: F# Types*
*Goal: Create the vocabulary. Avoid primitive obsession. Make illegal states unrepresentable.*

### A. Initial types
*Build Types based on what the workflow needs*

- `packageWeight`
  - for weight need a kilogram primitive
  - `type Kilograms = int<kg>`
  - `type PackageWeight = Kilograms`
- `packageVolume`
  - for volume need a volume primitive
  - `type CubicMeters = Int<m^3>`
  - `type PackageVolume = CubicMeters`
- `truckRemainingVolume`
  - already have volume primitives so use those
  - we can calculate remaining if we have the total and current
  - `type TruckMaxVolume = CubicMeters`
- `truckRemainingWeight`
  - `type TruckMaxWeight = Kilograms`
- Have return types that will be enums
  - `PackageLoaded`
  - `LoadFailed`

### B. Compound Types (The Objects)
*Combine the initial types into compound types*

Note that things like `TruckMaxVolume` turned into `MaxVolume` because they are in the `TruckCapacity` type

```fsharp
type Package = {
  Id: PackageId
  Weight: Weight
  Volume: Volume
}

type TruckCapacity = {
  MaxWeight: Weight
  MaxVolume: Volume
}

type CurrentLoad = {
  TotalWeight: Weight
  TotalVolume: Volume
}
```

### C. The States (The Aggregates)
*This is the "Firewall" logic encoded in types. We separate "Loading" from "Sealed" so we don't need to check status flags.*

```fsharp
type LoadingTruck = {
  Id: TruckId
  Capacity: TruckCapacity
  CurrentLoad: CurrentLoad
}

type SealedTruck = {
  Id: TruckId
  Status: "Sealed" | "InTransit" | "Maintenance"
}

// The "Firewall" Union
type Truck =
| Loading of LoadingTruck
| Sealed of SealedTruck
```

### D. Create Workflow Return Types
*Goal: Define the input and output types for the process.*
```fsharp
type LoadFailureReason =
| OverWeight of { Limit: Weight; Actual: Weight }
| OverVolume of { Limit: Volume; Actual: Volume }

type PackageLoaded = {
  TruckId: TruckId
  PackageId: PackageId
  NewLoadState: CurrentLoad
  Timestamp: DateTime
}

type LoadRefused = {
Reason: LoadFailureReason
TruckId: TruckId
}
```

### E. Condense the signatures:
*This is the function we will actually implement.*
```fsharp
`decideLoad : packageWeight -> packageVolume -> truckRemainingVolume -> truckRemainingWeight -> Result<PackageLoaded, LoadFailed>`
```
condenses to
```fsharp
loadDesicion : Package -> LoadingTruck -> Result<PackageLoaded, LoadFailureReason>
```
---

---

### Why this document structure works:
2.  **It acts as a contract:** You can hand this document to a junior dev, and they can't mess it up because the types (`LoadingTruck` vs `SealedTruck`) force them to handle the edge cases.
3.  **It is readable:** A Product Manager can read Phase 1. A Architect can read Phase 2/3. A Coder reads Phase 4.

This distinction you are making—**Workflow (Impure/Orchestrator)** vs. **Policy (Pure/Decision)**—is the absolute gold standard of Functional Architecture.

Wlaschin calls this **"Functional Core, Imperative Shell."**
*   **Shell (Workflow):** Gathers data, calls the core, saves results. (Impure).
*   **Core (Policy):** Makes decisions based on input, returns events. (Pure).


**The Pivot Point:**
The transition from "Design" (Phase 1-4) to "Implementation" (Phase 5) is where you switch languages.

*   **Design Phase (Artifact):** Use F# / Pseudo-code. It is succinct, high-level, and readable by experts.
*   **Implementation Phase (Code):** Use TypeScript / Effect. This is where the rubber meets the road.

Here is the revised, lean process.

---

---
**🛑 STOP. REVIEW WITH DOMAIN EXPERT.**
*Show them Phase 4. "We only check loading rules if the truck is NOT sealed. If it is sealed, we reject it before checking weight. Does that sound right?"*
---

## Phase 5: Implementation (The "Code")
*Format: TypeScript / Effect*
*Goal: Translate the design into executable software.*

**Step A: Define the Schema (Translation of Phase 3)**
*   Translate F# `LoadingTruck` -> Effect `Schema.Struct`.
*   Translate F# `LoadPolicy` -> TS Function Signature.

**Step B: Write the Shell (The Pipeline)**
*   This is where you write the `Effect.gen` code.
*   *Pros of writing this directly:*
    *   Effect's pipe syntax (`pipe(data, validate, transform)`) IS the documentation.
    *   If you name your functions well (`fetchTruck`, `ensureTruckIsLoading`, `calculateLoad`), a domain expert *can* almost read the code.

```typescript
// The "Shell" Implementation
const loadPackageWorkflow = (truckId, packageId) => Effect.gen(function*(_) {
  const truck = yield* _(Repo.getTruck(truckId));
  
  // The logic is visible right here in the flow
  const validTruck = yield* _(ensureTruckIsLoading(truck));
  
  const result = yield* _(LoadPolicy.decide(validTruck, pkg));
  
  yield* _(Repo.save(result));
});
```