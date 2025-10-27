# [Immutable-Data] Prefer immutable data from effect: return new values instead of mutating

All data transformations should return new values rather than mutating existing ones. This makes code predictable, enables safe concurrent operations, and prevents bugs from unexpected mutations.

**❌ WRONG - Mutating array:**
```typescript
// DON'T DO THIS - mutates the input array
export const addItemToCart = (cart: ShoppingCart, item: CartItem): ShoppingCart => {
  cart.items.push(item)  // ❌ Mutates the original cart
  cart.totalPrice += item.price
  return cart
}

// Caller's data is unexpectedly changed
const myCart = { items: [], totalPrice: 0 }
const updatedCart = addItemToCart(myCart, newItem)
// myCart is now modified! ❌
```

**❌ WRONG - Mutating object properties:**
```typescript
// DON'T DO THIS - mutates user object
export const activateUser = (user: User): User => {
  user.status = "active"  // ❌ Mutates the original user
  user.activatedAt = new Date()
  return user
}
```

**❌ WRONG - Mutating nested structures:**
```typescript
// DON'T DO THIS - mutates nested objects
export const updateUserAddress = (user: User, newAddress: Address): User => {
  user.profile.address = newAddress  // ❌ Mutates nested object
  return user
}
```

**✅ CORRECT - Return new array with spread:**
```typescript
// Creates new cart without mutating original
export const addItemToCart = (cart: ShoppingCart, item: CartItem): ShoppingCart => ({
  items: [...cart.items, item],  // ✅ New array
  totalPrice: cart.totalPrice + item.price
})

// Original cart is unchanged ✅
const myCart = { items: [], totalPrice: 0 }
const updatedCart = addItemToCart(myCart, newItem)
// myCart is still { items: [], totalPrice: 0 }
```

**✅ CORRECT - Return new object with spread:**
```typescript
// Creates new user object
export const activateUser = (user: User): User => ({
  ...user,  // ✅ Spread existing properties
  status: "active",
  activatedAt: new Date()
})
```

**✅ CORRECT - Immutable nested updates:**
```typescript
// Creates new objects all the way down
export const updateUserAddress = (user: User, newAddress: Address): User => ({
  ...user,
  profile: {
    ...user.profile,  // ✅ New profile object
    address: newAddress
  }
})
```

**✅ CORRECT - Using Array methods that return new arrays:**
```typescript
// Functional array operations
export const removeItem = (cart: ShoppingCart, itemId: ItemId): ShoppingCart => ({
  ...cart,
  items: cart.items.filter(item => item.id !== itemId)  // ✅ filter returns new array
})

export const updateItemQuantity = (cart: ShoppingCart, itemId: ItemId, quantity: number): ShoppingCart => ({
  ...cart,
  items: cart.items.map(item =>  // ✅ map returns new array
    item.id === itemId 
      ? { ...item, quantity }  // ✅ New item object
      : item
  )
})
```

**✅ CORRECT - Using Effect's Array module:**
```typescript
import { Array as EffectArray } from "effect"

export const processOrders = (orders: Order[]): Order[] =>
  pipe(
    orders,
    EffectArray.filter(order => order.status === "pending"),  // ✅ Immutable
    EffectArray.map(order => ({ ...order, processedAt: new Date() }))  // ✅ Returns new
  )
```

This immutability ensures your functions are pure, predictable, and safe to use in concurrent contexts.
