# Directory Layout

```
src/
├── domain/                   # PURE DOMAIN KNOWLEDGE
│   ├── models/               # Data Types + Pure Logic
│   │   ├── Money.ts          # Schema + pure functions (add, format)
│   │   └── Cart.ts           # Schema + Pure Ops (isEmpty, total)
│   │   
│   └── interfaces/           # Service Contracts (Ports)
│       ├── PaymentRepo.ts    # interface PaymentRepo { ... }
│       └── ShippingSvc.ts    # interface ShippingSvc { ... }
│
├── policies/                  # BUSINESS DECISIONS
│   │                           # Pure functions, multi-entity context
│   │                           # Returns Result or Strategy Decision
│   ├── purchase/
│   │   └── routing.ts        # determinePaymentStrategy(amount)
│   └── user/
│       └── access.ts         # canAccessResource(user, resource)
│
├── workflows/                 # ORCHESTRATION
│   │                           # Impure, connects pieces, transaction flow
│   ├── purchase/
│   │   └── checkout.ts       # Orchestrates Payment, Inventory, Email
│   └── content/
│       └── publish.ts
│
├── registries/                # DYNAMIC WIRING (Strategy Pattern)
│   │                           # Runtime selection of implementations
│   └── PaymentRegistry.ts    # Selects Stripe vs PayPal based on Policy
│
├── services/                  # INFRASTRUCTURE IMPLEMENTATIONS
│   └── platform/              # Concrete Adapters
│       ├── Stripe.service.ts # Implements PaymentInterface
│       ├── Neo4j.service.ts  # Implements GraphInterface
│       └── Disk.service.ts   # Implements FileInterface
│
├── lib/                       # GENERIC UTILITIES
│   │                           # Internal libraries, no domain knowledge
│   ├── neo4j-client/
│   └── git-helper/
│
└── layers/                    # STATIC DEPENDENCY INJECTION
    └── Main.layer.ts         # Prod/Test wiring configuration
```
