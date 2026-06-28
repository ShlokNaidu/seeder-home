# System Architecture

## Architecture Status
STABLE

## Purpose
* [REQUIREMENT] Define the high-level component interaction and data flow of the autonomous runtime understanding and database seeding platform.

## Subsystem Pipeline (High-Level Architecture)
[DESIGN_DECISION] The system operates as a sequential pipeline of highly decoupled subsystems.

| Subsystem | Primary Responsibility | Primary Output |
| :--- | :--- | :--- |
| **Discovery Engine** | Discovers application routes and interactive elements via browser automation. | Raw DOM & Network observations |
| **Runtime Observer** | Monitors runtime mutations and API interactions. | API Contracts & State Mutations |
| **Probe Engine** | Safely triggers interactions to reveal behaviour. | Correlated network/DOM responses |
| **Evidence Normalization Engine** | Transforms heterogeneous raw observations into canonical evidence records. | Normalized Evidence |
| **Runtime Correlation Engine** | Scores and correlates normalized evidence into hypotheses. | Correlated Evidence |
| **Runtime Knowledge Construction Engine** | Merges contradictory or duplicate evidence. | Verified Evidence |
| **Runtime Graph** | Stores temporary runtime observations and confidence scores. | `RuntimeGraph` Data Model |
| **Knowledge Graph** | Stores long-term verified application understanding. | `KnowledgeGraph` Data Model |
| **Planner** | Builds execution DAG and resolves dependencies (Foreign Keys, Execution Stages). | Execution DAG |
| **AI Provider** | Generates semantic entities and business values independently. | Semantic Values (JSON) |
| **Seeder Engine** | Executes database writes based on Planner DAG. | Seeded Database Records |
| **Execution Registry** | Tracks runtime mutations and inserted records. | Execution Log |
| **Cleanup Engine** | Restores environment to pre-execution state deterministically. | Clean State |

## Core Architectural Invariants
* [DESIGN_DECISION] Every module communicates through explicit interfaces.
* [DESIGN_DECISION] No module may directly depend on another module's internal state.
* [DESIGN_DECISION] Every subsystem must validate its inputs (using Zod).
* [DESIGN_DECISION] The Knowledge Graph is the only subsystem allowed to store permanent knowledge.
* [DESIGN_DECISION] The Runtime Graph must only store temporary observations and confidence scores.

## Pending Design Decisions

### 1. AI Provider Abstraction Interface
* [DESIGN_DECISION_REQUIRED] Explicit contract for the AI Provider abstraction layer.
  * **Reason**: Need to define DTOs, request objects, response objects, and method signatures to ensure Groq is fully decoupled.
  * **Affected Components**: `architecture/llm-generation.md`, `api/contracts.md`
  * **Risks**: Leaky abstraction causing provider lock-in.

### 2. Configuration Layer Implementation
* [DESIGN_DECISION_REQUIRED] Exact mechanism for configuration loading.
  * **Reason**: We know the requirements (URL, Credentials, DB, Prisma), but must define how the configuration layer acquires them (CLI, Env Vars, Config file, etc.).
  * **Affected Components**: `api/configuration.md`
  * **Risks**: Inconsistent startup state if the configuration abstraction is not strictly adhered to.

## Cross References
* [SYSTEM_SPECIFICATION.md](SYSTEM_SPECIFICATION.md)
