# Implementation Roadmap

## Architecture Status
STABLE

## Purpose
* [REQUIREMENT] Define the execution-driven roadmap for implementing the autonomous database seeding platform.
## Repository Rule
* [DESIGN_DECISION] No implementation phase may introduce new architecture. If implementation requires an architectural change: Stop implementation, Create an ADR, Update frozen architecture documents, Freeze the updated architecture, Resume implementation.
* [DESIGN_DECISION] Implementation must follow architecture. Architecture must never emerge from implementation.

## Phase 0: Core Infrastructure & Configuration

### Objective
Establish the foundational Configuration Layer, AI Provider abstraction, Logging, and Event Queue interfaces.

### Prerequisites
`SYSTEM_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`, `api/configuration.md`

### Deliverables
Configuration Loader, AI Provider Interface, Zod validation schemas, BullMQ queue setup, Vitest test suite scaffolding.

### Acceptance Criteria
* System successfully boots with provided inputs
* Invalid configurations immediately halt startup
* AI Provider abstraction successfully mocks an LLM response.

### Non-Goals
* Do not implement actual AI generation
* Do not implement Playwright browser automation.

### Outputs
ConfigurationService, AIProviderContract, Base Event Schemas

### Dependencies
No prior implementation phases.

### Exit Criteria
* Acceptance criteria pass
* Unit tests for configuration edge cases pass
* No open design decisions.
* Consistency check passes.
* No unresolved DESIGN_DECISION_REQUIRED items remain for this phase.

### Risks
Configuration secret leakage; Provider abstraction proving too rigid for future models.

### Validation
Unit tests (Config parsing); Integration tests (Mock Provider).

---

## Phase 1: Discovery & Runtime Observation

### Objective
Implement the Playwright-driven Discovery Engine and Runtime Observer to map basic navigation routes and API contracts.

### Prerequisites
`CORE_DATA_MODEL_SPECIFICATION.md`, `SYSTEM_EXECUTION_FLOW.md`

### Deliverables
Browser Controller, DOM Walker, Network Interceptor, Route Mapper.

### Acceptance Criteria
* Authenticate using supplied credentials
* Map minimum 5 reachable routes
* Intercept minimum 3 unique API requests
* Output valid RuntimeNodes.

### Non-Goals
* Do not interact with or mutate form fields (Probe Engine's responsibility)
* Do not score evidence.

### Outputs
DiscoveryEngine, RuntimeObserver, Route, MutationSurface, RuntimeNode

### Dependencies
Phase 0 (Core Infrastructure).

### Exit Criteria
* Acceptance criteria pass
* E2E discovery against mock SaaS succeeds
* Generates correct RuntimeNodes.
* Consistency check passes.
* No unresolved DESIGN_DECISION_REQUIRED items remain for this phase.

### Risks
Browser crashing on infinite React rerenders; Missing dynamic Shadow DOM elements.

### Validation
E2E verification against a controlled dummy SaaS application.

---

## Phase 2: Probing & Evidence Collection

### Objective
Safely trigger interactions on discovered MutationSurfaces and bundle resulting observations into Evidence.

### Prerequisites
`architecture/probe-engine.md`, `CORE_DATA_MODEL_SPECIFICATION.md`

### Deliverables
Probe Scheduler, Form Filler, DOM/Network Diff Engine, Evidence Correlator.

### Acceptance Criteria
* Successfully submit a form
* Capture the resulting API POST request
* Bundle the DOM response and Network trace into a unified EvidenceBundle.

### Non-Goals
* Do not resolve conflicting evidence
* Do not promote to Knowledge Graph.

### Outputs
ProbeEngine, EvidenceEngine, ActionNode, EvidenceBundle

### Dependencies
Phase 1 (Discovery Engine).

### Exit Criteria
* ActionNodes consistently produce correlated EvidenceBundles
* Error recovery succeeds on unreachable buttons.
* Consistency check passes.
* No unresolved DESIGN_DECISION_REQUIRED items remain for this phase.

### Risks
Accidental deletion of data due to uncontrolled probing; Stale element references in Playwright.

### Validation
Integration tests combining Probe Engine and Runtime Observer.

---

## Phase 3: Graph Fusion & Promotion

### Objective
Implement the Evidence Fusion Engine, Confidence Scoring, and Promotion mechanics to build the permanent Knowledge Graph.

### Prerequisites
`GRAPH_MODEL_SPECIFICATION.md`, `algorithms/evidence-scoring.md`

### Deliverables
Confidence Scorer, Runtime Graph DB adapter, Knowledge Graph DB adapter, Promotion Evaluator.

### Acceptance Criteria
* Fuse duplicate evidence to increase score
* Decay uncorroborated evidence
* Automatically promote a subgraph to EntityNode when threshold crossed.

### Non-Goals
* Do not execute database seeding
* Do not build execution DAGs.

### Outputs
EvidenceFusionEngine, GraphPromoter, KnowledgeNode, KnowledgeEdge

### Dependencies
Phase 2 (Probing & Evidence).

### Exit Criteria
* Nodes successfully transition from Runtime to Knowledge
* Conflicting evidence gracefully lowers score without fatal errors.
* Consistency check passes.
* No unresolved DESIGN_DECISION_REQUIRED items remain for this phase.

### Risks
Graph database schema bottlenecks; Mathematical instability in decay functions causing infinite loops.

### Validation
Unit tests (Scoring math); Integration tests (Graph state transitions).

---

## Phase 4: Planning & Dependency Resolution

### Objective
Traverse the Knowledge Graph to build a deterministic, acyclic execution plan for database seeding.

### Prerequisites
`architecture/planner.md`, `CORE_DATA_MODEL_SPECIFICATION.md`

### Deliverables
Graph Traverser, Dependency Resolver, DAG Builder, Stage Scheduler.

### Acceptance Criteria
* Identify foreign-key dependencies
* Topologically sort tasks
* Output an ExecutionPlan containing at least 2 parallel ExecutionStages.

### Non-Goals
* Do not execute the generated plan
* Do not request data from the AI Provider.

### Outputs
Planner, ExecutionPlan, ExecutionStage, PlannerTask, Dependency

### Dependencies
Phase 3 (Graph Fusion).

### Exit Criteria
* Produces mathematically correct, acyclic DAGs
* Fails gracefully on circular dependencies.
* Consistency check passes.
* No unresolved DESIGN_DECISION_REQUIRED items remain for this phase.

### Risks
Hidden cyclic dependencies in complex business logic stalling the DAG.

### Validation
Benchmarking (DAG generation on 10,000 node mock graph); Unit tests (Cycle detection).

---

## Phase 5: AI Generation & Semantic Seeding

### Objective
Feed PlannerTasks to the AI Provider to generate semantic data, validate it, and execute it against the target.

### Prerequisites
`architecture/llm-generation.md`, `api/contracts.md`

### Deliverables
AI Generation Service, Zod Validator, Seeder Engine, Execution Registry Log.

### Acceptance Criteria
* Produce a valid GenerationResult via Groq
* Insert the GeneratedDataset via the Seeder
* Log the exact primary keys to the ExecutionRecord.

### Non-Goals
* Do not alter the Knowledge Graph
* Do not bypass the ExecutionPlan order.

### Outputs
GenerationService, SeederEngine, ExecutionRegistry, ExecutionRecord

### Dependencies
Phase 0 (AI Provider Interface) and Phase 4 (Planner).

### Exit Criteria
* End-to-end data insertion succeeds
* Generated JSON strictly matches target Schema
* Registry records primary keys.
* Consistency check passes.
* No unresolved DESIGN_DECISION_REQUIRED items remain for this phase.

### Risks
AI hallucinating invalid foreign keys; Rate limiting from LLM provider.

### Validation
E2E Database verification (check if record actually exists in Postgres).

---

## Phase 6: Verification & Cleanup

### Objective
Verify seeded mutations in the UI/DB and implement deterministic environment rollback.

### Prerequisites
`architecture/cleanup-engine.md`, `SYSTEM_EXECUTION_FLOW.md`

### Deliverables
Verification Engine, Dependency-aware Cleanup Engine, Rollback Logger.

### Acceptance Criteria
* Read ExecutionRegistry
* Delete records in reverse dependency order
* Verify application state matches pre-seeding snapshot.

### Non-Goals
* Do not delete data not explicitly logged in the ExecutionRegistry.

### Outputs
CleanupEngine, VerificationEngine, CleanupRecord, RollbackRecord

### Dependencies
Phase 5 (Seeding).

### Exit Criteria
* Cascading deletes succeed without violating DB constraints
* Rollback leaves no orphaned artifacts.
* Consistency check passes.
* No unresolved DESIGN_DECISION_REQUIRED items remain for this phase.

### Risks
Accidental deletion of production data (requires strict environment fencing); Irreversible state mutations.

### Validation
E2E Rollback Testing (Seed 100 rows -> Cleanup -> Verify 0 rows remain).

---

