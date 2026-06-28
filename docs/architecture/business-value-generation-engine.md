# Business Value Generation Engine

## Identity
* **Name**: Business Value Generation Engine
* **Architecture Status**: STABLE
* **Owner**: Intelligence Subsystem

## Purpose
* [REQUIREMENT] Generate semantic business specifications defining *what* the generated data should look like, without deciding *how much* data exists.

## Responsibilities
* [REQUIREMENT] Generate business archetypes (e.g., "Enterprise Customer", "Startup").
* [REQUIREMENT] Generate semantic constraints and logical relationships.
* [REQUIREMENT] Generate realistic statistical distributions for data fields.
* [REQUIREMENT] Generate organization characteristics.
* [REQUIREMENT] Generate domain-specific semantic values.

## Explicit Non-Responsibilities
* [REQUIREMENT] Must never produce millions of records (scaling is O(1) regarding dataset size).
* [REQUIREMENT] Must never assign primary keys.
* [REQUIREMENT] Must never resolve foreign keys.
* [REQUIREMENT] Must never materialize concrete datasets.
* [REQUIREMENT] Must never write to databases.

## Repository Rule
* [DESIGN_DECISION] Semantic generation and dataset expansion are permanently separated. The LLM is used **only** here to define semantics. The deterministic materializer expands those semantics.

## Inputs
* Canonical `GoalSpecification`
* Canonical Knowledge Graph Semantic Models

## Outputs
* Canonical `SemanticDatasetSpecification`

## Dependencies
* AI Provider Abstraction (for LLM inference)

## Consumers
* Dataset Materialization Engine

## Public Interfaces
* `generateSemantics(goal: GoalSpecification): SemanticDatasetSpecification`

## Internal Components
* Archetype Synthesizer
* Distribution Generator
* Constraint Mapper

## State
* Stateless Request/Response

## Produced Events
* `SemanticSpecificationGenerated`

## Consumed Events
* None

## Read Models
* Knowledge Graph (Context)

## Write Models
* None

## Algorithms Used
* Prompt construction and LLM structured JSON response validation.

## Failure Modes
* LLM hallucinations violating strict schema rules.

## Recovery Strategy
* Standard AI Provider retry loops with schema-correction prompting.

## Retry Strategy
* Defined by AI Provider subsystem.

## Performance Constraints
* LLM invocation count must be completely independent of dataset size. Generating a spec for 10 users must take the same time as a spec for 1,000,000 users.

## Security Constraints
* PII guardrails to ensure generated archetypes do not replicate sensitive known real-world entities.

## Configuration
* `LLM_MODEL_PREFERENCE`

## Testing Strategy
* Structural validation: Assert that regardless of goal size, exactly 1 LLM request is made, and the output matches the `SemanticDatasetSpecification` schema.

## Observability
* Metrics: LLM requests per goal, Spec generation latency.

## Open Design Decisions
* None

## Future Extension Points
* Industry-specific fine-tuned models for niche archetypes.

## Cross References
* `CORE_DATA_MODEL_SPECIFICATION.md`
