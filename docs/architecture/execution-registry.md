# Execution Registry

## Identity
* **Name**: Execution Registry
* **Architecture Status**: STABLE
* **Owner**: Execution Subsystem

## Purpose
* [REQUIREMENT] Provide deterministic execution history by tracking every mutation, created record, updated record, deleted record, and probe session.

## Responsibilities
* [REQUIREMENT] Track every mutation.
* [REQUIREMENT] Track created records.
* [REQUIREMENT] Track updated records.
* [REQUIREMENT] Track deleted records.
* [REQUIREMENT] Track `ProbeSession`s.
* [REQUIREMENT] Track rollback information.
* [REQUIREMENT] Provide deterministic execution history.

## Explicit Non-Responsibilities
* [REQUIREMENT] Must never execute cleanup.
* [REQUIREMENT] Must never plan execution.
* [REQUIREMENT] Must never generate business values.
* [REQUIREMENT] Must never modify Knowledge Graph.

## Inputs
* Canonical `ProbeExecution`
* Canonical `GeneratedDataset` records
* Mutation events

## Outputs
* Canonical Execution Log
* Rollback manifest

## Dependencies
* Storage (Database)

## Consumers
* Cleanup Engine

## Public Interfaces
* `registerMutation(mutation: object): void`
* `getRollbackManifest(sessionId: string): object`

## Internal Components
* Mutation Tracker
* Manifest Builder

## State
* Passive Recorder

## Produced Events
* `MutationRegistered`

## Consumed Events
* `ProbeCompleted`
* `DatasetMaterialized`

## Read Models
* None

## Write Models
* Execution Log

## Algorithms Used
* Sequential event appending.

## Failure Modes
* Storage failure.

## Recovery Strategy
* Halt system execution until registry is restored to prevent untracked mutations.

## Retry Strategy
* Strict internal retries on storage layer.

## Performance Constraints
* Must log mutations synchronously without bottlenecking execution.

## Security Constraints
* Must secure mutation logs against unauthorized tampering.

## Configuration
* `RETENTION_POLICY`

## Testing Strategy
* Integration test: Execute mock seeding, assert all entities are accurately logged for rollback.

## Observability
* Metrics: Registrations per second.

## Open Design Decisions
* None

## Future Extension Points
* Distributed transaction logging.

## Cross References
* `CORE_DATA_MODEL_SPECIFICATION.md`
