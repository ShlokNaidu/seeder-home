# Evidence Normalization Engine

## Identity
* **Name**: Evidence Normalization Engine
* **Architecture Status**: STABLE
* **Owner**: Evidence Subsystem

## Purpose
* [REQUIREMENT] Transform heterogeneous runtime observations into canonical `Evidence` records, providing a strict boundary between raw observation and intelligence.

## Responsibilities
* [REQUIREMENT] Normalize observation formats (e.g. standardizing JSON network payloads, formatting DOM diffs).
* [REQUIREMENT] Preserve observation provenance, timestamps, source, and ordering.
* [REQUIREMENT] Remove transport-specific or platform-specific details.
* [REQUIREMENT] Attach `ProbeSession` references if the observation was part of an armed probe.
* [REQUIREMENT] Attach `ObservationBundle` references to group contiguous events.

## Explicit Non-Responsibilities
* [REQUIREMENT] Must never score confidence.
* [REQUIREMENT] Must never correlate evidence.
* [REQUIREMENT] Must never detect mappings.
* [REQUIREMENT] Must never promote knowledge.
* [REQUIREMENT] Must never update graphs.
* [REQUIREMENT] Must never interpret business meaning.

## Architectural Rule
* [DESIGN_DECISION] The Evidence Engine must never consume raw observations. It consumes only normalized `Evidence`. The Runtime Observation Engine must never emit `Evidence`. It emits only `Observation` artifacts. The normalization boundary is mandatory.

## Repository Rule
* [DESIGN_DECISION] Adding a new observation source must require changes only to the Runtime Observation Engine and the Evidence Normalization Engine. No downstream subsystem should change when a new observation source is introduced.

## Inputs
* Canonical `DOMObservation`
* Canonical `NetworkObservation`
* Canonical `RuntimeObservation`
* Canonical `AccessibilityObservation`
* Canonical `StorageObservation`
* Canonical `DatabaseObservationReference`
* Canonical `VisualObservation`

## Outputs
* Canonical `Evidence`

## Dependencies
* Runtime Observation Engine

## Consumers
* Evidence Engine

## Public Interfaces
* `normalize(observation: RuntimeNode): Evidence`

## Internal Components
* Provenance Tracker
* Payload Normalizer (Source-specific adapters)
* Reference Binder (ProbeSession/ObservationBundle links)

## State
* Idle -> Normalizing -> Emitting

## Produced Events
* `EvidenceNormalized`

## Consumed Events
* `ObservationCaptured`

## Read Models
* None

## Write Models
* None

## Algorithms Used
* Source-specific adapter transforms.

## Failure Modes
* Observation payload fundamentally corrupted or missing critical metadata.

## Recovery Strategy
* Discard malformed observation and log a parsing error warning. Do not halt execution.

## Retry Strategy
* None (normalization is idempotent).

## Performance Constraints
* Must normalize observations in < 2ms per event to prevent event loop blocking.

## Security Constraints
* Ensure obfuscated data from observations remains obfuscated in the Evidence payload.

## Configuration
* `DROP_MALFORMED_OBSERVATIONS`

## Testing Strategy
* Unit tests for each source adapter ensuring output precisely matches Canonical `Evidence` schema.

## Observability
* Metrics: Normalization success rate, Events normalized per second.
* Trace: Source to normalization latency.

## Open Design Decisions
* None

## Future Extension Points
* Adding support for HAR trace parsing adapters.

## Cross References
* `CORE_DATA_MODEL_SPECIFICATION.md`
* `SYSTEM_EXECUTION_FLOW.md`
