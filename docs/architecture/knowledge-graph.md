# Knowledge Graph

## Identity
* **Name**: Knowledge Graph
* **Architecture Status**: STABLE
* **Owner**: Knowledge Subsystem

## Purpose
* [REQUIREMENT] Act as the platform's **semantic index**.
* [REQUIREMENT] Expose stable, queryable, versioned knowledge derived from repeated runtime observations.

## Responsibilities
* [REQUIREMENT] Store verified entities, relationships, mappings, workflows, constraints, and dependencies.
* [REQUIREMENT] Optimize for semantic traversal, relationship lookup, and confidence-aware retrieval.
* [REQUIREMENT] Answer reasoning queries (e.g., "What relationships are known?", "What workflows are confirmed?").
* [REQUIREMENT] Support historical version lookup.

## Explicit Non-Responsibilities
* [REQUIREMENT] Must never store transient runtime state.
* [REQUIREMENT] Must never store `ProbeSession`s or execution history.
* [REQUIREMENT] Must never store raw `Observation` artifacts.
* [REQUIREMENT] Must never store temporary graph updates.
* [REQUIREMENT] Must never coordinate execution.
* [REQUIREMENT] Must never track cleanup.
* [REQUIREMENT] Must never execute planning logic.

## Graph Philosophy
* [DESIGN_DECISION] The Knowledge Graph is not an operational execution database. It is not a replacement for the Runtime Graph. It is not a cache.
* [DESIGN_DECISION] Runtime Graph supports learning. Knowledge Graph supports reasoning.

## Versioning Rule
* [DESIGN_DECISION] Knowledge is immutable. Updates produce new versions. Historical knowledge remains queryable. The graph is strictly append-and-version.

## Repository Rule
* [DESIGN_DECISION] Every planner query must originate from the Knowledge Graph. The Planner must never inspect Runtime Graph state directly during generation.

## Graph Invariants
* [DESIGN_DECISION] No runtime-only models (e.g., `ProbeSession`, `DOMObservation`) may be stored in the Knowledge Graph.
* [DESIGN_DECISION] Every stored node must originate from a `PromotionDecision`.
* [DESIGN_DECISION] Every node must support historical version traversal.

## Inputs
* Canonical `KnowledgeUpdate`

## Outputs
* Canonical Semantic Models (Query Results)
* `KnowledgeVersion` (Historical context)

## Dependencies
* Knowledge Promotion Engine (sole authorized writer)

## Consumers
* Planner
* UI/Visualization Tools
* Seeding Engine

## Public Interfaces
* `applyUpdate(update: KnowledgeUpdate): void`
* `querySemantic(query: QueryPredicate, atVersion?: string): GraphResult`
* `traverseHistory(nodeId: string): KnowledgeVersion[]`

## Internal Components
* Versioned Storage Layer
* Semantic Indexer
* Traversal Engine
* Promotion Decision Auditor

## State
* Passive Data Store (No internal state machine)

## Produced Events
* `KnowledgeVersionCreated`

## Consumed Events
* `KnowledgeUpdateEmitted`

## Read Models
* Semantic Models (Nodes, Edges, Confidence)

## Write Models
* None (Ingests `KnowledgeUpdate` events)

## Algorithms Used
* Version-aware graph traversal (e.g., traversing edges valid at `timestamp T`).

## Failure Modes
* Attempted write without a valid `PromotionDecision`.

## Recovery Strategy
* Hard reject the write; data must flow through the Knowledge Promotion Engine.

## Retry Strategy
* Idempotent application of `KnowledgeUpdate` events.

## Performance Constraints
* Semantic queries must resolve quickly enough to inform real-time planning (max 50ms per typical query).

## Security Constraints
* Write access is strictly limited to the Knowledge Promotion Engine. Read access is available to Planners.

## Configuration
* `MAX_QUERY_DEPTH`

## Testing Strategy
* Immutable versioning test: Apply an update to an existing node, then query the historical version. Assert the original state remains intact and the new version is distinct.

## Observability
* Metrics: Semantic entities stored, Query latency, Version history depth.
* Trace: Query execution path.

## Open Design Decisions
* None

## Future Extension Points
* Vector similarity search embeddings on semantic nodes.
* Federated knowledge querying.

## Cross References
* `GRAPH_MODEL_SPECIFICATION.md`
* `SYSTEM_EXECUTION_FLOW.md`
