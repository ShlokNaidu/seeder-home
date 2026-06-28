# Graph Model Specification

## Architecture Status
STABLE

## Purpose
* [REQUIREMENT] Define the conceptual graph contracts, invariants, and promotion mechanics for the autonomous runtime understanding platform.

## Graph Definitions

### Runtime Graph
* [REQUIREMENT] **Purpose**: Store transient, raw observations and execution evidence.
* [REQUIREMENT] **Role**: Accumulate hypothesis, intermediate findings, and execution state.
* [DESIGN_DECISION] Must never store permanent, long-term application knowledge.

### Knowledge Graph
* [REQUIREMENT] **Purpose**: Store long-term, verified understanding of the target application.
* [REQUIREMENT] **Role**: Serve as the source of truth for the Planner and AI Provider.
* [DESIGN_DECISION] Must never store raw, unverified observations or temporary execution state.

## Node Taxonomy

| Node Type | Graph | Description |
| :--- | :--- | :--- |
| **ObservationNode** | Runtime Graph | A raw data point (e.g., DOM element, Network Response). |
| **ActionNode** | Runtime Graph | An interaction executed by the Probe Engine. |
| **HypothesisNode** | Runtime Graph | An unverified assumption proposed by the Evidence Engine. |
| **EntityNode** | Knowledge Graph | A verified business entity (e.g., `User`, `Invoice`). |
| **RouteNode** | Knowledge Graph | A verified navigation path or API endpoint. |
| **WorkflowNode** | Knowledge Graph | A verified sequence of actions. |
| **ReadSurfaceNode** | Knowledge Graph | A verified observable data surface. |
| **UIStateNode** | Runtime Graph | A specific view state during crawling. |
| **WorkflowCandidateNode** | Runtime Graph | An unverified sequence of interactions. |

## Edge Taxonomy

| Edge Type | Graphs | Description |
| :--- | :--- | :--- |
| **EVIDENCE_FOR** | Runtime Graph | Links an `ObservationNode` to a `HypothesisNode`. |
| **TRIGGERED_BY** | Runtime Graph | Links an `ActionNode` to a resulting `ObservationNode`. |
| **CONTAINS** | Knowledge Graph | Hierarchical relationship (e.g., `EntityNode` contains fields). |
| **NAVIGATES_TO** | Knowledge Graph | Links one `RouteNode` to another `RouteNode`. |
| **DEPENDS_ON** | Both | Defines foreign keys, ordering, or structural dependencies. |
| **NAVIGATION_EDGE** | Runtime Graph | A traversable path discovered between UIStates. |

## Promotion Rules
* [DESIGN_DECISION] **Rule 1**: A subgraph in the Runtime Graph is promoted to the Knowledge Graph only when its aggregated confidence score crosses a predefined promotion threshold.
* [DESIGN_DECISION] **Rule 2**: Promoted nodes are structurally transformed from transient types (e.g., `HypothesisNode`) into semantic types (e.g., `EntityNode`).
* [DESIGN_DECISION] **Rule 3**: Prisma schema extraction can bypass typical Runtime Promotion rules if and only if it is explicitly marked as enrichment and linked to an existing, verified `EntityNode`.

## Evidence Ownership
* [DESIGN_DECISION] Every edge in the Runtime Graph and Knowledge Graph requires explicit traceability evidence.
* [DESIGN_DECISION] Evidence is owned entirely by the **Evidence Engine**.
* [DESIGN_DECISION] Nodes and edges do NOT contain raw evidence data; they reference an `EvidenceBundle`.

## Confidence Model
* [DESIGN_DECISION] **Base Score**: Every observation is assigned an initial score based on the source (e.g., Database > Network Traffic > DOM Inference).
* [DESIGN_DECISION] **Accumulation**: Multiple independent pieces of evidence pointing to the same hypothesis linearly increase confidence.
* [DESIGN_DECISION] **Decay**: Uncorroborated hypotheses decay in confidence over subsequent Probe Engine cycles.
* [DESIGN_DECISION] **Conflict Resolution**: The Evidence Fusion Engine resolves contradictory evidence by subtracting confidence from the lower-scored hypothesis.

## Versioning Strategy
* [DESIGN_DECISION] The Knowledge Graph is append-only/immutable. Changes to entities result in a new node version with an `OBSOLETES` edge pointing to the old version.
* [DESIGN_DECISION] The Runtime Graph is highly mutable and ephemeral. It is reset or truncated per execution session.

## Graph Lifecycle
1. **Instantiation**: Runtime Graph is initialized empty at the start of a session.
2. **Accumulation**: Discovery and Probe engines write observations to the Runtime Graph.
3. **Scoring**: Evidence Engine updates confidence models on edges/nodes.
4. **Promotion**: High-confidence subgraphs are migrated to the Knowledge Graph.
5. **Enrichment**: AI Provider and Prisma augment Knowledge Graph nodes.
6. **Pruning**: Execution session ends; Runtime Graph is archived or flushed.

## Graph Invariants
* [DESIGN_DECISION] Every edge must have an associated confidence score.
* [DESIGN_DECISION] The Knowledge Graph must never contain an `ObservationNode` or `HypothesisNode`.
* [DESIGN_DECISION] Every node in the Knowledge Graph must trace back to at least one `EvidenceBundle`.
* [DESIGN_DECISION] No cyclic `DEPENDS_ON` edges are permitted in either graph.

## Open Design Decisions

* [DESIGN_DECISION_REQUIRED] Exact numerical value of the promotion threshold and specific decay rates.
  * **Affected Components**: Evidence Fusion Engine, Graph Promoters.
  * **Implementation Impact**: High.
  * **Risks**: Churn in the Knowledge Graph if threshold is too low; stalling if too high.
* [DESIGN_DECISION_REQUIRED] Conflict strategy when Prisma Enrichment contradicts high-confidence runtime evidence.
  * **Affected Components**: Evidence Fusion Engine, Prisma Parser.
  * **Implementation Impact**: High.
  * **Risks**: Violating the "Runtime is authoritative" philosophy if Prisma overwrites runtime facts.
