import type { Cart } from "../../domain/models/Cart.js"


// Result Type
export type DiscountDecision = 
  | { _tag: "NoDiscount" }
  | { _tag: "ApplyDiscount"; percentage: number }

// Pure Policy Function
export const determineDiscount = (cart: Cart): DiscountDecision => {
  // Rule: If total > $100, give 10% off
  // Note: We need to calculate total here or pass it in. 
  // Ideally we pass domain objects.
  
  // Re-calculating total here or importing the pure op from Cart?
  // Let's import the pure op.
  // Wait, circular dependency risk if Cart imports Policy? 
  // Policy imports Cart (Models). Models never import Policy. Safe.
  
  // However, for this example, I'll implement a simple check on item count to avoid re-importing logic if I want to keep it decoupled.
  // Actually, importing `total` from Cart is fine.
  
  // Let's use a simpler rule for this example to avoid import complexity in this "Hero" slice:
  // Rule: If more than 5 items, 10% off.
  
  const itemCount = cart.items.reduce((acc, item) => acc + item.quantity, 0)
  
  if (itemCount > 5) {
    return { _tag: "ApplyDiscount", percentage: 10 }
  }
  
  return { _tag: "NoDiscount" }
}
