# Layers (Dependency Injection)

**Content**: Static Application Wiring.

## Usage
Construct the final application layers here. This is where you decide:
"In Production, use Postgres. In Test, use InMemory."

## Example

```typescript
// Main.layer.ts
export const MainLayer = Layer.mergeAll(
  PostgresLive,
  StripeLive,
  // ...
)
```
