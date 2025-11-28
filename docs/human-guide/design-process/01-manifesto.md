# 1. The Design Manifesto

This is **Functional Domain Modeling** — the human-friendly name for **Type-Driven Functional Domain-Driven Design (TDFDDD)**.

## The Core Philosophy
**"Make Illegal States Unrepresentable."**

We do not write code to *check* if data is valid. We design types so that *invalid data cannot exist*.

## Wisdom

**The "Bottom-Up" Heuristic:**
> "Let the Workflow dictate the State."

**Why it feels "Hard to do domain modeling correctly first":**
If you try to model the domain *before* knowing the workflow, you are **guessing**. You will likely model data you don't need (YAGNI), or model it in a shape that is annoying to use.

It is perfectly fine—and often better—to sketch the function signature with "Fake Types" first (`NeededStuff -> Result`), list out what `NeededStuff` actually is, and *then* formalize the Domain Models.

This is actually how most functional programmers work. We write the function, see what arguments we are missing, define the type for them, and repeat.

## Architecture: Pure Core, Impure Shell

We strictly separate **Design** (High Inference/Intelligence) from **Implementation** (Mechanical Assembly).

*   **Core (Policy):** Pure logic. Makes decisions based on input. Returns Events/Decisions. No side effects.
*   **Shell (Workflow):** Impure orchestration. Gathers data, calls the core, saves results.

**The Pivot Point:**
The transition from "Design" to "Implementation" is where you switch languages.
*   **Design Phase (Artifact):** Use F# / Pseudo-code. It is succinct, high-level, and readable by experts.
*   **Implementation Phase (Code):** Use TypeScript / Effect. This is where the rubber meets the road.
