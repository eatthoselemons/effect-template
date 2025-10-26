# effect-template
This is a template for making effect applications, with documentation meant for llm ingest/instructions

## Design Overview
### Books
This is a project template that is based on Scott Wlaschin's "*Domain Modeling Made Functional*". It also uses some of the ideas from Eric Normand's "*Grokking Simplicity*".

### General Ideas
The project is focused on allowing you to do domain driven design with a pre-planned layout for following the pipeline style that Wlaschin describes in his book. Both Wlaschin and Normand talk about separating your project into several parts. As Normand puts it there are "Data, Calculations, and Actions".

- Data: The actual data, like `5`, `value`, `<object>`
- Calculations: Pure functions that have no side effects
- Actions: Functions that change the world, they take "action", like writing to the database

Wlaschin describes similar things in his book. He talks about the idea of an onion, you do data validation on the outermost layer and get more functional as you go deeper in the program. Then at the center there are pipelines that contain your actual business logic

### Typescript's Effect
This project uses `Effect` for its improvement of the standard library, functional features, `ZIO` type system, and relies heavily on the `services`/`layers` components. Because the services and layers provide such an easy way to separate your application into composable pieces the project is laid out in the onion fashion Normand and Wlaschin talk about

### Layers
There are several pre-defined layers in this architecture:

- Business Logic
  - Workflows: Orchestrates the checks and policies. This is where you put the process. ie checkout process
  - Check: A small, context-light predicate that answers a domain question with yes/no. It operates on one concept or a small cluster and doesn’t usually need to explain itself.
  - Policy: A business decision rule. It composes checks, considers context (time, role, configuration, jurisdiction), and returns a reasoned decision (not just true/false). 
- System
  - Domain Layers: These are the abstractions of systems. This layer contains functions like `findNodeById()` that calls the `PersistanceService`
  - Platform Layers: These are the actual calls out to systems. You would have things like a `Neo4j.service`
  - Domain Types: Various data types, avoiding "primitive obsession" as Normand calls it

## Project Structure
There are several levels of rules:
1. Core Rules
2. One Line Examples
3. Detailed Examples

The project is then in a file structure:

```
docs/
├── core-rules/
│   ├── core.md
│   ├── level-1/
│   └── level-2/
├── framework/
│   └── effect/
│       ├── <topic>/
│       │   ├── level-1/
│       │   └── level-2/
│       └── checklists/
│           └── <split into 20 item chunks>
├── project-structure/
│   ├── overview.md
│   ├── directory-layout.md
│   └── conventions.md
└── template-details/
    ├── rule-examples.md
    └── considerations.md
```

For detailed examples of each rule level, see [docs/template-details/rule-examples.md](docs/template-details/rule-examples.md).