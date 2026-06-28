# Seeding Engine

## Identity
* **Name**: Seeding Engine
* **Architecture Status**: STABLE
* **Owner**: Execution Subsystem

## Purpose
* [REQUIREMENT] Execute the execution schedule by inserting generated datasets and resolving deterministic FK assignments.

## Responsibilities
* [REQUIREMENT] Execute `ExecutionSchedule`.
* [REQUIREMENT] Insert `GeneratedDataset`.
* [REQUIREMENT] Resolve deterministic FK assignments.
* [REQUIREMENT] Execute database writes.
* [REQUIREMENT] Execute UI fallback when required.
* [REQUIREMENT] Register mutations with Execution Registry.

## Explicit Non-Responsibilities
* [REQUIREMENT] Must never generate semantics.
* [REQUIREMENT] Must never query LLM.
* [REQUIREMENT] Must never modify Runtime Graph.
* [REQUIREMENT] Must never build ExecutionPlans.

## Inputs
* Canonical `ExecutionSchedule`
* Canonical `GeneratedDataset`

## Outputs
* Seeded Data (in target application)
* Execution Results

## Dependencies
* Execution Registry
* Dataset Materialization Engine

## Consumers
* System user

## Public Interfaces
* `executeStage(stage: ExecutionStage): Promise<void>`

## Internal Components
* DB Writer
* UI Fallback Executor
* FK Resolver

## State
* Idle -> Executing -> Registering -> Completed

## Produced Events
* `StageCompleted`
* `StageFailed`

## Consumed Events
* `StageEnqueued`

## Read Models
* None

## Write Models
* Target application Database/UI

## Algorithms Used
* Deterministic ID mapping (mapping canonical IDs to target database IDs).

## Failure Modes
* Database write fails due to constraint violation.

## Recovery Strategy
* Fallback to UI execution if configured; otherwise fail stage and trigger `RetryPlan`.

## Retry Strategy
* Managed by Execution Scheduler.

## Performance Constraints
* High throughput database batch insertion.

## Security Constraints
* Requires direct database credentials or API keys.

## Configuration
* `PREFER_DB_WRITES`

## Testing Strategy
* Integration test: Execute a stage, verify data appears in target and is logged in Execution Registry.

## Observability
* Metrics: Rows seeded per second, Fallback trigger rate.

## Open Design Decisions
* None

## Future Extension Points
* N/A

## Cross References
* `dataset-materialization-engine.md`
