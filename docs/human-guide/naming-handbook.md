Here are the 3 Laws of Domain Naming:

1. The "Lifecycle" Rule:

	- Never name a type Item if it represents a specific stage.
	- Bad: Item (with a status field).
	- Good: `DraftItem` -> `OpenItem` -> `SoldItem`.
	- Example: An `Item` type (the start state) is better named `DraftItem` or `NewItem`. `Item` is too generic; it sounds like the parent wrapper.

2. The "Perspective" Rule:

	- Name the type based on what it is needed for, not just what it holds.
	- Example: Instead of `TotalBids` (Data), consider `BidHistory` or `BidCounter`.
	- Example: `BiddableItem` is a PERFECT name. It tells me exactly what I can do with it.


3. The "Suffix" Rule (Events vs. Objects):

	- Objects (State): Nouns (`ActiveItem`, `Truck`).
	- Events (History): Noun + Past Tense Verb (`OrderPlaced`, `ItemSold`).
		- *Why?* Sorting by the Noun keeps related events together (`OrderPlaced`, `OrderShipped`).
	- Commands (Intent): Imperative Verb + Noun (`PlaceBid`, `LoadTruck`).
      - Name the Intent *NOT* process

4. Hints:

    - Separate *process* from the *objects* don't mix the two (`UnprocessedVideo -> ProcessedVideo`, `PendingJob -> ActiveJob -> CompletedJob`)

## Structural Naming Conventions

1. **Workflows:** `VerbNoun` (e.g., `checkout.ts`).
   - Represents a process or transaction script.
   - *Example:* `registerUser.ts`, `placeOrder.ts`

2. **Policies:** `Verb` (e.g., `validateCart.ts`).
   - Represents a pure decision or business rule.
   - *Example:* `calculateDiscount.ts`, `authorizePayment.ts`

3. **Ops:** `EntityOps` (e.g., `OrderOps.ts`).
   - Pure transformations on an entity.
   - *Example:* `CartOps.ts`, `UserOps.ts`