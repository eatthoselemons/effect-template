# Effect-TS Best Practices Guide

This guide documents best practices for writing Effect-TS code, following principles from:
- **"Grokking Simplicity"** by Eric Normand (functional programming fundamentals)
- **"Domain Modeling Made Functional"** by Scott Wlaschin (domain-driven design)
- **Effect-TS patterns** (modern TypeScript effect systems)

## Core Principles

### 1. Domain-Driven Design (Scott Wlaschin)

#### Make Illegal States Unrepresentable

Use the type system to prevent invalid domain states:

```typescript
// ❌ BAD: Primitives allow invalid states
import {CpuCount} from "./VmSpec";

interface VmConfig {
  cpus: number        // Could be 0, negative, or 1000
  memory: number      // Could be any number
  status: string      // Could be typo: "runing"
}

// ✅ GOOD: Types enforce domain rules
const Slug = Schema.String.pipe(
  Schema.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: () =>
      "Slug must be lowercase letters, numbers, and hyphens only (e.g., 'my-snippet-name')",
  }),
  Schema.minLength(1),
  Schema.maxLength(100),
  Schema.brand('Slug'),
);
export type Slug = typeof Slug.Type;


export const CpuCount = Schema.Number.pipe(
  Schema.int(),
  Schema.between(1, 64),  // Physical constraint
  Schema.brand("CpuCountBrand" as const)
)
// Make sure to bind type
export type CpuCount = typeof CpuCount.Type;

export const VmStatus = Schema.Literal("running", "stopped", "error").pipe(
  Schema.brand("VmStatus")
)
export type VmStatus = typeof VmStatus.Type

interface VmConfig {
  slug: Slug
  cpus: CpuCount      // Guaranteed valid
  memory: MemoryMB    // Guaranteed valid
  status: VmStatus    // Typos impossible
}
```

#### Model the Domain Precisely

Domain types should exactly match business concepts:

```typescript
// ❌ BAD: Generic, imprecise
type NetworkConfig = {
  vlan: number
  subnet: string
}

// ✅ GOOD: Precise domain model
export const VlanId = Schema.Number.pipe(
  Schema.int(),
  Schema.between(1, 4094),  // IEEE 802.1Q valid range
  Schema.brand("VlanId")
)
export type VlanId = typeof VlanId.Type;

export const SubnetCidr = Schema.String.pipe(
  Schema.pattern(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}$/),
  Schema.brand("SubnetCidr")
)

export type SubnetCidr = typeof SubnetCidr.Type;

export const NetworkSegment = Schema.Struct({
  name: Schema.String,
  vlanId: VlanId,
  subnet: SubnetCidr,
  gateway: IpAddress,
})
```

#### Use Ubiquitous Language

Domain types should use terminology from the problem domain:

```typescript
// ❌ BAD: Technical/generic terms
interface Config {
  val: number
  data: string
}

// ✅ GOOD: Domain language
export const TestSection = Schema.Struct({
  name: TestSectionName,
  estimatedDuration: EstimatedDuration,
  vmSpecs: Schema.Array(VmSpec),
  requiresNestedVirt: Schema.Boolean
})
```

## Tagged Error Handling

### ❌ DON'T: Throw generic errors

Never use generic `Error` or `throw` statements in Effect code.

```typescript
// ❌ BAD - Generic Error loses type information
const validateTask = (data: unknown): Effect.Effect<Task, Error> => {
  return Effect.try({
    try: () => {
      if (!data) {
        throw new Error("Invalid data");  // ❌ Generic error
      }
      return data as Task;
    },
    catch: (e) => new Error(String(e))  // ❌ Loses error context
  });
};
```

### ✅ DO: Use tagged error classes


```typescript
class ValidationError extends Data.TaggedError("ValidationError")<{
  message: string
}> {}


// Use Effect.fail instead of throw
const validateTask = (data: unknown): Effect.Effect<Task, ValidationError> => {
  if (!data || typeof data !== "object") {
    return Effect.fail(new ValidationError("Data must be an object"));  // ✅
  }
  
  const task = data as any;
  if (!task.text) {
    return Effect.fail(new ValidationError("Missing required field: text"));  // ✅
  }
  
  return Effect.succeed(task as Task);
};
```

### Why Tagged Errors?

1. **Type-safe error handling**: Function signatures show exactly what can fail
2. **Pattern matching**: Use `Effect.catchTag` to handle specific errors
3. **Better debugging**: Error `_tag` shows up in stack traces
4. **Self-documenting**: Compiler enforces handling all error cases
5. **Composable**: Errors compose through Effect chains

### Pattern Matching on Errors

```typescript
const program = pipe(
  loadTask(id),
  // Catch specific error types by tag
  Effect.catchTag("NotFoundError", (error) => 
    Effect.succeed(createDefaultTask(error.id))
  ),
  Effect.catchTag("ValidationError", (error) => 
    Effect.fail(new BadRequestError(error.message))
  ),
  // Catch all remaining errors
  Effect.catchAll((error) => 
    Effect.fail(new UnknownError(String(error)))
  )
);
```

### Effect.fail vs throw

```typescript
// ❌ NEVER use throw
const bad = () => {
  if (condition) {
    throw new Error("Bad!");  // ❌ Not type-safe
  }
};

// ✅ ALWAYS use Effect.fail
const good = () => {
  if (condition) {
    return Effect.fail(new ValidationError("Good!"));  // ✅ Type-safe
  }
  return Effect.succeed(result);
};
```

---

## pipe vs Effect.gen

### DEFAULT: Always use pipe

**Golden Rule: Use `pipe` everywhere by default. Remember to use effects `do` notation

### ✅ Use pipe for linear chains

```typescript
// ✅ GOOD - Linear transformation chain
const updateTaskText = (id: TaskId, newText: string) =>
  pipe(
    repo.getById(id),
    Effect.flatMap((task) => updateText(task, newText)),
    Effect.tap((updated) => repo.save(updated))
  );
```

### ✅ Use pipe even with conditionals

```typescript
// ✅ GOOD - Simple conditional with ternary
const completeTask = (id: TaskId) =>
  pipe(
    repo.getById(id),
    Effect.flatMap((task) =>
      task.state._tag === "Done"
        ? Effect.succeed(task)  // Already done
        : pipe(
            transitionState(task, Done),
            Effect.tap((updated) => repo.save(updated))
          )
    )
  );
```

### ❌ Bad: Nested pipes become unreadable

```typescript
// ❌ BAD - Too many nested pipes (hard to read)
const complexOperation = (id: TaskId) =>
  pipe(
    repo.getById(id),
    Effect.flatMap((task) =>
      pipe(
        repo.getParent(task.parentId),
        Effect.flatMap((parent) =>
          pipe(
            repo.getChildren(task.id),
            Effect.flatMap((children) =>
              pipe(
                validateHierarchy(parent, task, children),
                Effect.flatMap((valid) =>
                  valid
                    ? pipe(
                        updateTask(task),
                        Effect.flatMap(() => notifyParent(parent))
                      )
                    : Effect.fail(new ValidationError("Invalid"))
                )
              )
            )
          )
        )
      )
    )
  ); // 😱 Pyramid of doom!
```

## Service Pattern

### Effect.Service Pattern (Official)

Use the official `Effect.Service` class pattern from the docs.

// TODO convert to do notation

```typescript
import { Effect, Layer } from "effect";

export class TaskQueryService extends Effect.Service<TaskQueryService>()(
  "TaskQueryService",
  {
    effect: Effect.gen(function* () {
      // 1. Get dependencies from Context
      const repo = yield* TaskRepository;
      
      // 2. Define operations as const functions
      const getTask = (id: TaskId) => repo.getById(id);
      
      const getAllTasks = () => repo.getAll();
      
      const getTaskTree = (rootId: TaskId) =>
        pipe(
          repo.getAll(),
          Effect.map((tasks) => buildTaskTree(tasks, rootId)),
          Effect.flatMap((tree) =>
            tree
              ? Effect.succeed(tree)
              : Effect.fail(NotFoundError.make(rootId))
          )
        );
      
      // 3. Return service object as const
      return {
        getTask,
        getAllTasks,
        getTaskTree,
      } as const;
    }),
    dependencies: [],  // Can list dependencies for Layer.provideMerge
  }
) {
  // 4. Optional: Add Test layer
  static Test = this.Default.pipe(
    Layer.provide(InMemoryTaskRepositoryTest)
  );
}
```

**Key Points:**
- Use `Effect.gen` inside `effect` (this is the ONE place it's OK)
- Close over dependencies with `yield*`
- Return operations as `const` object
- `.Default` provides the live layer automatically
- `.Test` can provide mock layers

### Using Services

```typescript
// In application code
export const updateName = (
  task: Task, 
  newName: validName
): E.Effect<void, TaskError, PouchDBRepositoryLive> =>
  pipe(
    PouchDBRepositoryLive,
    E.tap((db) => db.create({...task, name: newName})), // the output is still the dep
    E.tap((db) => db.sync()), // the output is still the dep
    E.asVoid, // discarding all and returning void
  );

const program = Effect.gen(function* () {
  const queries = yield* TaskQueryService;
  const tasks = yield* queries.getAllTasks();
  return tasks;
});

// With proper layers
const AppLive = Layer.mergeAll(
  PouchDBRepositoryLive(db),
  TaskQueryService.Default,
  TaskCommandService.Default
);

Effect.runPromise(program.pipe(Effect.provide(AppLive)));
```

#### Railway-Oriented Programming

Use Effect's error handling for domain workflows:

```typescript
// Each step can succeed or fail
const provisionWorkflow = (spec: VmSpec) =>
  Effect.gen(function* () {
    // Validate
    yield* validateVmSpec(spec)  // Effect<void, ValidationError>
    
    // Allocate resources
    const allocation = yield* allocateResources(spec)  // Effect<Allocation, ResourceError>
    
    // Provision
    const vm = yield* provisionVm(spec, allocation)  // Effect<VM, ProvisionError>
    
    // Configure
    yield* configureVm(vm)  // Effect<void, ConfigError>
    
    return vm
  }).pipe(
    // Handle errors at appropriate level
    Effect.catchTag("ValidationError", (e) => /* handle */),
    Effect.catchTag("ResourceError", (e) => /* handle */),
  )
```

### 2. Service Definition Pattern

Always use `Effect.Service()()` pattern with explicit dependencies:

```typescript
// ❌ BAD: Static methods, context.Tag
export class SSHConnection extends Context.Tag("SSHConnection")<...>() {
  static live = Layer.effect(...)
}

// ✅ GOOD: Service pattern with dependencies
export class SSHConnection extends Effect.Service<SSHConnection>()(
  "SSHConnection",
  {
    effect: Effect.gen(function* () {
      // Implementation
      return {
        execute: (cmd: Command) => // ...
      }
    }),
    dependencies: [] // Explicit dependencies
  }
) {
  static Test = Layer.succeed(SSHConnection, {
    execute: () => Effect.succeed(mockResult)
  })
}
```

### 3. Schema: Use Schema.Struct, Not Schema.Class

```typescript
// ❌ BAD: Schema.Class with methods using `this`
export class Port extends Schema.Class<Port>("Port")({
  value: Schema.Number
}) {
  toString(): string {
    return this.value.toString() // Using `this`!
  }
}

// ✅ GOOD: Schema.Struct + pure functions
export const Port = Schema.Struct({
  value: Schema.Number.pipe(Schema.int(), Schema.between(1, 65535))
})
export interface Port extends Schema.Schema.Type<typeof Port> {}

// Pure function instead of method
export const portToString = (port: Port): string => 
  port.value.toString()

// Or namespace for organization
export namespace Port {
  export const toString = (port: Port): string => 
    port.value.toString()
  
  export const SSH = { value: 22 } as Port
}
```

### 4. Never Use `this` - Use Functional Style

```typescript
// ❌ BAD: Using `this`
class CommandResult {
  succeeded(): boolean {
    return this.exitCode.value === 0
  }
}

// ✅ GOOD: Pure function
export const isSuccess = (result: CommandResult): boolean =>
  result.exitCode.value === 0

// Or namespace pattern
export namespace CommandResult {
  export const isSuccess = (result: CommandResult): boolean =>
    result.exitCode.value === 0
  
  export const isFailed = (result: CommandResult): boolean =>
    !isSuccess(result)
}
```

### 5. One Concept Per File

```typescript
// ❌ BAD: Multiple concepts in one file
// Command.ts
export class Command { }
export class CommandResult { }
export class ExitCode { }
export class Stdout { }
export class Stderr { }

// ✅ GOOD: One concept per file
// Command.ts
export const Command = Schema.Struct({ ... })

// CommandResult.ts
export const CommandResult = Schema.Struct({ ... })

// ExitCode.ts
export const ExitCode = Schema.Struct({ ... })

// Stdout.ts
export const Stdout = Schema.Struct({ ... })

// Stderr.ts
export const Stderr = Schema.Struct({ ... })
```

### 6. No For Loops - Use Functional Iteration

```typescript
// ❌ BAD: Imperative for loop
for (const segment of topology.segments) {
  const result = await test(segment)
  results.push(result)
}

// ✅ GOOD: Array methods for calculations
const totalCpus = vmSpecs.map(spec => spec.cpus.value)
  .reduce((sum, cpu) => sum + cpu, 0)

// ✅ GOOD: ReadonlyArray.map for immutability
import { ReadonlyArray } from "effect"

const mapped = ReadonlyArray.map(
  segments,
  (segment) => segment.name
)
```

### 7. Avoid Primitive Obsession

```typescript
// ❌ BAD: Primitives everywhere
function provision(name: string, cpus: number, memory: number)

// ✅ GOOD: Rich domain types
export const VmName = Schema.String.pipe(
  Schema.pattern(/^[a-z0-9-]+$/),
  Schema.brand("VmName")
)
export type VmName = Schema.Schema.Type<typeof VmName>

export const CpuCount = Schema.Number.pipe(
  Schema.int(),
  Schema.between(1, 64),
  Schema.brand("CpuCount")
)
export type CpuCount = Schema.Schema.Type<typeof CpuCount>

function provision(spec: VmSpec)
```


### 9. Layer Composition Patterns

```typescript
// Use pipe for clean composition
export const AppLayer = Layer.merge(
  ConfigLayer,
  LoggerLayer
).pipe(
  Layer.provide(DatabaseLayer),
  Layer.provide(ResourceLayer)
)

// Factory functions for parameterized layers
export const makeSSHLayer = (connection: HostConnection) =>
  Layer.effect(
    SSHConnection,
    Effect.gen(function* () {
      // Implementation
    })
  )
```

## Common Patterns

### Repository Pattern

```typescript
export class UsersRepo extends Effect.Service<UsersRepo>()(
  "UsersRepo",
  {
    effect: Effect.gen(function* () {
      const sql = yield* Sql
      
      return {
        findById: (id: string) =>
          sql.query(/* ... */).pipe(
            Effect.map(rows => rows[0])
          ),
        
        create: (user: User) =>
          sql.query(/* ... */)
      }
    }),
    dependencies: [SqlLayer]
  }
) {
  static Test = Layer.succeed(UsersRepo, {
    findById: (id: string) => Effect.succeed(mockUser),
    create: (user: User) => Effect.succeed(user)
  })
}
```

## Checklist for Code Review

- [ ] No `this` keyword anywhere
- [ ] No `for`/`while` loops - use functional iteration and `pipe`
- [ ] Schema.Struct, not Schema.Class
- [ ] One concept per file
- [ ] Services use `Effect.Service()()` pattern
- [ ] Branded types for domain concepts
- [ ] No primitive obsession
- [ ] Layer composition uses pipe
- [ ] Tagged errors for error handling
- [ ] Resources use Layer.scoped + Effect.acquireRelease

## Domain-Driven Design Workflow

Following Scott Wlaschin's approach:

### 1. Understand the Domain
- Talk to domain experts
- Learn ubiquitous language
- Identify bounded contexts

### 2. Model the Domain
```typescript
// Start with types that match domain language
export const NetworkSegment = Schema.Struct({
  name: Schema.String,           // "Management", "DMZ"
  vlanId: VlanId,                // 10, 20, 30...
  subnet: SubnetCidr,            // "10.10.0.0/16"
  gateway: IpAddress,            // "10.10.0.1"
  accessRules: Schema.Array(Schema.String)
})
```