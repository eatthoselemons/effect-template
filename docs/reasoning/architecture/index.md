# Architecture Reasoning

This folder contains deep-dive explanations for the architectural decisions made in this template. 
We believe that understanding *why* a decision was made is as important as knowing *what* the decision is.

## Contents

- [Layers & Granularity](layers-granularity.md): Why we use N-layers instead of 3-layers, and the role of each.
- [Pure Logic vs Orchestration](pure-logic.md): The separation of Policies (Decisions) from Workflows (Mechanics).
- [Service Strategy](service-strategy.md): Why we separate Domain Interfaces from Platform Implementations, and when to use Registries.
- [Composition over Events](composition.md): Why we prefer direct function composition over internal event buses for core logic.
