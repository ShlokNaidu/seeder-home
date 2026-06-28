# System Execution Flow

## Architecture Status
STABLE

## Purpose
* [REQUIREMENT] Define the canonical runtime behavior of the entire platform. Describe every major runtime workflow from system initialization through cleanup. This document is the behavioral contract connecting architecture to implementation. No component document may redefine execution behavior already specified here.

## 1. System Initialization
* **Architecture Status**: DRAFT
* **Purpose**: Bootstrap the application, validate environment constraints, and authenticate against target systems.
* **Trigger**: System Startup / CLI Invocation
* **Inputs**: Project Inputs (URL, Credentials, DB Connection, Prisma Schema)
* **Outputs**: Authenticated Session, Validated DB Connection, Parsed Prisma AST
* **Producing Components**: Configuration Layer, Authentication Engine
* **Consuming Components**: Discovery Engine, Prisma Parser
* **State Transitions**: Uninitialized -> Configured -> Authenticated -> Ready
* **Error Conditions**: Invalid configuration; Authentication failure; Database connection timeout
* **Recovery Strategy**: Halt execution with fatal error; Prompt for configuration correction
* **Events Produced**: SystemStarted, AuthSuccess
* **Events Consumed**: None
* **Cross References**: `SYSTEM_ARCHITECTURE.md`, `api/configuration.md`
* **Open Design Decisions**: None

## 2. Discovery Flow
* **Architecture Status**: DRAFT
* **Purpose**: Crawl the application to identify navigation paths and mutation surfaces.
* **Trigger**: System Ready (AuthSuccess event)
* **Inputs**: Authenticated Browser Session
* **Outputs**: DiscoverySession, Route, UIState, NavigationEdge, ReadSurface, MutationSurface, WorkflowCandidate
* **Producing Components**: Discovery Engine
* **Consuming Components**: Runtime Observer, Probe Engine
* **State Transitions**: Idle -> Crawling -> Analyzing -> Completed
* **Error Conditions**: Browser crash; Blocked by CAPTCHA; Infinite navigation loop
* **Recovery Strategy**: Restart browser session; Ignore repetitive paths
* **Events Produced**: RouteDiscovered, SurfaceIdentified, DiscoveryComplete
* **Events Consumed**: AuthSuccess
* **Cross References**: `CORE_DATA_MODEL_SPECIFICATION.md`
* **Open Design Decisions**: None

## 3. Probe Flow
* **Architecture Status**: DRAFT
* **Purpose**: Safely interact with discovered surfaces to trigger and observe application behavior.
* **Trigger**: SurfaceIdentified Event / Probe Schedule
* **Inputs**: MutationSurface, ProbeSession
* **Outputs**: ActionNode, Raw DOM/Network Responses
* **Producing Components**: Probe Engine
* **Consuming Components**: Runtime Observer, Runtime Correlation Engine
* **State Transitions**: Scheduled -> Executing -> Observed -> Completed
* **Error Conditions**: Element not interactable; Timeout waiting for response
* **Recovery Strategy**: Retry with fallback selectors; Mark surface as unresponsive
* **Events Produced**: ProbeStarted, ProbeCompleted, InteractionFailed
* **Events Consumed**: SurfaceIdentified
* **Cross References**: `architecture/probe-engine.md`
* **Open Design Decisions**: None

## 4. Evidence Normalization Flow
* **Architecture Status**: STABLE
* **Purpose**: Transform heterogeneous runtime observations into canonical evidence records, preserving provenance while stripping transport-specific details.
* **Trigger**: ObservationCaptured
* **Inputs**: DOMObservation, NetworkObservation, RuntimeObservation, StorageObservation, AccessibilityObservation, DatabaseObservationReference, VisualObservation
* **Outputs**: Evidence
* **Producing Components**: Evidence Normalization Engine
* **Consuming Components**: Runtime Correlation Engine
* **State Transitions**: Raw Observation -> Normalized Evidence
* **Error Conditions**: Corrupted observation payload
* **Recovery Strategy**: Drop and log warning
* **Events Produced**: EvidenceNormalized
* **Events Consumed**: ObservationCaptured
* **Cross References**: `evidence-normalization-engine.md`
* **Open Design Decisions**: None

## 5. Knowledge Promotion Flow
* **Architecture Status**: STABLE
* **Purpose**: Evaluate and promote Runtime understanding into permanent Knowledge Graph records.
* **Trigger**: System Schedule or Planner directive
* **Inputs**: PromotionCandidate, Runtime Graph
* **Outputs**: PromotionDecision, KnowledgeUpdate, RejectionRecord
* **Producing Components**: Knowledge Promotion Engine
* **Consuming Components**: Knowledge Graph
* **State Transitions**: Candidate Evaluated -> Decision Recorded -> Graph Updated
* **Error Conditions**: Provenance broken
* **Recovery Strategy**: Emit RejectionRecord and defer
* **Events Produced**: PromotionDecisionEmitted
* **Events Consumed**: None
* **Cross References**: `knowledge-promotion-engine.md`
* **Open Design Decisions**: None

## 4b. Evidence Flow
* **Architecture Status**: DRAFT
* **Purpose**: Capture raw observations from multiple sources and bundle them as atomic evidence.
* **Trigger**: ProbeCompleted Event / Runtime Observation
* **Inputs**: Raw DOM, Network Traffic, Database State, Prisma Schema
* **Outputs**: Evidence, EvidenceBundle
* **Producing Components**: Runtime Observer, Prisma Parser
* **Consuming Components**: Runtime Knowledge Construction Engine
* **State Transitions**: Raw Observation -> Extracted Evidence -> Bundled Evidence
* **Error Conditions**: Unparseable response format; Missing correlation ID
* **Recovery Strategy**: Drop malformed evidence; Log warning
* **Events Produced**: EvidenceCaptured, BundleCreated
* **Events Consumed**: ProbeCompleted
* **Cross References**: `CORE_DATA_MODEL_SPECIFICATION.md`
* **Open Design Decisions**: None

## 5. Evidence Fusion Flow
* **Architecture Status**: DRAFT
* **Purpose**: Merge, score, and correlate evidence to form hypotheses in the Runtime Graph.
* **Trigger**: BundleCreated Event
* **Inputs**: EvidenceBundle, ConfidenceScore
* **Outputs**: RuntimeNode, RuntimeEdge, Updated Confidence
* **Producing Components**: Runtime Knowledge Construction Engine
* **Consuming Components**: Graph Promoters
* **State Transitions**: Uncorrelated -> Scored -> Merged into Runtime Graph
* **Error Conditions**: Contradictory evidence with equal confidence
* **Recovery Strategy**: Apply decay to older evidence; Request additional Probe
* **Events Produced**: HypothesisFormed, ConfidenceUpdated
* **Events Consumed**: BundleCreated
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`
* **Open Design Decisions**: None

## 6. Promotion Flow
* **Architecture Status**: DRAFT
* **Purpose**: Promote high-confidence Runtime subgraphs into permanent Knowledge Graph entities.
* **Trigger**: ConfidenceUpdated (Threshold crossed)
* **Inputs**: PromotionCandidate (Runtime Subgraph)
* **Outputs**: KnowledgeNode, KnowledgeEdge
* **Producing Components**: Runtime Correlation Engine (Graph Promoters)
* **Consuming Components**: Knowledge Graph, Planner
* **State Transitions**: Nominated -> Evaluated -> Promoted
* **Error Conditions**: Promotion violates Knowledge Graph invariants
* **Recovery Strategy**: Reject promotion; Mark Hypothesis as conflicting
* **Events Produced**: EntityPromoted, GraphVersionUpdated
* **Events Consumed**: ConfidenceUpdated
* **Cross References**: `GRAPH_MODEL_SPECIFICATION.md`
* **Open Design Decisions**: None

## 7. Planning Flow
* **Architecture Status**: DRAFT
* **Purpose**: Resolve entity dependencies and build an acyclic execution plan for database seeding.
* **Trigger**: System command to start Seeding / Knowledge Graph stable
* **Inputs**: KnowledgeNode, KnowledgeEdge (DEPENDS_ON)
* **Outputs**: ExecutionPlan, ExecutionStage, PlannerTask
* **Producing Components**: Planner
* **Consuming Components**: AI Provider, Seeder Engine
* **State Transitions**: Graph Traversal -> Dependency Resolution -> DAG Construction -> Plan Approved
* **Error Conditions**: Unresolvable circular dependency; Missing mandatory field mappings
* **Recovery Strategy**: Fail plan generation; Request manual intervention
* **Events Produced**: PlanGenerated, PlanApproved
* **Events Consumed**: EntityPromoted
* **Cross References**: `architecture/planner.md`
* **Open Design Decisions**: None

## 8. Generation Flow
* **Architecture Status**: DRAFT
* **Purpose**: Request semantic business values from the AI Provider to fulfill PlannerTasks.
* **Trigger**: ExecutionStage Started
* **Inputs**: PlannerTask, GenerationRequest, ValidationRule
* **Outputs**: GeneratedDataset, GenerationResult
* **Producing Components**: AI Provider
* **Consuming Components**: Seeder Engine
* **State Transitions**: Request Queued -> Processing -> Validating -> Fulfilled
* **Error Conditions**: AI Provider timeout; Response violates ValidationRule
* **Recovery Strategy**: Retry request; Apply prompt fallback strategies
* **Events Produced**: GenerationCompleted, GenerationFailed
* **Events Consumed**: PlanApproved
* **Cross References**: `architecture/llm-generation.md`
* **Open Design Decisions**: None

## 9. Seeding Flow
* **Architecture Status**: DRAFT
* **Purpose**: Write generated business datasets into the target environment according to the Execution Plan.
* **Trigger**: GenerationCompleted
* **Inputs**: GeneratedDataset, PlannerTask
* **Outputs**: Inserted Records, ExecutionRecord
* **Producing Components**: Seeder Engine
* **Consuming Components**: Execution Registry, Verification Engine
* **State Transitions**: Ready -> Executing Mutation -> Logging -> Completed
* **Error Conditions**: Database constraint violation; Target API rejection
* **Recovery Strategy**: Log failure; Abort dependent PlannerTasks
* **Events Produced**: MutationExecuted, TaskCompleted
* **Events Consumed**: GenerationCompleted
* **Cross References**: `CORE_DATA_MODEL_SPECIFICATION.md`
* **Open Design Decisions**: None

## 10. Verification Flow
* **Architecture Status**: DRAFT
* **Purpose**: Verify that a seeded mutation was successfully persisted and is visible in the application.
* **Trigger**: MutationExecuted
* **Inputs**: ExecutionRecord
* **Outputs**: Verified Status
* **Producing Components**: Verification Engine (Runtime Observer)
* **Consuming Components**: Execution Registry, Planner
* **State Transitions**: Unverified -> Checking -> Verified
* **Error Conditions**: Data not visible in UI; Record missing from Database
* **Recovery Strategy**: Retry verification with backoff; Mark task as failed
* **Events Produced**: VerificationSuccess, VerificationFailed
* **Events Consumed**: MutationExecuted
* **Cross References**: `architecture/execution-registry.md`
* **Open Design Decisions**: None

## 11. Cleanup Flow
* **Architecture Status**: DRAFT
* **Purpose**: Deterministically roll back the environment by deleting inserted records.
* **Trigger**: Cleanup Command / Fatal Plan Failure
* **Inputs**: ExecutionRecord (from Registry)
* **Outputs**: CleanupRecord, RollbackRecord
* **Producing Components**: Cleanup Engine
* **Consuming Components**: System Admin
* **State Transitions**: Reading Registry -> Executing Deletions -> Verifying -> Clean
* **Error Conditions**: Deletion fails due to cascading constraints
* **Recovery Strategy**: Re-order cleanup based on dependency graph; Warn user
* **Events Produced**: CleanupStarted, RollbackCompleted
* **Events Consumed**: VerificationSuccess
* **Cross References**: `architecture/cleanup-engine.md`
* **Open Design Decisions**: None

