# Execution Planner

## Identity
* **Name**: Execution Planner
* **Architecture Status**: STABLE
* **Owner**: Planning Subsystem

## Purpose
* [REQUIREMENT] Transform a `GoalSpecification` into a dependency-correct `ExecutionPlan`.

## Responsibilities
* [REQUIREMENT] Select target entities required by the goal.
* [REQUIREMENT] Select corresponding workflows from the Knowledge Graph to produce the entities.
* [REQUIREMENT] Resolve Foreign Key (FK) dependencies and structural requirements.
* [REQUIREMENT] Propagate constraints across the required entity chain.
* [REQUIREMENT] Construct a strict Directed Acyclic Graph (DAG) for execution ordering.

## Explicit Non-Responsibilities
* [REQUIREMENT] Must never generate business values.
* [REQUIREMENT] Must never schedule workers or compute concurrency.
* [REQUIREMENT] Must never execute anything against the target application.

## Repository Rule
* [DESIGN_DECISION] Planning Layer owns reasoning. Execution Layer owns execution. Scheduling Layer owns concurrency. These responsibilities must never overlap.

## Inputs
* Canonical `GoalSpecification`
* Knowledge Graph (Read-Only)

## Outputs
* Canonical `ExecutionPlan`

## Dependencies
* Goal Analysis Engine
* Knowledge Graph

## Consumers
* Execution Scheduler

## Public Interfaces
* `createPlan(goal: GoalSpecification): ExecutionPlan`

## Internal Components
* Entity Dependency Resolver
* Workflow Selector
* Constraint Propagator
* DAG Builder

## State
* Stateless Request/Response

## Produced Events
* `ExecutionPlanCreated`

## Consumed Events
* `GoalSpecificationGenerated`

## Read Models
* Semantic Models (Knowledge Graph)

## Write Models
* None

## Algorithms Used
* Topological Sorting (DAG construction).
* Dependency constraint satisfaction.

## Failure Modes
* Circular dependency detected in Knowledge Graph for required entities.

## Recovery Strategy
* Fail plan generation and flag the Knowledge Graph definitions as flawed for human/AI review.

## Retry Strategy
* None (planning is deterministic).

## Performance Constraints
* DAG construction must resolve in < 5 seconds for complex schema chains.

## Security Constraints
* N/A

## Configuration
* `MAX_DAG_DEPTH`

## Testing Strategy
* Graph algorithm unit tests: Provide mock `GoalSpecification` and `Knowledge Graph` state, assert resulting DAG is valid and topologically sorted.

## Observability
* Metrics: Average DAG depth, Planning latency.

## Open Design Decisions
* None

## Future Extension Points
* N/A

## Cross References
* `CORE_DATA_MODEL_SPECIFICATION.md`
