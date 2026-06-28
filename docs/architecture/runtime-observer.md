# Runtime Observation Engine

## Identity
* **Name**: Runtime Observation Engine
* **Architecture Status**: STABLE
* **Owner**: Core Infrastructure

## Purpose
* [REQUIREMENT] Passively monitor, intercept, and record all observable artifacts produced during runtime execution, regardless of source.

## Responsibilities
* [REQUIREMENT] **Browser**: Monitor DOM mutations, URL transitions, navigation events, history changes, browser storage, and cookies.
* [REQUIREMENT] **Network**: Monitor requests, responses, headers, timing, redirects, and failures.
* [REQUIREMENT] **Runtime**: Monitor console output, JavaScript errors, unhandled exceptions, and performance timings.
* [REQUIREMENT] **Accessibility**: Monitor the accessibility tree, accessible names, roles, and labels.
* [REQUIREMENT] **Database**: Capture snapshot identifiers and diff references (observation only, no writes, no comparisons).
* [REQUIREMENT] **Visual**: Capture screenshots and vision observations (optional, when configured).

## Architectural Rule
* [DESIGN_DECISION] **Observation is lossless**. The Runtime Observation Engine should preserve raw observations whenever practical. Normalization and reduction occur later in the pipeline.

## Repository Rule
* [DESIGN_DECISION] **Source-agnostic Observation**. Adding a new observation source must require only extending the Runtime Observation Engine, without changing downstream architectural responsibilities. Downstream systems depend on generic `Observation` artifacts.

## Explicit Non-Responsibilities
* [REQUIREMENT] Must never score evidence.
* [REQUIREMENT] Must never assign confidence.
* [REQUIREMENT] Must never correlate observations.
* [REQUIREMENT] Must never resolve mappings.
* [REQUIREMENT] Must never promote knowledge.
* [REQUIREMENT] Must never generate business data.
* [REQUIREMENT] Must never mutate graphs.

## Inputs
* Canonical `Route`
* Canonical `ReadSurface`
* Canonical `UIState`

## Outputs
* Canonical `DOMObservation`
* Canonical `NetworkObservation`
* Canonical `RuntimeObservation`
* Canonical `StorageObservation`
* Canonical `AccessibilityObservation`
* Canonical `DatabaseObservationReference`
* Canonical `VisualObservation`
* Canonical `RuntimeSnapshot`

## Dependencies
* Discovery Engine (provides context of what is currently on screen)
* Probe Engine (triggers the mutations being observed)

## Consumers
* Evidence Engine (consumes raw observations for scoring and correlation)

## Public Interfaces
* `startObservation(session: AuthenticatedBrowserSession): void`
* `stopObservation(): RuntimeSnapshot`
* `flushObservations(): void`

## Internal Components
* Network Interceptor
* DOM Mutation Observer
* Console/Error Observer
* A11y Tree Observer
* Storage Observer
* Database Reference Logger
* Visual Capture Module

## State
* Idle -> Observing -> Snapshotting -> Idle

## Produced Events
* `ObservationCaptured`
* `SnapshotGenerated`

## Consumed Events
* `TopologyDiscovered`
* `SurfaceIdentified`
* `ProbeCompleted`

## Read Models
* None

## Write Models
* None (Writes directly to ephemeral event streams / Runtime Graph storage API)

## Algorithms Used
* Schema-agnostic serialization (preserves exact payload structures without casting).

## Failure Modes
* Observers detached due to hard page reload.
* Memory leak on highly dynamic pages emitting 10k+ DOM mutations per second.
* Payload too large to serialize (e.g., video stream intercepted).

## Recovery Strategy
* Reattach observers automatically on page `load` event.
* Truncate oversized payload logs and flag as `TRUNCATED` rather than dropping completely.

## Retry Strategy
* N/A (passive observation cannot retry the target's actions).

## Performance Constraints
* Must not impact target application rendering performance (DOM observer must run async).
* Network intercept must add < 5ms latency to requests.

## Security Constraints
* Must securely scrub/obfuscate PII and auth tokens from intercepted payloads before logging.

## Configuration
* `OBSERVATION_TIMEOUT_MS`
* `MAX_PAYLOAD_SIZE_BYTES`
* `VISUAL_OBSERVATION_ENABLED`

## Testing Strategy
* Integration test using Playwright against a dummy app emitting chaotic network requests, console errors, and DOM changes.

## Observability
* Metrics: Observations captured per second (by type).
* Trace: Interception latency overhead.

## Open Design Decisions
* None

## Future Extension Points
* WebSocket traffic interception.
* WebGL/Canvas state inference.
* HAR (HTTP Archive) trace file ingestion.

## Cross References
* `CORE_DATA_MODEL_SPECIFICATION.md` (Observation Models)
* `SYSTEM_EXECUTION_FLOW.md`
