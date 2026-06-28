# Dataset Materialization Engine

## Identity
* **Name**: Dataset Materialization Engine
* **Architecture Status**: STABLE
* **Owner**: Execution Subsystem

## Purpose
* [REQUIREMENT] Expand a `SemanticDatasetSpecification` into deterministic, structurally valid datasets ready for execution.

## Responsibilities
* [REQUIREMENT] Perform deterministic expansion of archetypes into discrete rows.
* [REQUIREMENT] Preserve constraints across generated rows.
* [REQUIREMENT] Realize statistical distributions accurately across the dataset.
* [REQUIREMENT] Guarantee referential consistency (Foreign Key linking).
* [REQUIREMENT] Support parallel generation, chunking, and streaming of datasets.

## Explicit Non-Responsibilities
* [REQUIREMENT] Must never query LLMs.
* [REQUIREMENT] Must never invent semantics.
* [REQUIREMENT] Must never modify the Knowledge Graph.
* [REQUIREMENT] Must never plan execution or topological sorting.

## Repository Rule
* [DESIGN_DECISION] Semantic generation and dataset expansion are permanently separated. The deterministic materializer defines *how much* data exists and guarantees exact reproducibility.

## Inputs
* Canonical `SemanticDatasetSpecification`

## Outputs
* Canonical `GeneratedDataset`

## Dependencies
* Random Seed Generator

## Consumers
* Execution Scheduler / Task Workers

## Public Interfaces
* `materialize(spec: SemanticDatasetSpecification, seed: number, count: number): GeneratedDataset`
* `streamMaterialize(spec: SemanticDatasetSpecification, seed: number): AsyncIterable<GeneratedRecord>`

## Internal Components
* Deterministic PRNG (Pseudo-Random Number Generator)
* Distribution Sampler
* FK Binder
* Data Chunker

## State
* Stateless logic.

## Produced Events
* `DatasetMaterialized`

## Consumed Events
* None

## Read Models
* None

## Write Models
* None

## Algorithms Used
* Seeded Pseudo-Random Number Generation (e.g., PCG or Mersenne Twister).
* Probability distribution sampling.

## Failure Modes
* Memory exhaustion on exceedingly large dataset requests.

## Recovery Strategy
* Auto-fallback to chunking/streaming.

## Retry Strategy
* None (Generation is entirely deterministic).

## Performance Constraints
* Materialization must be horizontally scalable. Expanding 1 million rows must be partitionable across `N` workers.

## Security Constraints
* N/A

## Configuration
* `CHUNK_SIZE`

## Testing Strategy
* Determinism Test: Run materialization twice with identical `SemanticDatasetSpecification` and `Seed`. Assert the output `GeneratedDataset`s are byte-for-byte identical.
* FK Resolution Test: Assert output contains zero unlinked references.

## Observability
* Metrics: Rows generated per second, Memory footprint.

## Open Design Decisions
* None

## Future Extension Points
* Distributed Spark-style map-reduce materialization.

## Cross References
* `CORE_DATA_MODEL_SPECIFICATION.md`
