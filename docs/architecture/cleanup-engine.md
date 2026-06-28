# Cleanup Engine

## Identity
* **Name**: Cleanup Engine
* **Architecture Status**: STABLE
* **Owner**: Execution Subsystem

## Purpose
* [REQUIREMENT] Restore the application to a deterministic state by orchestrating dependency-aware rollbacks.

## Responsibilities
* [REQUIREMENT] Perform dependency-aware rollback.
* [REQUIREMENT] Delete probe artifacts.
* [REQUIREMENT] Verify cleanup success.
* [REQUIREMENT] Restore deterministic state.

## Explicit Non-Responsibilities
* [REQUIREMENT] Must never generate execution plans.
* [REQUIREMENT] Must never mutate Knowledge Graph.
* [REQUIREMENT] Must never interpret observations.

## Inputs
* Rollback manifest from Execution Registry

## Outputs
* Cleanup Status

## Dependencies
* Execution Registry
* API/Database client for mutation

## Consumers
* Execution Scheduler

## Public Interfaces
* `executeRollback(sessionId: string): Promise<boolean>`

## Internal Components
* Dependency Graph Reverser
* Deletion Executor
* State Verifier

## State
* Idle -> Reversing -> Deleting -> Verifying -> Completed

## Produced Events
* `CleanupCompleted`
* `CleanupFailed`

## Consumed Events
* None (Invoked via schedule/command)

## Read Models
* Execution Registry Log

## Write Models
* None (Directly mutates target application state)

## Algorithms Used
* Reverse topological sort of dependencies for safe deletion.

## Failure Modes
* Target application prevents deletion due to external FK constraints.

## Recovery Strategy
* Flag entity as orphaned and notify admin for manual intervention.

## Retry Strategy
* Retry deletion on transient errors.

## Performance Constraints
* Cleanup must be reasonably fast but prioritizes safety over speed.

## Security Constraints
* Needs administrative privileges on target.

## Configuration
* `CLEANUP_STRATEGY` (Soft vs Hard delete)

## Testing Strategy
* End-to-end: Seed complex data, invoke cleanup, assert database returns to exact pre-seed state.

## Observability
* Metrics: Successful cleanups, Orphaned records.

## Open Design Decisions
* None

## Future Extension Points
* N/A

## Cross References
* `execution-registry.md`
