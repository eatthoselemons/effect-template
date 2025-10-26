# Directory Layout

```
src/
├── domain/                   # DATA
│   ├── types/                # Schemas, branded types, errors
│   └── models/               # Domain models (Money, Cart, etc.)
│
├── checks/                    # CHECKS - Small, context-light predicates
│   │                           # Answer domain questions with yes/no
│   │                           # Operate on one concept or small cluster
│   ├── cart/
│   │   └── validation.ts     # isValidCart, hasValidItems
│   └── user/
│       └── permissions.ts    # hasRole, isActive
│
├── policies/                  # POLICIES - Business decision rules
│   │                           # Compose checks, consider context (time, role, config, jurisdiction)
│   │                           # Return reasoned decisions (not just true/false)
│   ├── cart/
│   │   └── purchase-rules.ts # canPurchase (composes checks + context)
│   └── user/
│       └── access.ts         # canAccessResource (role + time + jurisdiction)
│
├── workflows/                 # BUSINESS PROCESS ORCHESTRATION
│   ├── purchase/
│   │   ├── complete-purchase.ts
│   │   └── refund-purchase.ts
│   └── content/
│       ├── create-content.ts
│       └── update-content.ts
│
├── services/
│   ├── platform/              # Infrastructure/external services
│   │   ├── Neo4j.service.ts
│   │   └── FileSystem.layer.ts
│   └── domain/                # Intermediate services, adapters
│       ├── Persistance.service.ts
│       ├── Inventory.service.ts
│       └── Shipping.service.ts
│
└── layers/                    # DEPENDENCY INJECTION
    ├── platform/
    │   ├── Neo4j.layer.ts
    │   └── FileSystem.layer.ts
    └── domain/
        ├── Persistance.layer.ts
        ├── Inventory.service.ts
        └── Shipping.service.ts
```
