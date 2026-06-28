# Probe Orchestration Engine

## Identity
* **Name**: Probe Orchestration Engine
* **Architecture Status**: STABLE
* **Owner**: Core Infrastructure

## Purpose
* [REQUIREMENT] Orchestrate deterministic runtime experiments (probes) against the application.
* [REQUIREMENT] Own the complete lifecycle of a probe transaction (Prepare -> Arm -> Execute -> Observe -> Emit -> Cleanup).

## Responsibilities
* [REQUIREMENT] Validate mutation surfaces and generate deterministic probe values.
* [REQUIREMENT] Coordinate with the Runtime Observation Engine to arm observations before interacting.
* [REQUIREMENT] Perform the minimal required interaction (e.g., fill required fields, click submit).
* [REQUIREMENT] Await observation completion and emit canonical `ProbeResult` artifacts.
* [REQUIREMENT] Register expected mutations with the Execution Registry for later cleanup.

## Explicit Non-Responsibilities
* [REQUIREMENT] Must never independently observe network or DOM (owned by Runtime Observation Engine).
* [REQUIREMENT] Must never score evidence or assign confidence.
* [REQUIREMENT] Must never map or correlate observations.
* [REQUIREMENT] Must never generate business data.
* [REQUIREMENT] Must never mutate graphs.
* [REQUIREMENT] Must never execute actual cleanup (only registers it).

## Probe Philosophy
* [DESIGN_DECISION] Every probe must be: Deterministic, Repeatable, Minimal, Observable, and Reversible.

## Probe Invariants
* [DESIGN_DECISION] A probe may never begin unless: Observation has been armed, ProbeSession exists, MutationSurface is valid.
* [DESIGN_DECISION] A probe completes only after: Observation is finalized, ProbeResult is emitted, Cleanup registration is completed.

## Repository Rule
* [DESIGN_DECISION] The Probe Orchestration Engine never performs an isolated click. Every mutating interaction belongs to exactly one `ProbeSession`. Every `ProbeSession` has exactly one `ProbeResult`. Every `ProbeResult` references exactly one `ObservationBundleReference`.

## Inputs
* Canonical `ProbeRequest`
* Canonical `MutationSurface`

## Outputs
* Canonical `ProbeSession`
* Canonical `ProbeExecution`
* Canonical `ProbeResult`
* Canonical `ProbeOutcome`

## Dependencies
* Discovery Engine (provides the topology/surfaces to probe)
* Session Acquisition Engine (provides the authenticated session)
* Runtime Observation Engine (arms and captures observations)

## Consumers
* Evidence Engine (correlates the `ProbeResult` with resulting observations)
* Execution Registry (receives cleanup registrations)

## Public Interfaces
* `executeProbe(request: ProbeRequest): Promise<ProbeResult>`
* `generateDeterministicPayload(surface: MutationSurface): object`

## Internal Components
* Transaction Orchestrator (manages the 6-stage lifecycle)
* Deterministic Payload Generator
* Mechanical Executor (Playwright interaction wrapper)
* Observation Coordinator (interfaces with Runtime Observer)
* Cleanup Registrar

## State
* Idle -> Preparing -> Arming -> Executing -> Observing -> Emitting/Registering -> Completed

## Produced Events
* `ProbeSessionStarted`
* `ObservationArmed`
* `InteractionExecuted`
* `ProbeCompleted`
* `CleanupRegistered`

## Consumed Events
* `SurfaceIdentified`
* `ObservationFinalized`

## Read Models
* None

## Write Models
* None (Writes only ephemeral session events and emits `ProbeResult`)

## Algorithms Used
* Deterministic string/type generation (not AI-driven).
* 6-stage orchestration state machine.

## Failure Modes
* Target element covered by overlay (e.g., cookie banner).
* Form validation strictly rejects deterministic payload.
* Interaction causes unexpected hard navigation breaking the session.
* Runtime Observation Engine fails to finalize.

## Recovery Strategy
* Attempt to dismiss blocking overlays and retry.
* Abort probe and emit `ProbeOutcome` with classification `Blocked` or `Error`.

## Retry Strategy
* 1 immediate retry for transient DOM state issues (e.g., element not attached).

## Performance Constraints
* Mechanical interactions must execute within 5 seconds.
* Observation arming must resolve in < 50ms.

## Security Constraints
* Must only interact with surfaces classified as `PotentialMutation` or `ConfirmedMutation`.

## Configuration
* `PROBE_TIMEOUT_MS`
* `DETERMINISTIC_SEED`

## Testing Strategy
* Integration tests verifying the strict 6-stage ordering using mock observers and registries.

## Observability
* Metrics: Probes executed per minute, ProbeOutcome distribution (Success vs Blocked).
* Trace: Full 6-stage transaction execution time.

## Open Design Decisions
* None

## Future Extension Points
* Advanced chaos engineering / destructive fuzzing.

## Cross References
* `CORE_DATA_MODEL_SPECIFICATION.md`
* `SYSTEM_EXECUTION_FLOW.md`
