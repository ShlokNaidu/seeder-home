# Goal Analysis Engine

## Identity
* **Name**: Goal Analysis Engine
* **Architecture Status**: STABLE
* **Owner**: Planning Subsystem

## Purpose
* [REQUIREMENT] Translate a user seeding request into a canonical `GoalSpecification`.

## Responsibilities
* [REQUIREMENT] Parse natural language or structural user inputs.
* [REQUIREMENT] Query the Knowledge Graph to resolve high-level intents against known entities.
* [REQUIREMENT] Validate feasibility of the requested entities based on Knowledge Graph availability.
* [REQUIREMENT] Emit a canonical `GoalSpecification`.

## Explicit Non-Responsibilities
* [REQUIREMENT] Must never resolve entity dependencies (FK).
* [REQUIREMENT] Must never build an execution order.
* [REQUIREMENT] Must never schedule execution.

## Repository Rule
* [DESIGN_DECISION] Planning Layer owns reasoning. Execution Layer owns execution. Scheduling Layer owns concurrency. These responsibilities must never overlap.

## Inputs
* User Request
* Seed Configuration
* Knowledge Graph (Read-Only)

## Outputs
* Canonical `GoalSpecification`

## Dependencies
* Knowledge Graph

## Consumers
* Execution Planner

## Public Interfaces
* `analyzeRequest(request: string): GoalSpecification`

## Internal Components
* Intent Parser
* Entity Resolver
* Feasibility Checker

## State
* Stateless Request/Response

## Produced Events
* `GoalSpecificationGenerated`

## Consumed Events
* None

## Read Models
* Semantic Models (Knowledge Graph)

## Write Models
* None

## Algorithms Used
* Semantic Entity Resolution (mapping user nouns to Knowledge Graph node types).

## Failure Modes
* User requests data for an entity that does not exist in the Knowledge Graph.

## Recovery Strategy
* Immediately reject the request and inform the user that the UI topology for that entity has not yet been discovered/promoted.

## Retry Strategy
* None

## Performance Constraints
* Must resolve a typical request in < 1 second.

## Security Constraints
* Ensure goal constraints do not violate platform guardrails (e.g. attempting to seed destructive actions).

## Configuration
* `MAX_SEED_QUANTITY_LIMIT`

## Testing Strategy
* Unit test: Submit mock user request; verify exact `GoalSpecification` is emitted without DAG/execution timing info.

## Observability
* Metrics: Valid vs Invalid requests, Time to analysis.

## Open Design Decisions
* None

## Future Extension Points
* Complex LLM-based goal inference.

## Cross References
* `CORE_DATA_MODEL_SPECIFICATION.md`
