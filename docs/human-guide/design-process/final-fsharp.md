## Final Result
This is the final result of the domain modeling in fsharp

```fsharp
// 1. Primitives
type Weight = float<kg>
type Volume = float<m^3>
type PackageId = string
type TruckId = string

// 2. The Inputs (The Objects)
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

// 3. The States (The Aggregates)
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

// 4. The Events (The Outputs)
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
