Wlaschin (and Event Sourcing) prefers returning What Happened (The Event), not just the new object.

Why? Because PackageLoaded is richer. It can trigger side effects (email the customer, update inventory) without the side-effect handler needing to inspect the trucks guts.

ie

```typescript
getData().pipe(
    (data) => { canDoAction(data) }
    Match.value(input).pipe(
        Match.when(typeof allowed, { doAction(data) }
        Match.when(typeof firstAttempt, { giveWarning(data) }
        Match.When(typeof prohibited, { returnError(data) }
        Match.exhaustive
    )
    (data) => { nextFunction() }
)
```