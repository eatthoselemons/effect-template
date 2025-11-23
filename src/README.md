# Source Directory

This is the root of the application source code.

## Structure

- **`domain/`**: Pure domain knowledge (Models & Interfaces).
- **`policies/`**: Pure business decisions and rules.
- **`workflows/`**: Impure orchestration scripts.
- **`registries/`**: Runtime strategy selection (Wiring logic).
- **`services/`**: Infrastructure implementations (Adapters).
- **`layers/`**: Dependency Injection wiring.
- **`lib/`**: Generic internal libraries.

For detailed documentation, see [docs/project-structure/directory-layout.md](../../docs/project-structure/directory-layout.md).
