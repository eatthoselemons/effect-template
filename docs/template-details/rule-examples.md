# Rule Examples

## Core Rules
```markdown
- [Primary-No-this] never use `this` keyword
```

## level-1
```markdown
- [Primary-No-This] Never use `this` keyword
  ❌ `onClick={() => this.handleClick()}`
  ✅ `onClick={() => handleClick()}`
```

## level-2
~~~markdown
Services use `Context.Tag` to declare dependencies and provide implementations.

**❌ WRONG - Do NOT use classes with `this`:**
```typescript
// DON'T DO THIS - uses 'this' and class-based approach
export class UserService extends Effect.Service<UserService>()("UserService", {
  effect: Effect.gen(function*() {
    const db = yield* Database
    
    return {
      getUser: (id: UserId) => this.db.query(...)  // ❌ Uses 'this'
    }
  })
})
```

**✅ CORRECT - Use Context.Tag and plain objects:**
```typescript
// Define the service interface
export interface FileSystemStorageService {
  readonly readFile: (path: string) => Effect.Effect<string, GitPersistenceError>
  readonly writeFile: (path: string, content: string) => Effect.Effect<void, GitPersistenceError>
  readonly listFiles: (path: string) => Effect.Effect<string[], GitPersistenceError>
  readonly commit: (message: string) => Effect.Effect<void, GitPersistenceError>
}

// Create the service tag
export class FileSystemStorageService extends Context.Tag("FileSystemStorageService")<
  FileSystemStorageService,
  FileSystemStorageService
>() {
  static of(impl: FileSystemStorageService): FileSystemStorageService {
    return impl
  }
}
```
~~~

## checklist
```markdown

- 1. [ ] [Primary-No-This] Never use `this` keyword
  ❌ `onClick={() => this.handleClick()}`
  ✅ `onClick={() => handleClick()}`
...
- 20. [ ] [Composition-Over-Inheritance] Always use composition, never inheritance
  ❌ `interface Node() {}; class ContentNode extends Node {};`
  ✅ ``
```
