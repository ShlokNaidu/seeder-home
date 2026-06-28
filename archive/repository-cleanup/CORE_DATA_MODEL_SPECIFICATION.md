# Core Data Model Specification

## Architecture Status
STABLE

## Purpose
* [REQUIREMENT] Define the canonical data contracts used throughout the system.
* [DESIGN_DECISION] Shared models must never be duplicated elsewhere. Every later document must reference these models. No component may introduce a new shared model without updating this specification.

## Runtime Models

### RuntimeNode
* **Architecture Status**: DRAFT
* **Purpose**: Represents a transient observation or intermediate state in the runtime environment.
* **Owner**: Runtime Observer
* **Lifecycle**: Created during discovery -> scored -> archived at session end.
* **Fields**: `id, type, payload, timestamp, sessionId`
* **Relationships**: References EvidenceBundle
* **Constraints**: Must not exist in Knowledge Graph
* **Validation Rules**: Payload must be non-null
* **Produced By**: Evidence Normalization Engine
* **Consumed By**: Evidence Engine
* **Persistence**: Ephemeral (Runtime Graph DB)
* **Versioning Strategy**: None
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`

### RuntimeEdge
* **Architecture Status**: DRAFT
* **Purpose**: Represents a transient relationship between two RuntimeNodes.
* **Owner**: Runtime Observer
* **Lifecycle**: Created during discovery -> scored -> archived at session end.
* **Fields**: `id, sourceId, targetId, type, weight`
* **Relationships**: Connects two RuntimeNodes, References EvidenceBundle
* **Constraints**: Source and target must exist
* **Validation Rules**: Weight must be a valid float
* **Produced By**: Evidence Normalization Engine
* **Consumed By**: Evidence Engine
* **Persistence**: Ephemeral (Runtime Graph DB)
* **Versioning Strategy**: None
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`

### RuntimeSnapshot
* **Architecture Status**: DRAFT
* **Purpose**: Represents the state of the Runtime Graph at a specific point in time.
* **Owner**: Runtime Observer
* **Lifecycle**: Created periodically or post-probe -> retained for debugging -> flushed.
* **Fields**: `id, timestamp, nodeCount, edgeCount, stateHash`
* **Relationships**: Contains many RuntimeNodes and RuntimeEdges
* **Constraints**: Immutable after creation
* **Validation Rules**: Must have valid stateHash
* **Produced By**: Runtime Observer
* **Consumed By**: Evidence Fusion Engine
* **Persistence**: Ephemeral
* **Versioning Strategy**: Sequential by timestamp
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`

## Evidence Models

### Evidence
* **Architecture Status**: DRAFT
* **Purpose**: A single atomic piece of proof supporting an observation.
* **Owner**: Evidence Engine
* **Lifecycle**: Extracted from source -> scored -> bundled -> archived.
* **Fields**: `id, type, value, confidenceImpact`
* **Relationships**: Belongs to EvidenceBundle, Extracted from EvidenceSource
* **Constraints**: Cannot be modified after scoring
* **Validation Rules**: Type must be a known enum
* **Produced By**: Evidence Normalization Engine
* **Consumed By**: Evidence Engine
* **Persistence**: Permanent (Traceability DB)
* **Versioning Strategy**: Immutable
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`

### EvidenceBundle
* **Architecture Status**: DRAFT
* **Purpose**: A collection of correlated Evidence items supporting a specific node or edge.
* **Owner**: Evidence Engine
* **Lifecycle**: Created upon correlation -> updated with new Evidence -> locked on promotion.
* **Fields**: `id, aggregatedScore, createdAt, updatedAt`
* **Relationships**: Contains multiple Evidence items, Referenced by Graph Nodes/Edges
* **Constraints**: Cannot be empty
* **Validation Rules**: Score must correctly aggregate child Evidence
* **Produced By**: Evidence Fusion Engine
* **Consumed By**: Graph Promoters, Knowledge Graph
* **Persistence**: Permanent
* **Versioning Strategy**: Append-only updates
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`

### EvidenceSource
* **Architecture Status**: DRAFT
* **Purpose**: Identifies the origin of an Evidence item (e.g., DOM, Network, Database).
* **Owner**: Evidence Engine
* **Lifecycle**: Registered on system start -> referenced by Evidence.
* **Fields**: `id, providerType, reliabilityWeight`
* **Relationships**: Produces Evidence
* **Constraints**: Must be statically registered
* **Validation Rules**: Reliability weight between 0.0 and 1.0
* **Produced By**: System Config
* **Consumed By**: Evidence Engine
* **Persistence**: Static Config
* **Versioning Strategy**: Configuration versioned
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`

### ConfidenceScore
* **Architecture Status**: DRAFT
* **Purpose**: Quantifies the belief in a hypothesis or node based on evidence.
* **Owner**: Evidence Engine
* **Lifecycle**: Calculated -> updated as evidence arrives -> evaluated for promotion.
* **Fields**: `value, variance, lastCalculatedAt`
* **Relationships**: Belongs to EvidenceBundle
* **Constraints**: Value strictly between 0.0 and 1.0
* **Validation Rules**: Variance cannot be negative
* **Produced By**: Evidence Engine, Evidence Fusion Engine
* **Consumed By**: Graph Promoters, Planner
* **Persistence**: Stored within EvidenceBundle
* **Versioning Strategy**: Overwritten on recalculation
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`
* **Open Design Decisions**: Formula for variance decay [DESIGN_DECISION_REQUIRED]

## Mapping Models

### Mapping
* **Architecture Status**: DRAFT
* **Purpose**: Links a conceptual entity to a physical database/UI representation.
* **Owner**: Knowledge Graph
* **Lifecycle**: Proposed -> Verified -> Promoted -> Used by Planner.
* **Fields**: `id, conceptualId, physicalId, mappingType`
* **Relationships**: References KnowledgeNode, References MappingEvidence
* **Constraints**: Cannot map to non-existent conceptual IDs
* **Validation Rules**: Must have valid EvidenceBundle
* **Produced By**: Evidence Fusion Engine
* **Consumed By**: Planner, Seeder
* **Persistence**: Permanent
* **Versioning Strategy**: Immutable, superseded by new mappings
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`

### MappingEvidence
* **Architecture Status**: DRAFT
* **Purpose**: Specialized EvidenceBundle supporting a Mapping.
* **Owner**: Evidence Engine
* **Lifecycle**: Created -> Scored -> Linked to Mapping.
* **Fields**: `id, bundleId, confidenceScore`
* **Relationships**: Extends EvidenceBundle, Supports Mapping
* **Constraints**: Score must exceed promotion threshold
* **Validation Rules**: Must reference valid bundle
* **Produced By**: Evidence Engine
* **Consumed By**: Knowledge Graph
* **Persistence**: Permanent
* **Versioning Strategy**: Append-only
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`

### ValidationRule
* **Architecture Status**: DRAFT
* **Purpose**: Defines constraints for data mapped to an entity (e.g., regex, max length).
* **Owner**: AI Provider
* **Lifecycle**: Inferred -> verified -> used during Generation.
* **Fields**: `id, entityId, ruleType, parameters`
* **Relationships**: Constrains KnowledgeNode
* **Constraints**: Must be executable by Zod/Validator
* **Validation Rules**: Parameters must match ruleType schema
* **Produced By**: AI Provider, Prisma Parser
* **Consumed By**: Seeder, AI Provider
* **Persistence**: Permanent
* **Versioning Strategy**: Replaced on schema update
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`

## Discovery Models

### DiscoverySession
* **Architecture Status**: DRAFT
* **Purpose**: Tracks an active crawl/discovery process.
* **Owner**: Discovery Engine
* **Lifecycle**: Started -> Running -> Paused/Completed -> Archived.
* **Fields**: `id, status, startTime, endTime, entryUrl`
* **Relationships**: Owns ProbeSessions
* **Constraints**: Only one active session per domain
* **Validation Rules**: endTime >= startTime
* **Produced By**: Discovery Engine
* **Consumed By**: Runtime Observer
* **Persistence**: Permanent (Logs)
* **Versioning Strategy**: None
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`

### ProbeSession
* **Architecture Status**: DRAFT
* **Purpose**: Tracks a targeted interaction sequence aiming to reveal specific behavior.
* **Owner**: Probe Engine
* **Lifecycle**: Planned -> Executed -> Analyzed -> Archived.
* **Fields**: `id, discoverySessionId, targetSelector, actionPayload`
* **Relationships**: Belongs to DiscoverySession, Produces RuntimeNodes
* **Constraints**: Must have a target
* **Validation Rules**: Payload must match target type
* **Produced By**: Probe Engine
* **Consumed By**: Evidence Engine
* **Persistence**: Permanent (Logs)
* **Versioning Strategy**: None
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`

### MutationSurface
* **Architecture Status**: DRAFT
* **Purpose**: Identifies a UI/API boundary where state can be altered.
* **Owner**: Discovery Engine
* **Lifecycle**: Discovered -> mapped -> utilized by Planner.
* **Fields**: `id, surfaceType, locationIdentifier, expectedInputs`
* **Relationships**: Mapped to KnowledgeNode
* **Constraints**: Must be reachable
* **Validation Rules**: LocationIdentifier cannot be empty
* **Produced By**: Discovery Engine, Runtime Observer
* **Consumed By**: Probe Engine, Planner
* **Persistence**: Promoted to Knowledge Graph
* **Versioning Strategy**: Immutable
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`

### Route
* **Architecture Status**: DRAFT
* **Purpose**: Represents a navigable view or API endpoint.
* **Owner**: Discovery Engine
* **Lifecycle**: Discovered -> Promoted to Knowledge Graph.
* **Fields**: `id, pathPattern, method, isApi`
* **Relationships**: Contains MutationSurfaces
* **Constraints**: Must be unique by path/method
* **Validation Rules**: Path must be valid URI pattern
* **Produced By**: Discovery Engine
* **Consumed By**: Planner, Probe Engine
* **Persistence**: Promoted to Knowledge Graph
* **Versioning Strategy**: Immutable
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`

### Workflow
* **Architecture Status**: DRAFT
* **Purpose**: A verified sequence of Actions/Routes required to achieve a business goal.
* **Owner**: Knowledge Graph
* **Lifecycle**: Correlated from traces -> verified -> stored.
* **Fields**: `id, name, steps, requiredPreconditions`
* **Relationships**: Contains Routes and MutationSurfaces
* **Constraints**: Steps must be ordered
* **Validation Rules**: Preconditions must be solvable
* **Produced By**: Evidence Fusion Engine
* **Consumed By**: Planner
* **Persistence**: Permanent
* **Versioning Strategy**: Superseded on change
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`

## Knowledge Models

### KnowledgeNode
* **Architecture Status**: DRAFT
* **Purpose**: A verified, long-term entity in the Knowledge Graph.
* **Owner**: Knowledge Graph
* **Lifecycle**: Promoted from Runtime -> Enriched -> Consumed -> Superseded.
* **Fields**: `id, semanticType, attributes, version`
* **Relationships**: References EvidenceBundle
* **Constraints**: Must have >0 EvidenceBundles
* **Validation Rules**: SemanticType must be defined
* **Produced By**: Graph Promoters, AI Provider
* **Consumed By**: Planner, Seeder
* **Persistence**: Permanent (Knowledge DB)
* **Versioning Strategy**: Strictly versioned with OBSOLETES edges
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`

### KnowledgeEdge
* **Architecture Status**: DRAFT
* **Purpose**: A verified relationship between KnowledgeNodes.
* **Owner**: Knowledge Graph
* **Lifecycle**: Promoted from Runtime -> Enriched -> Consumed.
* **Fields**: `id, sourceId, targetId, relationType`
* **Relationships**: Connects KnowledgeNodes, References EvidenceBundle
* **Constraints**: No cyclic DEPENDS_ON relations
* **Validation Rules**: Source and Target must exist
* **Produced By**: Graph Promoters
* **Consumed By**: Planner
* **Persistence**: Permanent
* **Versioning Strategy**: Strictly versioned
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`

### KnowledgeSnapshot
* **Architecture Status**: DRAFT
* **Purpose**: A versioned state of the entire Knowledge Graph.
* **Owner**: Knowledge Graph
* **Lifecycle**: Created at milestone -> Used for rollback/diff -> Archived.
* **Fields**: `id, timestamp, versionHash, description`
* **Relationships**: Owns state of KnowledgeNodes/Edges
* **Constraints**: Absolutely immutable
* **Validation Rules**: Hash must be cryptographically valid
* **Produced By**: Knowledge Graph
* **Consumed By**: System Admin, Diff Engine
* **Persistence**: Permanent
* **Versioning Strategy**: Sequential
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`

### PromotionCandidate
* **Architecture Status**: DRAFT
* **Purpose**: A Runtime subgraph nominated for promotion to Knowledge.
* **Owner**: Evidence Fusion Engine
* **Lifecycle**: Nominated -> Evaluated -> Promoted or Rejected.
* **Fields**: `id, subgraphIds, aggregateConfidence`
* **Relationships**: References RuntimeNodes
* **Constraints**: Must cross PROMOTION_THRESHOLD
* **Validation Rules**: All subgraph IDs must exist
* **Produced By**: Evidence Fusion Engine
* **Consumed By**: Graph Promoters
* **Persistence**: Ephemeral
* **Versioning Strategy**: None
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`

## Planner Models

### PlannerTask
* **Architecture Status**: DRAFT
* **Purpose**: An atomic unit of work to be executed to achieve a goal.
* **Owner**: Planner
* **Lifecycle**: Generated -> Scheduled -> Executed -> Completed/Failed.
* **Fields**: `id, actionType, targetId, status, retryCount`
* **Relationships**: Belongs to ExecutionStage, Depends on Dependency
* **Constraints**: Cannot execute until dependencies met
* **Validation Rules**: ActionType must be valid enum
* **Produced By**: Planner
* **Consumed By**: Seeder, Probe Engine
* **Persistence**: Permanent (Execution DB)
* **Versioning Strategy**: State updates only
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`

### ExecutionStage
* **Architecture Status**: DRAFT
* **Purpose**: A group of PlannerTasks that can be executed in parallel.
* **Owner**: Planner
* **Lifecycle**: Created -> Running -> Completed.
* **Fields**: `id, stageOrder, status`
* **Relationships**: Contains PlannerTasks, Belongs to ExecutionPlan
* **Constraints**: All tasks must complete to pass stage
* **Validation Rules**: StageOrder must be contiguous
* **Produced By**: Planner
* **Consumed By**: Execution Engine
* **Persistence**: Permanent
* **Versioning Strategy**: None
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`

### ExecutionPlan
* **Architecture Status**: DRAFT
* **Purpose**: A complete DAG of execution stages to fulfill a seeding request.
* **Owner**: Planner
* **Lifecycle**: Generated -> Approved -> Executed -> Archived.
* **Fields**: `id, goal, status, createdAt`
* **Relationships**: Contains ExecutionStages
* **Constraints**: Must be an acyclic graph
* **Validation Rules**: Goal cannot be empty
* **Produced By**: Planner
* **Consumed By**: Execution Registry
* **Persistence**: Permanent
* **Versioning Strategy**: Immutable post-approval
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`

### Dependency
* **Architecture Status**: DRAFT
* **Purpose**: Defines an explicit prerequisite between tasks or entities.
* **Owner**: Planner
* **Lifecycle**: Resolved -> Satisfied.
* **Fields**: `id, sourceTaskId, targetTaskId, dependencyType`
* **Relationships**: Connects PlannerTasks
* **Constraints**: Target cannot start until Source completes
* **Validation Rules**: Source and Target must differ
* **Produced By**: Planner
* **Consumed By**: Execution Engine
* **Persistence**: Permanent
* **Versioning Strategy**: None
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`

## Generation Models

### GenerationRequest
* **Architecture Status**: DRAFT
* **Purpose**: A structured request to the AI Provider to generate business data.
* **Owner**: AI Provider
* **Lifecycle**: Created -> Sent -> Fulfilled -> Logged.
* **Fields**: `id, entitySchema, count, contextConstraints`
* **Relationships**: Triggers GenerationResult
* **Constraints**: Must fit within token limits
* **Validation Rules**: Schema must be valid JSON schema
* **Produced By**: Planner
* **Consumed By**: AI Provider
* **Persistence**: Logged
* **Versioning Strategy**: None
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`

### GeneratedEntity
* **Architecture Status**: DRAFT
* **Purpose**: A single piece of AI-generated business data.
* **Owner**: AI Provider
* **Lifecycle**: Generated -> Validated -> Consumed by Seeder.
* **Fields**: `id, requestId, payload, isValid`
* **Relationships**: Belongs to GeneratedDataset
* **Constraints**: Payload must pass ValidationRules
* **Validation Rules**: Must conform to requested schema
* **Produced By**: AI Provider
* **Consumed By**: Seeder, Validation Engine
* **Persistence**: Ephemeral/Logged
* **Versioning Strategy**: None
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`

### GeneratedDataset
* **Architecture Status**: DRAFT
* **Purpose**: A batch of GeneratedEntities fulfilling a request.
* **Owner**: AI Provider
* **Lifecycle**: Batched -> Validated -> Seeded.
* **Fields**: `id, requestId, entityCount`
* **Relationships**: Contains GeneratedEntities
* **Constraints**: Count must match requested count
* **Validation Rules**: All entities must be valid
* **Produced By**: AI Provider
* **Consumed By**: Seeder
* **Persistence**: Logged
* **Versioning Strategy**: None
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`

### GenerationResult
* **Architecture Status**: DRAFT
* **Purpose**: The final outcome of an AI request, including metadata and token usage.
* **Owner**: AI Provider
* **Lifecycle**: Created upon fulfillment -> Archived.
* **Fields**: `id, requestId, datasetId, tokenUsage, latencyMs`
* **Relationships**: References GenerationRequest
* **Constraints**: Must map to 1 request
* **Validation Rules**: Tokens >= 0
* **Produced By**: AI Provider
* **Consumed By**: Metrics/Logging
* **Persistence**: Permanent (Logs)
* **Versioning Strategy**: None
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`

## Execution Models

### ExecutionRecord
* **Architecture Status**: DRAFT
* **Purpose**: An immutable log of a mutation performed on the target system.
* **Owner**: Execution Registry
* **Lifecycle**: Created upon mutation success -> Read for cleanup -> Archived.
* **Fields**: `id, taskId, mutationPayload, insertedPrimaryKey, timestamp`
* **Relationships**: References PlannerTask, Triggers CleanupRecord
* **Constraints**: Must contain the foreign/primary keys generated
* **Validation Rules**: PrimaryKey cannot be null
* **Produced By**: Seeder Engine
* **Consumed By**: Execution Registry, Cleanup Engine
* **Persistence**: Permanent (Execution DB)
* **Versioning Strategy**: Append-only
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`

### CleanupRecord
* **Architecture Status**: DRAFT
* **Purpose**: A log of an action taken to reverse an ExecutionRecord.
* **Owner**: Cleanup Engine
* **Lifecycle**: Planned -> Executed -> Verified.
* **Fields**: `id, executionRecordId, status, timestamp`
* **Relationships**: Reverses ExecutionRecord
* **Constraints**: Must execute successfully to mark environment clean
* **Validation Rules**: Must reference valid ExecutionRecord
* **Produced By**: Cleanup Engine
* **Consumed By**: System Admin
* **Persistence**: Permanent
* **Versioning Strategy**: Append-only
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`

### RollbackRecord
* **Architecture Status**: DRAFT
* **Purpose**: A macro-level log of a full environment reset.
* **Owner**: Cleanup Engine
* **Lifecycle**: Started -> Completed -> Archived.
* **Fields**: `id, planId, successCount, failureCount, timestamp`
* **Relationships**: Contains CleanupRecords
* **Constraints**: Only created when a full plan is rolled back
* **Validation Rules**: Counts must match total cleanups
* **Produced By**: Cleanup Engine
* **Consumed By**: System Admin
* **Persistence**: Permanent
* **Versioning Strategy**: None
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`, `SYSTEM_ARCHITECTURE.md`



## Discovery Taxonomy Expansion

### ReadSurface
* **Architecture Status**: STABLE
* **Purpose**: Represents an observable, non-mutating UI area containing data (e.g., Table, List, Detail View).
* **Owner**: Discovery Engine
* **Lifecycle**: Discovered -> Mapped to Route -> Promoted.
* **Fields**: `id`, `surfaceType`, `dataStructure`, `routeId`
* **Relationships**: Contained within Route, Mapped to KnowledgeNode
* **Constraints**: Cannot contain mutating actions
* **Validation Rules**: Must contain parsable data fields
* **Produced By**: Discovery Engine
* **Consumed By**: Runtime Observer
* **Persistence**: Promoted to Knowledge Graph
* **Versioning Strategy**: Immutable
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`
* **Open Design Decisions**: None

### UIState
* **Architecture Status**: STABLE
* **Purpose**: Represents a distinct visual/functional configuration of a Route at a specific moment.
* **Owner**: Discovery Engine
* **Lifecycle**: Reached -> Hashed -> Logged -> Superseded.
* **Fields**: `id`, `routeId`, `stateHashId`, `activeElements`
* **Relationships**: Belongs to Route, Hashed by StateHash
* **Constraints**: Must map to a specific Route
* **Validation Rules**: None
* **Produced By**: Discovery Engine
* **Consumed By**: Runtime Observer, Probe Engine
* **Persistence**: Ephemeral (Runtime Graph)
* **Versioning Strategy**: Replaced by subsequent states
* **Cross References**: None
* **Open Design Decisions**: None

### NavigationEdge
* **Architecture Status**: STABLE
* **Purpose**: Defines a traversable path between two UIStates or Routes.
* **Owner**: Discovery Engine
* **Lifecycle**: Discovered -> Traversed -> Promoted to RouteNode edges.
* **Fields**: `id`, `sourceId`, `targetId`, `triggerElementId`
* **Relationships**: Connects two UIStates/Routes
* **Constraints**: Source and Target must exist
* **Validation Rules**: Cannot trigger mutating actions
* **Produced By**: Discovery Engine
* **Consumed By**: Runtime Observer, Probe Engine
* **Persistence**: Promoted to Knowledge Graph (as NAVIGATES_TO)
* **Versioning Strategy**: Immutable
* **Cross References**: None
* **Open Design Decisions**: None

### StateHash
* **Architecture Status**: STABLE
* **Purpose**: A deterministic fingerprint of a UIState used for deduplication.
* **Owner**: Discovery Engine
* **Lifecycle**: Computed -> Compared -> Discarded or Stored.
* **Fields**: `hashValue`, `computationMethod`
* **Relationships**: Identifies a UIState
* **Constraints**: Must be deterministic
* **Validation Rules**: Must not include dynamic timestamps
* **Produced By**: Discovery Engine
* **Consumed By**: Discovery Engine (for deduplication)
* **Persistence**: Ephemeral
* **Versioning Strategy**: None
* **Cross References**: None
* **Open Design Decisions**: None

### WorkflowCandidate
* **Architecture Status**: STABLE
* **Purpose**: An unverified, proposed sequence of interactions that may form a business workflow.
* **Owner**: Discovery Engine
* **Lifecycle**: Proposed -> Verified by Evidence Engine -> Promoted to Workflow.
* **Fields**: `id`, `sequence`, `triggerCondition`
* **Relationships**: Sequence of NavigationEdges and MutationSurfaces
* **Constraints**: Sequence must be connected
* **Validation Rules**: Must contain at least one MutationSurface to be a meaningful workflow
* **Produced By**: Discovery Engine
* **Consumed By**: Evidence Engine, Probe Engine
* **Persistence**: Runtime Graph
* **Versioning Strategy**: None
* **Cross References**: None
* **Open Design Decisions**: None

## System Safety Classifications

### NavigationSafetyClassification
* **Architecture Status**: STABLE
* **Purpose**: An architectural enum defining the safety and mutability of a given interaction.
* **Owner**: Core Infrastructure
* **Lifecycle**: Statically defined architectural invariant.
* **Fields**: `PassiveNavigation`, `PassiveReveal`, `ObservationOnly`, `PotentialMutation`, `ConfirmedMutation`
* **Relationships**: Classifies interactions and NavigationEdges
* **Constraints**: Discovery Engine is strictly limited to PassiveNavigation, PassiveReveal, and ObservationOnly.
* **Validation Rules**: N/A
* **Produced By**: Core Infrastructure
* **Consumed By**: Discovery Engine, Probe Engine
* **Persistence**: Code/Architecture level
* **Versioning Strategy**: None
* **Cross References**: `discovery-engine.md`
* **Open Design Decisions**: None

## Observation Models (Runtime)

### DOMObservation
* **Architecture Status**: STABLE
* **Purpose**: Represents a raw snapshot or diff of the Document Object Model at a specific point in time.
* **Owner**: Runtime Observation Engine
* **Lifecycle**: Captured -> Logged -> Correlated into Evidence -> Archived.
* **Fields**: `id`, `timestamp`, `mutationType`, `targetSelector`, `payload`
* **Relationships**: Inherits from RuntimeNode
* **Constraints**: Must be lossless
* **Validation Rules**: Payload must be valid string or structured DOM diff
* **Produced By**: Runtime Observation Engine
* **Consumed By**: Evidence Engine
* **Persistence**: Ephemeral (Runtime Graph DB)
* **Versioning Strategy**: None
* **Cross References**: `runtime-observer.md`
* **Open Design Decisions**: None

### NetworkObservation
* **Architecture Status**: STABLE
* **Purpose**: Represents a raw intercepted HTTP request/response.
* **Owner**: Runtime Observation Engine
* **Lifecycle**: Captured -> Logged -> Correlated into Evidence -> Archived.
* **Fields**: `id`, `timestamp`, `method`, `url`, `headers`, `body`, `status`
* **Relationships**: Inherits from RuntimeNode
* **Constraints**: Sensitive data must be obfuscated
* **Validation Rules**: Must contain standard HTTP metadata
* **Produced By**: Runtime Observation Engine
* **Consumed By**: Evidence Engine
* **Persistence**: Ephemeral (Runtime Graph DB)
* **Versioning Strategy**: None
* **Cross References**: None
* **Open Design Decisions**: None

### RuntimeObservation
* **Architecture Status**: STABLE
* **Purpose**: Represents browser console output, JS errors, or unhandled exceptions.
* **Owner**: Runtime Observation Engine
* **Lifecycle**: Captured -> Logged -> Correlated into Evidence -> Archived.
* **Fields**: `id`, `timestamp`, `level`, `message`, `stackTrace`
* **Relationships**: Inherits from RuntimeNode
* **Constraints**: Must be lossless
* **Validation Rules**: Message cannot be null
* **Produced By**: Runtime Observation Engine
* **Consumed By**: Evidence Engine
* **Persistence**: Ephemeral (Runtime Graph DB)
* **Versioning Strategy**: None
* **Cross References**: None
* **Open Design Decisions**: None

### StorageObservation
* **Architecture Status**: STABLE
* **Purpose**: Represents mutations to browser storage (Local Storage, Session Storage, Cookies).
* **Owner**: Runtime Observation Engine
* **Lifecycle**: Captured -> Logged -> Correlated into Evidence -> Archived.
* **Fields**: `id`, `timestamp`, `storageType`, `key`, `valueDiff`
* **Relationships**: Inherits from RuntimeNode
* **Constraints**: None
* **Validation Rules**: None
* **Produced By**: Runtime Observation Engine
* **Consumed By**: Evidence Engine
* **Persistence**: Ephemeral (Runtime Graph DB)
* **Versioning Strategy**: None
* **Cross References**: None
* **Open Design Decisions**: None

### AccessibilityObservation
* **Architecture Status**: STABLE
* **Purpose**: Represents the accessibility tree, roles, and accessible names.
* **Owner**: Runtime Observation Engine
* **Lifecycle**: Captured -> Logged -> Correlated into Evidence -> Archived.
* **Fields**: `id`, `timestamp`, `treeSnapshot`, `roles`
* **Relationships**: Inherits from RuntimeNode
* **Constraints**: None
* **Validation Rules**: None
* **Produced By**: Runtime Observation Engine
* **Consumed By**: Evidence Engine
* **Persistence**: Ephemeral (Runtime Graph DB)
* **Versioning Strategy**: None
* **Cross References**: None
* **Open Design Decisions**: None

### DatabaseObservationReference
* **Architecture Status**: STABLE
* **Purpose**: Represents a reference to a database snapshot or mutation.
* **Owner**: Runtime Observation Engine
* **Lifecycle**: Captured -> Logged -> Correlated into Evidence -> Archived.
* **Fields**: `id`, `timestamp`, `snapshotIdentifier`, `diffReference`
* **Relationships**: Inherits from RuntimeNode
* **Constraints**: Must not contain actual DB payloads (only references)
* **Validation Rules**: None
* **Produced By**: Runtime Observation Engine
* **Consumed By**: Evidence Engine
* **Persistence**: Ephemeral (Runtime Graph DB)
* **Versioning Strategy**: None
* **Cross References**: None
* **Open Design Decisions**: None

### VisualObservation
* **Architecture Status**: STABLE
* **Purpose**: Represents an optional visual artifact (e.g., screenshot or visual assertion).
* **Owner**: Runtime Observation Engine
* **Lifecycle**: Captured (if configured) -> Correlated -> Archived.
* **Fields**: `id`, `timestamp`, `imageReference`, `boundingBox`
* **Relationships**: Inherits from RuntimeNode
* **Constraints**: Never strictly required for system execution
* **Validation Rules**: Must be a valid image reference
* **Produced By**: Runtime Observation Engine
* **Consumed By**: Evidence Engine
* **Persistence**: Ephemeral (File Storage)
* **Versioning Strategy**: None
* **Cross References**: None
* **Open Design Decisions**: None

## Probe Orchestration Models

### ProbeRequest
* **Architecture Status**: STABLE
* **Purpose**: A formalized request to execute a deterministic experiment on a mutation surface.
* **Owner**: Probe Orchestration Engine
* **Lifecycle**: Generated -> Scheduled -> Executed -> Archived.
* **Fields**: `id`, `mutationSurfaceId`, `routeId`, `deterministicPayload`
* **Relationships**: Targets a MutationSurface
* **Constraints**: Must specify deterministic values
* **Validation Rules**: Must target a valid, known MutationSurface
* **Produced By**: Planner (or System Schedule)
* **Consumed By**: Probe Orchestration Engine
* **Persistence**: Ephemeral (Queue)
* **Versioning Strategy**: None
* **Cross References**: `probe-engine.md`
* **Open Design Decisions**: None

### ProbeExecution
* **Architecture Status**: STABLE
* **Purpose**: Represents the active lifecycle of a running probe transaction.
* **Owner**: Probe Orchestration Engine
* **Lifecycle**: Prepared -> Armed -> Executed -> Observed -> Completed.
* **Fields**: `id`, `probeRequestId`, `sessionId`, `startTime`, `endTime`, `stage`
* **Relationships**: Belongs to ProbeSession
* **Constraints**: Observation must be armed before execution
* **Validation Rules**: N/A
* **Produced By**: Probe Orchestration Engine
* **Consumed By**: Runtime Observation Engine, Execution Registry
* **Persistence**: Ephemeral
* **Versioning Strategy**: None
* **Cross References**: `probe-engine.md`
* **Open Design Decisions**: None

### ProbeResult
* **Architecture Status**: STABLE
* **Purpose**: A deterministic record of what occurred during a ProbeExecution.
* **Owner**: Probe Orchestration Engine
* **Lifecycle**: Emitted on completion -> Scored by Evidence Engine -> Archived.
* **Fields**: `id`, `probeExecutionId`, `outcomeId`, `observationBundleReference`
* **Relationships**: References exactly one ObservationBundleReference
* **Constraints**: Must be emitted for every executed probe
* **Validation Rules**: Must reference a valid Execution and Outcome
* **Produced By**: Probe Orchestration Engine
* **Consumed By**: Evidence Engine
* **Persistence**: Permanent
* **Versioning Strategy**: Immutable
* **Cross References**: `probe-engine.md`
* **Open Design Decisions**: None

### ProbeOutcome
* **Architecture Status**: STABLE
* **Purpose**: A discrete classification of a probe's result (e.g., Success, Reverted, Blocked, Error).
* **Owner**: Probe Orchestration Engine
* **Lifecycle**: Computed at ProbeResult emission.
* **Fields**: `id`, `classification`, `reason`
* **Relationships**: Classifies a ProbeResult
* **Constraints**: Purely mechanical classification (no business logic)
* **Validation Rules**: Must be a known enum value
* **Produced By**: Probe Orchestration Engine
* **Consumed By**: Evidence Engine
* **Persistence**: Permanent
* **Versioning Strategy**: None
* **Cross References**: `probe-engine.md`
* **Open Design Decisions**: None

## Correlation & Fact Models

### CorrelatedEvidence
* **Architecture Status**: STABLE
* **Purpose**: A linked graph of multiple Normalized Evidence artifacts that corroborate a single event.
* **Owner**: Runtime Correlation Engine
* **Lifecycle**: Generated from Evidence -> Scored -> Promoted into RuntimeFacts.
* **Fields**: `id`, `evidenceIds`, `correlationMethod`, `timestamp`
* **Relationships**: References >1 Canonical Evidence records
* **Constraints**: Must trace back to normalized Evidence
* **Validation Rules**: Must contain evidence from >1 distinct source type or context
* **Produced By**: Runtime Correlation Engine
* **Consumed By**: Runtime Correlation Engine (internal), Evidence Fusion Engine
* **Persistence**: Ephemeral (Queue)
* **Versioning Strategy**: None
* **Cross References**: `runtime-correlation-engine.md`
* **Open Design Decisions**: None

### MappingCandidate
* **Architecture Status**: STABLE
* **Purpose**: An unverified proposal linking a UI interaction to a database/network field.
* **Owner**: Runtime Correlation Engine
* **Lifecycle**: Extracted during correlation -> Evaluated -> Fused.
* **Fields**: `id`, `uiLocator`, `payloadKey`, `databaseColumn`
* **Relationships**: Belongs to CorrelatedEvidence
* **Constraints**: Requires multi-domain evidence (e.g., DOM + Network)
* **Validation Rules**: None
* **Produced By**: Runtime Correlation Engine
* **Consumed By**: Evidence Fusion Engine
* **Persistence**: Ephemeral
* **Versioning Strategy**: None
* **Cross References**: None
* **Open Design Decisions**: None

### RuntimeFact
* **Architecture Status**: STABLE
* **Purpose**: A cohesive, correlated insight ready for fusion into the Runtime Graph.
* **Owner**: Runtime Correlation Engine
* **Lifecycle**: Computed -> Assessed for Confidence -> Forwarded to Fusion.
* **Fields**: `id`, `factType`, `payload`, `correlatedEvidenceId`, `confidenceAssessmentId`
* **Relationships**: Backed by exactly 1 CorrelatedEvidence; Contains exactly 1 ConfidenceAssessment.
* **Constraints**: Cannot exist without a traceable provenance chain back to observations.
* **Validation Rules**: Payload must match factType schema.
* **Produced By**: Runtime Correlation Engine
* **Consumed By**: Evidence Fusion Engine
* **Persistence**: Ephemeral (Written to Runtime Graph by Fusion Engine)
* **Versioning Strategy**: None
* **Cross References**: None
* **Open Design Decisions**: None

### ConfidenceAssessment
* **Architecture Status**: STABLE
* **Purpose**: The mathematical score calculated for a RuntimeFact based on its backing CorrelatedEvidence.
* **Owner**: Runtime Correlation Engine
* **Lifecycle**: Computed during Fact generation -> Handed off to Fusion.
* **Fields**: `id`, `score`, `variance`, `calculationMethod`
* **Relationships**: Belongs to a RuntimeFact
* **Constraints**: Score must be between 0.0 and 1.0.
* **Validation Rules**: None
* **Produced By**: Runtime Correlation Engine
* **Consumed By**: Evidence Fusion Engine
* **Persistence**: Ephemeral
* **Versioning Strategy**: None
* **Cross References**: None
* **Open Design Decisions**: None

## Runtime Graph Construction Models

### GraphUpdate
* **Architecture Status**: STABLE
* **Purpose**: Represents an atomic mutation applied to the Runtime Graph.
* **Owner**: Runtime Knowledge Construction Engine
* **Lifecycle**: Computed -> Applied to Graph -> Logged in Event Stream.
* **Fields**: `id`, `updateType`, `targetNodeId`, `targetEdgeId`, `payload`, `timestamp`, `originatingProbeSessionId`
* **Relationships**: Relates to RuntimeNode or RuntimeEdge
* **Constraints**: Must be deterministic and replayable. Never destroys previously verified knowledge.
* **Validation Rules**: updateType must be one of: NodeCreated, NodeEnriched, EdgeCreated, EdgeStrengthened, MetadataUpdated
* **Produced By**: Runtime Knowledge Construction Engine
* **Consumed By**: Runtime Graph
* **Persistence**: Permanent (Event Store)
* **Versioning Strategy**: Append-only
* **Cross References**: `runtime-knowledge-construction-engine.md`
* **Open Design Decisions**: None

## Knowledge Promotion Models

### PromotionCandidate
* **Architecture Status**: STABLE
* **Purpose**: A formal proposal to permanently record a subgraph of the Runtime Graph as Knowledge.
* **Owner**: Knowledge Promotion Engine
* **Lifecycle**: Extracted from Runtime Graph -> Evaluated -> Converted to PromotionDecision.
* **Fields**: `id`, `runtimeNodeIds`, `runtimeEdgeIds`, `runtimeFacts`, `confidenceAssessments`
* **Relationships**: Composed of Runtime Graph elements
* **Constraints**: Must have sufficient confidence and complete provenance.
* **Validation Rules**: Must trace back to canonical Observations.
* **Produced By**: Planner (or System Schedule)
* **Consumed By**: Knowledge Promotion Engine
* **Persistence**: Ephemeral (Queue)
* **Versioning Strategy**: None
* **Cross References**: `knowledge-promotion-engine.md`
* **Open Design Decisions**: None

### PromotionDecision
* **Architecture Status**: STABLE
* **Purpose**: The deterministic outcome of evaluating a PromotionCandidate.
* **Owner**: Knowledge Promotion Engine
* **Lifecycle**: Computed -> Emitted -> Triggers Graph Update or Rejection Record.
* **Fields**: `id`, `candidateId`, `outcomeClassification`, `reasoning`
* **Relationships**: Belongs to exactly 1 PromotionCandidate
* **Constraints**: outcomeClassification must be one of: NewKnowledge, Enrichment, VersionUpgrade, Duplicate, Rejected, Deferred.
* **Validation Rules**: N/A
* **Produced By**: Knowledge Promotion Engine
* **Consumed By**: Knowledge Graph (Updates), Audit Log (Rejections)
* **Persistence**: Permanent
* **Versioning Strategy**: Append-only (Auditable)
* **Cross References**: `knowledge-promotion-engine.md`
* **Open Design Decisions**: None

### KnowledgeUpdate
* **Architecture Status**: STABLE
* **Purpose**: An atomic mutation applied to the Knowledge Graph, representing verified permanent understanding.
* **Owner**: Knowledge Promotion Engine
* **Lifecycle**: Computed from Decision -> Applied to Knowledge Graph.
* **Fields**: `id`, `decisionId`, `updateType`, `targetKnowledgeNodeId`, `payload`, `timestamp`
* **Relationships**: Belongs to a PromotionDecision
* **Constraints**: Applies strict append-and-version logic to the Knowledge Graph.
* **Validation Rules**: None
* **Produced By**: Knowledge Promotion Engine
* **Consumed By**: Knowledge Graph
* **Persistence**: Permanent (Event Store)
* **Versioning Strategy**: Append-only
* **Cross References**: `knowledge-promotion-engine.md`
* **Open Design Decisions**: None

### RejectionRecord
* **Architecture Status**: STABLE
* **Purpose**: A permanent audit log of why a PromotionCandidate was denied entry into the Knowledge Graph.
* **Owner**: Knowledge Promotion Engine
* **Lifecycle**: Emitted on Rejected or Deferred decision -> Archived.
* **Fields**: `id`, `decisionId`, `reason`, `missingProvenanceFlags`
* **Relationships**: Relates to a PromotionDecision
* **Constraints**: Nothing is silently discarded.
* **Validation Rules**: Must contain a concrete reason.
* **Produced By**: Knowledge Promotion Engine
* **Consumed By**: Planner (for iterative debugging)
* **Persistence**: Permanent (Audit Log)
* **Versioning Strategy**: Append-only
* **Cross References**: `knowledge-promotion-engine.md`
* **Open Design Decisions**: None

## Planning & Scheduling Models

### GoalSpecification
* **Architecture Status**: STABLE
* **Purpose**: A canonical representation of the user's intent to seed data.
* **Owner**: Goal Analysis Engine
* **Lifecycle**: Parsed from User Request -> Resolved -> Passed to Execution Planner.
* **Fields**: `id`, `targetEntities`, `quantityConstraints`, `domainConstraints`
* **Relationships**: Derived from User Request and Knowledge Graph constraints
* **Constraints**: Must specify "what" to build, never "how" or "in what order".
* **Validation Rules**: Must target known Knowledge Graph entities.
* **Produced By**: Goal Analysis Engine
* **Consumed By**: Execution Planner
* **Persistence**: Ephemeral (Queue)
* **Versioning Strategy**: None
* **Cross References**: `goal-analysis-engine.md`
* **Open Design Decisions**: None

### ExecutionPlan
* **Architecture Status**: STABLE
* **Purpose**: A dependency-correct DAG representing the exact sequence of workflows needed to satisfy the GoalSpecification.
* **Owner**: Execution Planner
* **Lifecycle**: Generated -> Scheduled -> Archived.
* **Fields**: `id`, `goalId`, `dependencyGraph`, `selectedWorkflows`
* **Relationships**: Belongs to GoalSpecification
* **Constraints**: Must have zero cyclic dependencies.
* **Validation Rules**: All workflows must exist in Knowledge Graph.
* **Produced By**: Execution Planner
* **Consumed By**: Execution Scheduler
* **Persistence**: Permanent (Execution History)
* **Versioning Strategy**: Immutable
* **Cross References**: `execution-planner.md`
* **Open Design Decisions**: None

### ExecutionSchedule
* **Architecture Status**: STABLE
* **Purpose**: A timeline and concurrency layout for executing an ExecutionPlan.
* **Owner**: Execution Scheduler
* **Lifecycle**: Partitioned -> Executed -> Archived.
* **Fields**: `id`, `planId`, `stages`
* **Relationships**: Belongs to ExecutionPlan, contains ExecutionStages
* **Constraints**: Parallel execution cannot violate ExecutionPlan DAG dependencies.
* **Validation Rules**: N/A
* **Produced By**: Execution Scheduler
* **Consumed By**: Execution Registry, Task Workers
* **Persistence**: Ephemeral (Queue/State)
* **Versioning Strategy**: None
* **Cross References**: `execution-scheduler.md`
* **Open Design Decisions**: None

### ExecutionStage
* **Architecture Status**: STABLE
* **Purpose**: A discrete, parallelizable batch of work within a schedule.
* **Owner**: Execution Scheduler
* **Lifecycle**: Enqueued -> Processing -> Completed/Failed.
* **Fields**: `id`, `scheduleId`, `tasks`, `status`
* **Relationships**: Belongs to ExecutionSchedule
* **Constraints**: None
* **Validation Rules**: None
* **Produced By**: Execution Scheduler
* **Consumed By**: Task Workers
* **Persistence**: Ephemeral
* **Versioning Strategy**: None
* **Cross References**: `execution-scheduler.md`
* **Open Design Decisions**: None

### RetryPlan
* **Architecture Status**: STABLE
* **Purpose**: A formalized policy defining how a failed ExecutionStage should be resumed or retried.
* **Owner**: Execution Scheduler
* **Lifecycle**: Attached to Stage -> Invoked on Failure.
* **Fields**: `id`, `stageId`, `maxRetries`, `backoffStrategy`
* **Relationships**: Belongs to ExecutionStage
* **Constraints**: None
* **Validation Rules**: None
* **Produced By**: Execution Scheduler
* **Consumed By**: Execution Scheduler
* **Persistence**: Ephemeral
* **Versioning Strategy**: None
* **Cross References**: `execution-scheduler.md`
* **Open Design Decisions**: None

## Data Generation Models

### SemanticDatasetSpecification
* **Architecture Status**: STABLE
* **Purpose**: Defines the semantic archetypes, distributions, and constraints for a dataset without materializing the actual rows.
* **Owner**: Business Value Generation Engine
* **Lifecycle**: Generated -> Passed to Materialization Engine -> Discarded.
* **Fields**: `id`, `goalId`, `archetypes`, `distributions`, `constraints`
* **Relationships**: Derived from GoalSpecification and Knowledge Graph
* **Constraints**: Size of this spec is independent of the target dataset row count.
* **Validation Rules**: N/A
* **Produced By**: Business Value Generation Engine (via LLM)
* **Consumed By**: Dataset Materialization Engine
* **Persistence**: Ephemeral
* **Versioning Strategy**: None
* **Cross References**: `business-value-generation-engine.md`
* **Open Design Decisions**: None

### GeneratedDataset
* **Architecture Status**: STABLE
* **Purpose**: A materialized, deterministic, structurally valid dataset ready for execution.
* **Owner**: Dataset Materialization Engine
* **Lifecycle**: Materialized -> Enqueued -> Executed -> Archived.
* **Fields**: `id`, `specificationId`, `records`, `rowCount`, `materializationSeed`
* **Relationships**: Expanded from SemanticDatasetSpecification
* **Constraints**: Must contain no unresolved FK references.
* **Validation Rules**: Must precisely follow constraints in the specification.
* **Produced By**: Dataset Materialization Engine
* **Consumed By**: Task Workers (Execution)
* **Persistence**: Temporary (During execution)
* **Versioning Strategy**: None
* **Cross References**: `dataset-materialization-engine.md`
* **Open Design Decisions**: None
