# Execution Scheduler

## Identity
* **Name**: Execution Scheduler
* **Architecture Status**: STABLE
* **Owner**: Planning Subsystem

## Purpose
* [REQUIREMENT] Transform a dependency-correct `ExecutionPlan` into executable stages.

## Responsibilities
* [REQUIREMENT] Determine execution parallelization.
* [REQUIREMENT] Partition the DAG into `ExecutionStage`s.
* [REQUIREMENT] Define `RetryPlan` policies for stages.
* [REQUIREMENT] Maintain resume checkpoints for crash recovery.
* [REQUIREMENT] Manage queue ordering and worker allocation.

## Explicit Non-Responsibilities
* [REQUIREMENT] Must never query LLMs.
* [REQUIREMENT] Must never inspect the Runtime Graph.
* [REQUIREMENT] Must never build dependency graphs or infer entity relationships.

## Repository Rule
* [DESIGN_DECISION] Planning Layer owns reasoning. Execution Layer owns execution. Scheduling Layer owns concurrency. These responsibilities must never overlap.

## Inputs
* Canonical `ExecutionPlan`

## Outputs
* Canonical `ExecutionSchedule`
* Canonical `ExecutionStage`
* Canonical `RetryPlan`

## Dependencies
* Execution Planner

## Consumers
* Task Workers (Execution Engine layer)

## Public Interfaces
* `schedulePlan(plan: ExecutionPlan): ExecutionSchedule`
* `reportStageStatus(stageId: string, status: string): void`

## Internal Components
* Parallelization Partitioner
* Stage Queuer
* Checkpoint Manager
* Retry Policy Assessor

## State
* Managing active `ExecutionSchedule`s and `ExecutionStage` states.

## Produced Events
* `ScheduleCreated`
* `StageEnqueued`
* `StageCompleted`

## Consumed Events
* `ExecutionPlanCreated`

## Read Models
* None (Relies entirely on canonical DAG in ExecutionPlan)

## Write Models
* None (Maintains transient state)

## Algorithms Used
* Queue partitioning (mapping topological depth layers to parallel execution pools).

## Failure Modes
* Worker crashes mid-stage.
* Entire stage fails repeatedly.

## Recovery Strategy
* Implement checkpointing. Automatically re-queue failed stages according to `RetryPlan`. If max retries hit, halt execution and flag the schedule as Failed.

## Retry Strategy
* Defined individually per `ExecutionStage` via `RetryPlan`.

## Performance Constraints
* Must dispatch stages to workers with < 10ms overhead.

## Security Constraints
* Must not leak scheduling metadata to target applications.

## Configuration
* `MAX_CONCURRENCY_WORKERS`

## Testing Strategy
* Concurrency simulation: Provide a deeply nested DAG, assert that the scheduler accurately partitions stages into parallel buckets without violating dependencies.

## Observability
* Metrics: Active stages, Schedule completion rate, Retry invocation count.

## Open Design Decisions
* None

## Future Extension Points
* Dynamic worker auto-scaling integration.

## Cross References
* `CORE_DATA_MODEL_SPECIFICATION.md`
