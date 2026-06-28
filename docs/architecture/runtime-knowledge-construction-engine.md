# Runtime Knowledge Construction Engine

## Identity
* **Name**: Runtime Knowledge Construction Engine
* **Architecture Status**: STABLE
* **Owner**: Intelligence Subsystem

## Purpose
* [REQUIREMENT] Construct and incrementally enrich the Runtime Graph from correlated runtime facts.

## Responsibilities
* [REQUIREMENT] Create new graph nodes (`RuntimeNode`).
* [REQUIREMENT] Create new graph edges (`RuntimeEdge`).
* [REQUIREMENT] Enrich existing nodes and edges without duplicating them.
* [REQUIREMENT] Merge duplicate discoveries.
* [REQUIREMENT] Track graph evolution via deterministic `GraphUpdate` events.
* [REQUIREMENT] Preserve provenance references and confidence lineage.

## Explicit Non-Responsibilities
* [REQUIREMENT] Must never promote knowledge to the Knowledge Graph.
* [REQUIREMENT] Must never score confidence.
* [REQUIREMENT] Must never correlate evidence.
* [REQUIREMENT] Must never execute probes.
* [REQUIREMENT] Must never generate business semantics.
* [REQUIREMENT] Must never query LLMs.

## Graph Construction Philosophy
* [DESIGN_DECISION] Graph construction is **incremental**. The engine never rebuilds the graph from scratch. Each `ProbeSession` contributes only incremental knowledge. Repeated probes increase graph completeness.

## Graph Merge Rules
* [DESIGN_DECISION] If an entity already exists: Enrich it. Never duplicate it.
* [DESIGN_DECISION] If a relationship already exists: Strengthen it. Update provenance. Update confidence.
* [DESIGN_DECISION] Never overwrite historical evidence.

## Runtime Graph Invariants
* [DESIGN_DECISION] Every `RuntimeNode` must reference at least one `RuntimeFact`.
* [DESIGN_DECISION] Every `RuntimeEdge` must reference at least one `RuntimeFact`.
* [DESIGN_DECISION] Every `GraphUpdate` must preserve: provenance, timestamps, originating `ProbeSession`.

## Repository Rule
* [DESIGN_DECISION] The Runtime Graph is **append-and-enrich**. Never destroy previously verified runtime knowledge during discovery. Knowledge accumulates over time. Graph mutations must be deterministic and replayable.

## Inputs
* Canonical `RuntimeFact`
* Canonical `CorrelatedEvidence`
* Existing Runtime Graph State

## Outputs
* Canonical `RuntimeNode`
* Canonical `RuntimeEdge`
* Canonical `GraphUpdate`
* Canonical `GraphSnapshot`

## Dependencies
* Runtime Correlation Engine

## Consumers
* Knowledge Graph Promoters

## Public Interfaces
* `applyFacts(facts: RuntimeFact[]): GraphUpdate[]`
* `reconstructGraph(updates: GraphUpdate[]): GraphSnapshot`

## Internal Components
* Fact Decoder
* Node Resolver (Duplicate Detection)
* Edge Synthesizer
* Update Committer (Event Sourcing Manager)

## State
* Idle -> Resolving -> Enriching -> Emitting

## Produced Events
* `GraphUpdateEmitted`

## Consumed Events
* `FactsCorrelated`

## Read Models
* `RuntimeNode`
* `RuntimeEdge`

## Write Models
* `GraphUpdate` (Event Log)
* `RuntimeNode` (Materialized View)
* `RuntimeEdge` (Materialized View)

## Algorithms Used
* Deterministic Node Identity resolution (hashing UI locators + structural context).
* Event Sourcing projection replay.

## Failure Modes
* Race condition between simultaneous facts trying to create the same entity.

## Recovery Strategy
* Implement strict optimistic concurrency control on the graph storage layer. If a commit fails due to a concurrent write, re-resolve the target node and apply as an enrichment rather than a creation.

## Retry Strategy
* Retry up to 3 times on concurrency conflicts.

## Performance Constraints
* Must apply a batch of facts and emit updates in < 50ms to ensure real-time graph consistency.

## Security Constraints
* Graph updates must be sanitized before materialization to prevent injection attacks if graph queries are executed against it.

## Configuration
* `MERGE_THRESHOLD_CONFIDENCE`

## Testing Strategy
* Event sourcing validation test: Supply a randomized stream of redundant `RuntimeFact`s. Assert the resulting `GraphUpdate` log is deterministic and replay produces zero duplicated nodes/edges.

## Observability
* Metrics: Nodes created vs Nodes enriched, Graph updates per second.
* Trace: Fact resolution latency.

## Open Design Decisions
* None

## Future Extension Points
* Distributed graph locking for parallel probe execution.

## Cross References
* `CORE_DATA_MODEL_SPECIFICATION.md`
* `GRAPH_MODEL_SPECIFICATION.md`
