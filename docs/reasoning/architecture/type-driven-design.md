# Type-Driven Design & Rich Domain Models

## The Philosophy
We follow the "Make Illegal States Unrepresentable" philosophy from Scott Wlaschin's *Domain Modeling Made Functional*.
Instead of writing runtime checks for everything, we use the Type System to ensure that if code compiles, the data is likely valid.

## Key Concepts

### 1. Branded Types (Single-Case Union Models)
Never use bare primitives for domain concepts. `string` is too broad for an Email. `number` is too dangerous for a Price.

- **Bad**: `const sendEmail = (to: string, body: string)` (Easy to mix up arguments)
- **Good**: `const sendEmail = (to: Email, body: Body)`

In Effect, we use `Schema.brand` to create these distinct types with zero runtime overhead after validation.

### 2. Making Illegal States Unrepresentable
If a User cannot have a "PaidDate" unless they have a "PaidStatus", do not make `paidDate` optional on the generic User. Create two types.

- **Bad**:
  ```typescript
  type Order = {
    state: 'Unpaid' | 'Paid';
    paidAt?: Date; // Ambiguous: Can I have an Unpaid order with a paidAt date?
  }
  ```

- **Good**:
  ```typescript
  type UnpaidOrder = { state: 'Unpaid' }
  type PaidOrder = { state: 'Paid', paidAt: Date }
  type Order = UnpaidOrder | PaidOrder
  ```
  Now it is *impossible* to access `paidAt` on an Unpaid order. The compiler forces you to check the state first.

### 3. Parse, Don't Validate
"Validation" implies checking a value and returning true/false, but keeping the original untrusted type (e.g., `string`).
"Parsing" implies checking a value and returning a *new, trusted type* (e.g., `Email`).

- **Workflow**: 
  1. Receive `unknown` input.
  2. **Parse** it into a Domain Type (`Schema.decode`).
  3. Pass the Domain Type to your logic.
  4. Your logic never handles validation errors; it trusts the type.

### 4. The "Always Valid" Domain Model
Functions in the `domain/` layer should generally assume their inputs are valid.
- `calculateTotal(cart: Cart)`: Assumes `Cart` is a valid structure.
- Validation happens at the *edges* (in the Workflow or Input Adapters), converting `RawJson` -> `Cart`.

### 5. Pipeline States (Intermediate Types)
In Workflows, use specific types to represent the progress of a process. This ensures that steps cannot be executed out of order. You cannot "Ship" an order that hasn't been "Paid" because the `ship()` function demands a `PaidOrder` type, which is only created by the `pay()` function.

- **Pattern**:
  ```typescript
  validateOrder(order: UnvalidatedOrder): ValidatedOrder // ensures address exists
  priceOrder(order: ValidatedOrder): PricedOrder         // calculates taxes/totals
  makePayment(order: PricedOrder): PaidOrder             // confirms transaction
  shipOrder(order: PaidOrder): ShippingConfirmation
  ```
