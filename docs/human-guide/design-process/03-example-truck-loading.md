# 3. Example: Logistics - Truck Loading

This is a complete walkthrough of the design process for a truck loading feature.

## Phase 1: Event Storming (The Discovery)

**The Story:**
"A Warehouse Worker attempts to put a package on a truck. If it fits and the truck is open, it succeeds. If the truck is full or sealed, it fails."

**The Timeline:**
1.  **Command:** `LoadPackage` (User Input)
    *   *Input:* `TruckId`, `PackageDetails`
2.  **Process:** Business Rules Check (Weight, Volume, Status)
3.  **Events:**
    *   ✅ `PackageLoaded` (Success)
    *   ❌ `LoadFailed` (Failure)

**Gather More Information:**
"However a truck might not be at the loading dock, we also take trucks out of service for maintenance."

---

## Phase 2: The Core Sketch (The "Policy")

*   **Question:** "To decide if a package fits, what do I need to know?"
*   **Brainstorm:**
    *   I need the Package size (Weight/Volume).
    *   I need the Truck's max capacity.
    *   I need the Truck's *current* load.
    *   I need to know if the truck is sealed.
*   **Draft Signature:**
    ```fsharp
    `decideLoad : packageWeight ->
                  packageVolume ->
                  truckRemainingVolume ->
                  truckRemainingWeight ->
                  Result<PackageLoaded, LoadFailed>`
    ```

---

## Phase 3: Domain Modeling (The Nouns)

### A. Initial types
*Build Types based on what the workflow needs*

- `type PackageWeight = Kilograms`
- `type PackageVolume = CubicMeters`
- `type TruckMaxVolume = CubicMeters`
- `type TruckMaxWeight = Kilograms`

### B. Compound Types (The Objects)
*Combine the initial types into compound types*

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
*This is the "Domain Boundary" logic encoded in types. We separate "Loading" from "Sealed" so we don't need to check status flags.*

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

// The "Boundary" Union
type Truck =
| Loading of LoadingTruck
| Sealed of SealedTruck
```

### D. The Events (The Decision)
*Distinguish between what the "Business" decides and what the "API" returns.*

**The Policy Return (The Domain Event)**
This is "What Happened". It contains the data required to update the state.

```fsharp
type PackageLoaded = {
  TruckId: TruckId
  Package: Package    // The data needed to calculate new state
  Timestamp: DateTime
}

type LoadFailureReason =
| InsufficientVolume
| OverMaxWeight

type LoadFailure = {
  reason: LoadingFailureReason
  truckId: TruckId
  package: Package
}
```

**The Workflow Return (The API Response)**
This is what the caller (Frontend/API) gets back.

```fsharp
type LoadResponse = {
  Success: boolean
  Message: string
  UpdatedCapacity: CurrentLoad
}
```

---

## Phase 4: The Contract

**The Policy (Pure Core):**
```fsharp
`decide : Package -> LoadingTruck -> Result<PackageLoaded, LoadFailure>`
```

**The Model (Pure Math):**
```fsharp
`apply : LoadingTruck -> Package -> LoadingTruck`
```

**The Workflow (Impure Shell):**
```fsharp
`loadPackage : TruckId -> PackageId -> Effect<LoadResponse>`
```
