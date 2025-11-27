# Design: Main Example - Phase 2: Context Mapping (The Nouns)

**Goal:** Define the precise types using Wlaschin's iterative refinement process.

*Note: We use pseudo-F# syntax here because it is cleaner for type design. Translation to TypeScript happens in implementation.*

## Iteration 1: Rough Signatures (The Goal)
We start with the high-level workflow we identified in Phase 1.

```fsharp
// The Goal: Take a system event and notify the right user
type ProcessEvent = SystemEvent -> Result<NotificationSent, NotificationError>
```

## Iteration 2: Splitting Policy vs. Workflow
We realize `ProcessEvent` is too big. We need to separate the **Decision** (Pure) from the **Action** (Impure).

```fsharp
// 1. Policy: purely decide WHAT to do
type RouteEvent = SystemEvent -> UserProfile -> Result<NotificationDecision, InvalidContactError>

// 2. Workflow: Orchestrate the execution
type HandleEvent = SystemEvent -> Effect<NotificationSent, NotificationError>
```

## Iteration 3: Defining the Inputs (The Events)
Now we fill in the types needed for `RouteEvent`.

```fsharp
// Branded Primitives
type UserId = string // Brand<"UserId">
type Temperature = float
type Money = decimal

// The Events (Discriminated Union)
type SystemEvent = 
  | SystemOverheated of { Temp: Temperature; Location: string } // Critical
  | NewLogin of { UserId: UserId; Ip: string }                  // Info
  | PaymentFailed of { UserId: UserId; Amount: Money }          // High
```

## Iteration 4: Defining the Context (User & Rules)
What does `RouteEvent` need from the `UserProfile` to make a decision?

```fsharp
type Channel = SMS | EMAIL | DISCORD

type ContactInfo = {
  Email: EmailAddress
  Phone: PhoneNumber
  DiscordId: string option
}

// The "Context-Specific" User
// We don't need their password or address here.
type UserNotificationProfile = {
  Id: UserId
  Contacts: ContactInfo
  Preferences: {
    CriticalChannel: Channel
    InfoChannel: Channel
    DoNotDisturb: bool
  }
}
```

## Iteration 5: Defining the "Pivot" (The Decision)
This is the output of our Pure Policy (`NotificationDecision`). It instructs the impure shell what to do.

```fsharp
// The Pure Decision
type NotificationDecision = {
  TargetChannel: Channel
  Recipient: string
  MessageBody: string
  RetryPolicy: RetryPolicy // None | Linear | Exponential
}
```
