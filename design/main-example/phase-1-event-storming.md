# Design: Main Example - Smart Notification System

**Goal:** Demonstrate the full "Onion" architecture with `Registries`, `Policies`, complex routing, and retries.

## Phase 1: Event Storming (The Flow)

### 1. The Trigger (The Input Stream)
We are simulating a "Kafka Consumer" that receives raw system events.
*   **Incoming Events:**
    *   `SystemOverheated` (Severity: Critical)
    *   `NewLogin` (Severity: Info)
    *   `PaymentFailed` (Severity: High)

### 2. The Process (The "Smart" Logic)
We don't just send blindly. We must decide *how* to send based on context.
*   **Inputs:** `Event` + `UserPreferences`.
*   **The Decision (Policy):**
    *   *Rule:* Critical events MUST go to SMS (unless DND is on, then call fallback).
    *   *Rule:* Info events go to Discord.
    *   *Rule:* If Discord is down, fallback to Email.

### 3. The Output (The Side Effects)
*   **Command:** `SendMessage(channel, content)`
*   **Registry:** Maps `channel` ('SMS' | 'DISCORD' | 'EMAIL') to the correct Service implementation.

### 4. Failure Handling (Retries)
*   **Requirement:**
    *   Critical events: Retry 3 times with exponential backoff.
    *   Info events: No retry (fire and forget).

### 5. Dependency Graph
`Kafka Event` -> `User Lookup` -> **`Routing Policy`** -> `Registry Selection` -> `Service Execution`

*Note: This highlights the power of the architecture. The "Routing Policy" is pure logic. The "Registry" handles the wiring. The "Workflow" ties them together.*
