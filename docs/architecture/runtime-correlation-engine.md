# Runtime Correlation Engine

## Identity
* **Name**: Runtime Correlation Engine
* **Architecture Status**: STABLE
* **Owner**: Intelligence Subsystem

## Purpose
* [REQUIREMENT] Correlate normalized evidence into coherent runtime facts and assign confidence scores based on provenance.

## Responsibilities
* [REQUIREMENT] Correlate canonical `Evidence` across multiple domains (e.g., DOM ↔ Network, Network ↔ Database, Probe ↔ Observation).
* [REQUIREMENT] Produce canonical correlation artifacts (`CorrelatedEvidence`, `MappingCandidate`).
* [REQUIREMENT] Calculate `ConfidenceAssessment` purely as a property of a generated `RuntimeFact`.
* [REQUIREMENT] Ensure every `RuntimeFact` maintains a traceable provenance chain back to the original runtime observations.

## Explicit Non-Responsibilities
* [REQUIREMENT] Must never promote knowledge to the Knowledge Graph.
* [REQUIREMENT] Must never update the Runtime Graph.
* [REQUIREMENT] Must never update the Knowledge Graph.
* [REQUIREMENT] Must never generate business semantics.
* [REQUIREMENT] Must never execute probes.
* [REQUIREMENT] Must never normalize observations (consumes strictly normalized `Evidence`).

## Architectural Pipeline
* [DESIGN_DECISION] Observation -> Normalization -> Correlation -> Runtime Facts -> Evidence Fusion -> Runtime Graph.

## Repository Rule
* [DESIGN_DECISION] Every `RuntimeFact` must be backed by one or more `CorrelatedEvidence` records.
* [DESIGN_DECISION] Every `CorrelatedEvidence` record must preserve provenance back to the original observations. No `RuntimeFact` may exist without a traceable evidence chain.

## Inputs
* Canonical `Evidence` (Normalized)
* Canonical `ProbeResult`
* Canonical `ProbeOutcome`

## Outputs
* Canonical `CorrelatedEvidence`
* Canonical `MappingCandidate`
* Canonical `RuntimeFact`
* Canonical `ConfidenceAssessment`

## Dependencies
* Evidence Normalization Engine
* Probe Orchestration Engine

## Consumers
* Evidence Fusion Engine

## Public Interfaces
* `correlate(evidenceStream: Evidence[]): Promise<RuntimeFact[]>`

## Internal Components
* Cross-Domain Correlator (DOM/Network/DB linker)
* Mapping Extractor
* Fact Synthesizer
* Confidence Assessor

## State
* Idle -> Correlating -> Synthesizing -> Assessing -> Emitting

## Produced Events
* `FactsCorrelated`
* `ConfidenceAssessed`

## Consumed Events
* `EvidenceNormalized`
* `ProbeCompleted`

## Read Models
* None

## Write Models
* None (Does not mutate canonical graphs; outputs streams to Fusion Engine)

## Algorithms Used
* See `algorithms/evidence-scoring.md` (Defines confidence variance decay).
* Temporal/Topological Correlation heuristics.

## Failure Modes
* Cannot link Network response to DOM mutation due to async delays.

## Recovery Strategy
* Buffer unmatched `Evidence` in a sliding temporal window until a match is found or window expires.

## Retry Strategy
* Internal calculations are synchronous and stateless per buffer.

## Performance Constraints
* Must correlate events within a 1000ms sliding temporal window.

## Security Constraints
* Ensure provenance pointers do not leak sensitive payloads into log tags.

## Configuration
* `TEMPORAL_CORRELATION_WINDOW_MS`

## Testing Strategy
* Mathematical and topological unit testing: Supply a fixed stream of mock normalized `Evidence` from diverse domains and assert the final `RuntimeFact` matches expected algorithmic output.

## Observability
* Metrics: Average confidence score generated, Correlation success rate.
* Trace: Correlation buffer latency.

## Open Design Decisions
* None

## Future Extension Points
* Machine Learning based temporal evidence correlation.

## Cross References
* `CORE_DATA_MODEL_SPECIFICATION.md`
* `SYSTEM_EXECUTION_FLOW.md`
