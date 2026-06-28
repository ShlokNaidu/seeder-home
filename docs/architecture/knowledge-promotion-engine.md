# Knowledge Promotion Engine

## Identity
* **Name**: Knowledge Promotion Engine
* **Architecture Status**: STABLE
* **Owner**: Knowledge Subsystem

## Purpose
* [REQUIREMENT] Act as the strict trust boundary between the ephemeral Runtime Graph and the permanent Knowledge Graph.
* [REQUIREMENT] Authorize and promote runtime understanding into permanent knowledge.

## Responsibilities
* [REQUIREMENT] Evaluate promotion eligibility based on Runtime Graph maturity.
* [REQUIREMENT] Verify provenance completeness (from Graph Node -> RuntimeFact -> Evidence -> Observation).
* [REQUIREMENT] Check confidence requirements against minimum thresholds.
* [REQUIREMENT] Detect conflicts with existing knowledge in the Knowledge Graph.
* [REQUIREMENT] Detect duplicate knowledge.
* [REQUIREMENT] Handle knowledge versioning mathematically.
* [REQUIREMENT] Produce deterministic `PromotionDecision` artifacts.

## Explicit Non-Responsibilities
* [REQUIREMENT] Must never construct the Runtime Graph.
* [REQUIREMENT] Must never correlate evidence.
* [REQUIREMENT] Must never normalize observations.
* [REQUIREMENT] Must never execute probes.
* [REQUIREMENT] Must never generate business data.
* [REQUIREMENT] Must never mutate the Runtime Graph.

## Promotion Philosophy
* [DESIGN_DECISION] Runtime knowledge is temporary. Knowledge Graph entries are permanent until superseded.
* [DESIGN_DECISION] Promotion is conservative. Absence of sufficient evidence is not evidence of absence.

## Promotion Invariants
* [DESIGN_DECISION] Every promoted knowledge item must have: complete provenance, supporting `RuntimeFacts`, supporting `CorrelatedEvidence`, supporting normalized `Evidence`, and a supporting `Observation` chain.
* [DESIGN_DECISION] No Knowledge Graph node may exist without a complete traceable lineage.

## Conflict Resolution & Transparency
* [DESIGN_DECISION] Promotion decisions must classify outcomes exactly into one of: `NewKnowledge`, `Enrichment`, `VersionUpgrade`, `Duplicate`, `Rejected`, or `Deferred`.
* [DESIGN_DECISION] The engine records every decision. Nothing is silently discarded. Rejections emit a `RejectionRecord`.

## Repository Rule
* [DESIGN_DECISION] **Append-and-Version**: The Knowledge Graph is append-and-version. Never mutate knowledge in place. Never delete promoted knowledge during normal operation. Knowledge evolves through explicit version transitions.

## Inputs
* Canonical `PromotionCandidate`
* Runtime Graph (Read Only)
* Canonical `RuntimeFact`
* Canonical `GraphUpdate`
* Canonical `ConfidenceAssessment`

## Outputs
* Canonical `PromotionDecision`
* Canonical `KnowledgeUpdate`
* Canonical `RejectionRecord`

## Dependencies
* Runtime Knowledge Construction Engine (source of Runtime Graph)

## Consumers
* Knowledge Graph (consumes `KnowledgeUpdate`s)
* Planner (consumes `RejectionRecord`s to inform future probing)

## Public Interfaces
* `evaluateCandidate(candidate: PromotionCandidate): PromotionDecision`
* `commitDecision(decision: PromotionDecision): void`

## Internal Components
* Lineage Validator (enforces the Provenance Invariant)
* Confidence Gatekeeper
* Conflict Detector (Knowledge Diff engine)
* Versioning Strategy Engine (computes next Knowledge Version)

## State
* Idle -> Validating Lineage -> Detecting Conflicts -> Deciding -> Emitting Update/Rejection

## Produced Events
* `PromotionDecisionEmitted`
* `KnowledgeUpdateEmitted`
* `RejectionRecorded`

## Consumed Events
* None (Operates on scheduled or ad-hoc `PromotionCandidate` requests)

## Read Models
* Runtime Graph (Nodes, Edges, Provenance)
* Knowledge Graph (Existing verified state)

## Write Models
* None (Does not directly write to Graph Database; emits `KnowledgeUpdate` events)

## Algorithms Used
* Subgraph Isomorphism (detecting duplicate semantic knowledge).
* Recursive Lineage Traversal (validating deep provenance).

## Failure Modes
* Lineage validation fails due to a missing historical Ephemeral observation.

## Recovery Strategy
* Immediately fail the promotion, emit a `RejectionRecord`, and rely on the Planner to re-probe the surface to regenerate a fresh, contiguous evidence chain.

## Retry Strategy
* Synchronous and idempotent; no internal retries.

## Performance Constraints
* Lineage validation must traverse deep graph links efficiently (max 200ms).

## Security Constraints
* This engine holds the "keys" to the permanent Knowledge Base. It must not accept synthetic manual inputs bypassing the lineage chain.

## Configuration
* `PROMOTION_CONFIDENCE_THRESHOLD` (e.g., 0.95)

## Testing Strategy
* Lineage integration test: Attempt to promote a handcrafted synthetic RuntimeNode lacking an Observation root. Assert engine hard-rejects and emits `RejectionRecord`.

## Observability
* Metrics: Promotion success rate, Rejections by classification.
* Trace: Lineage traversal latency.

## Open Design Decisions
* None

## Future Extension Points
* Human-in-the-loop Manual Review Gate for high-impact knowledge promotion.

## Cross References
* `CORE_DATA_MODEL_SPECIFICATION.md`
* `SYSTEM_EXECUTION_FLOW.md`
