# Considerations with Examples

## Purity and immutability

1. **[Pure-Business-Logic] Domain ops, checks, and policies are pure and deterministic; no I/O, no services.**
   ❌ `const canPurchase = (user: User) => Effect.gen(function*() { const db = yield* Database; ... })`
   ✅ `const canPurchase = (user: User, inventory: Inventory): Decision => user.points >= inventory.cost ? Allow : Deny`

2. **[Workflows-Use-Services] Workflows may do I/O, but only via services/layers; keep vendor details out.**
   ❌ `const checkout = () => stripe.charges.create({ amount: 1000, ... })`
   ✅ `const checkout = () => Effect.gen(function*() { const payment = yield* PaymentService; ... })`

3. **[Immutable-Data] Prefer immutable data from effect: return new values instead of mutating.**
   ❌ `const addItem = (cart: Cart, item: Item) => { cart.items.push(item); return cart }`
   ✅ `const addItem = (cart: Cart, item: Item): Cart => ({ ...cart, items: [...cart.items, item] })`

4. **[Data-Last-Signatures] Use data-last function signatures (data as final parameter) to enable composition with `pipe`.**
   ❌ `const multiply = (value: number, multiplier: number): number => value * multiplier`
   ✅ `const multiply = (multiplier: number) => (value: number) => value * multiplier`

## Schema and data modeling

5. **[Schema-Structs] Prefer Schema.struct (plain objects)**
   ❌ `class Cart { constructor(public items: Item[]) {} }`
   ✅ `const Cart = Schema.Struct({ items: Schema.Array(Item) })`

6. **[Branded-Primitives] Use branded primitives for units**
   ❌ `const price: number = 19.99`
   ✅ `type USD = number & Brand.Brand<"USD">; const UsdSchema = Schema.Number.pipe(Schema.brand("USD")); const price: USD = USD.make(19.99)`

7. **[Schema-Validation] Use Schema.struct.pipe() to do validation on every "preferie type"**
   ❌ `const EmailSchema = Schema.String`
   ✅ `type Email = string & Brand.Brand<"Email">; const EmailSchema = Schema.String.pipe(Schema.pattern(/^[^@]+@[^@]+$/), Schema.brand("Email"))`

## glossary:

8. **[Checks-Definition] Check: A small, context-light predicate that answers a domain question with yes/no.**
   ❌ `const validateUser = (user: User) => { /* 50 lines checking everything */ }`
   ✅ `const hasRole = (user: User, role: Role): boolean => user.roles.includes(role)`

9. **[Policies-Definition] Policy: A business decision rule. It composes checks, considers context. Returns Expressive Types**
    ❌ `const canAccess = (user: User): boolean => user.active`
    ✅ `const canAccess = (user: User, resource: Resource, time: Date): Decision => hasRole(user, "admin") && isBusinessHours(time) ? Allow : Deny`

## Policies and checks:

10. **[Rich-Types] Use types to encode state and results; new types for new states, rich return types instead of primitives**
    ❌ `type Order = { status: "pending" | "paid", paidAt?: Date }; const validate = (cart: Cart): boolean => ...`
    ✅ `type PendingOrder = {...}; type PaidOrder = {..., paidAt: Date}; const validate = (cart: Cart): ValidCart | InvalidCart => ...`

## Workflows (use-cases)

11. **[Decision-Interpretation] Interpret decision results; sequence of calls to services**
    ❌ `const completePurchase = (cart: Cart) => canPurchase(cart) && chargeCard(cart)`
    ✅ `const completePurchase = (cart: Cart) => Effect.gen(function*() { const decision = canPurchase(cart); if (decision.allowed) { yield* PaymentService.charge(...) } })`

12. **[Events-After-Effects] Publish events after confirmed effects (emitting to a bus is an effect).**
    ❌ `const createUser = () => Effect.gen(function*() { EventBus.emit("created"); yield* Database.save(...) })`
    ✅ `const createUser = () => Effect.gen(function*() { yield* Database.save(...); yield* EventBus.emit("created") })`

13. **[Effect-Ordering] Handle retries, compensations, and transactional ordering (e.g., reserve → charge → ship).**
    ❌ `const checkout = () => Effect.gen(function*() { yield* charge(); yield* reserve(); yield* ship() })`
    ✅ `const checkout = () => Effect.gen(function*() { yield* reserve(); yield* charge(); yield* ship() })`

14. **[No-Vendor-Logic] Do not encode vendor-specific logic here, that goes in platform/domain services**
    ❌ `const processPayment = () => stripe.charges.create({ amount: 1000, currency: "usd" })`
    ✅ `const processPayment = () => Effect.gen(function*() { const payment = yield* PaymentService; yield* payment.charge(...) })`

## Idempotency and retries:

15. **[Idempotent-Actions] All externally visible actions should be idempotent; use idempotency keys**
    ❌ `const createOrder = (cart: Cart) => Database.insert({ id: generateId(), ... })`
    ✅ `const createOrder = (orderId: OrderId, cart: Cart) => Database.upsert({ id: orderId, ... })`

16. **[Safe-Effect-Order] Order effects safely; irreversible effects last**
    ❌ `const checkout = () => Effect.gen(function*() { yield* sendConfirmationEmail(); yield* getShippingInformation() })`
    ✅ `const checkout = () => Effect.gen(function*() { yield* getShippingInformation(); yield* sendConfirmationEmail() })`

## Error handling and return shapes

17. **[Typed-Errors] Prefer explicit, typed errors (discriminated unions) over generic exceptions.**
    ❌ `const getUser = (id: UserId): Effect.Effect<User, Error> => ...`
    ✅ `const getUser = (id: UserId): Effect.Effect<User, UserNotFoundError | DatabaseError> => ...`

## Naming conventions:

18. **[Workflow-Naming] Workflows: verb-noun/scenario (Checkout, FulfillOrder, GetNode).**
    ❌ `const userOrder = () => ...`
    ✅ `const fulfillOrder = () => ...`

19. **[Decision-Naming] Decisions: verb-noun with decide/validate/calculate (decideEnoughPoints, validateCart).**
    ❌ `const points = (user: User) => ...`
    ✅ `const decideEnoughPoints = (user: User, cost: Points) => ...`

20. **[Ops-Naming] Values/ops: Money (schema) and MoneyOps (functions).**
    ❌ `const moneyAdd = (a: Money, b: Money) => ...`
    ✅ `const Money = Schema.Struct({ ... }); const MoneyOps = { add: (a: Money, b: Money) => ... }`

## Heuristics for "where does this go?"

21. **[Type-Utilities-Location] Value-level utility tied to one type → domain/ops (MoneyOps, PointsOps).**
    ❌ `workflows/money-operations.ts`
    ✅ `domain/ops/MoneyOps.ts`

22. **[Business-Rules-Location] Cross-entity business rule/policy → policies (pure).**
    ❌ `workflows/check-user-can-purchase.ts`
    ✅ `policies/purchase-rules.ts: canPurchase(user, cart, inventory)`

23. **[Orchestration-Location] Sequencing of steps, calling external systems → workflows.**
    ❌ `domain/create-and-charge-order.ts`
    ✅ `workflows/complete-purchase.ts`

## Temporal-like workflows without Temporal

24. **[Deterministic-Workflows] Keep workflows deterministic with respect to inputs + persisted state.**
    ❌ `const workflow = () => Effect.gen(function*() { const now = new Date(); ... })`
    ✅ `const workflow = (timestamp: Date) => Effect.gen(function*() { /* use timestamp */ })`

25. **[Persist-State-Transitions] Persist state transitions (commands/events) if you need durability/replay.**
    ❌ `const processOrder = () => Effect.gen(function*() { /* just do the work */ })`
    ✅ `const processOrder = () => Effect.gen(function*() { yield* EventStore.append("OrderCreated", ...); /* do work */ })`

26. **[Idempotent-Services] Make service calls idempotent and retryable.**
    ❌ `const sendEmail = (to: Email) => EmailService.send(to, generateMessage())`
    ✅ `const sendEmail = (messageId: MessageId, to: Email) => EmailService.send({ messageId, to, ... })`

## Testing strategy

27. **[Values-Unit-Tests] Values/ops: unit tests**
    ✅ `test("adds money", () => expect(MoneyOps.add(USD(5), USD(3))).toBe(USD(8)))`
    ✅ `test("multiplies money", () => expect(MoneyOps.multiply(USD(10), 2)).toBe(USD(20)))`

28. **[Checks-Unit-Tests] checks: unit tests**
    ✅ `test("hasRole returns true when user has role", () => expect(hasRole(user, "admin")).toBe(true))`
    ✅ `test("isActive returns false for suspended user", () => expect(isActive(suspendedUser)).toBe(false))`

29. **[Policies-Scenario-Tests] policies: scenario-based tests with test layers**
    ❌ `test("canPurchase", () => expect(canPurchase(user)).toBe(true))`
    ✅ `test("canPurchase allows admin during business hours", () => Effect.runPromise(canPurchase(adminUser, item, businessHour).pipe(Effect.provide(TestInventoryLayer))))`

30. **[Workflows-Test-Layers] Workflows: test with test layers for services (Effect Test/Layer).**
    ❌ `test("checkout", async () => { /* uses real Stripe */ })`
    ✅ `test("checkout", () => Effect.runPromise(checkout().pipe(Effect.provide(TestPaymentLayer))))`

31. **[Domain-Test-Layers] Domain services: test with test layers**
    ❌ `test("PersistenceService", () => { /* uses mocks */ })`
    ✅ `test("PersistenceService.findById", () => Effect.runPromise(PersistenceService.findById(id).pipe(Effect.provide(TestDatabaseLayer))))`

32. **[Platform-Integration-Tests] Platform services: integration tests against sandboxes/containers**
    ❌ `test("Neo4jService", () => { /* mocked */ })`
    ✅ `test("Neo4jService.query", async () => { /* uses testcontainers with real Neo4j */ })`

## Anti-patterns to avoid

33. **[No-Boolean-Policies] Booleans from policies without context (checks can be booleans if answer is yes/no, some checks will result in list of options)**
    ❌ `const canAccess = (user: User): boolean => ...`
    ✅ `const canAccess = (user: User, resource: Resource): AccessDecision => ({ allowed: true, reason: "admin" })`

34. **[No-Logic-In-Services] Putting checks/policies in platform or domain services**
    ❌ `services/domain/UserService.ts: canPurchase(user: User) => ...`
    ✅ `policies/purchase-rules.ts: canPurchase(user: User, cart: Cart) => ...`

35. **[No-God-Module] Centralizing every if into one "god decisions" module**
    ❌ `decisions/all-decisions.ts: canPurchase(), canAccess(), canDelete(), ...`
    ✅ `policies/purchase-rules.ts: canPurchase(); policies/access.ts: canAccess()`

## Adoption tips

36. **[Start-With-Schema] Start with Schema.struct + ops modules**
    ❌ `type Money = number; const add = (a: number, b: number) => a + b`
    ✅ `const Money = Schema.Struct({ amount: Schema.Number, currency: Schema.Literal("USD") }); const MoneyOps = { add: ... }`

37. **[Self-Documenting-Types] With the number of explicit types code should be fairly self documenting**
    ❌ `const process = (data: any): any => ...`
    ✅ `const processOrder = (order: ValidatedOrder): Effect.Effect<ProcessedOrder, ProcessingError> => ...`
