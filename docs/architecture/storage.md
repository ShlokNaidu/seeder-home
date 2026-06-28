# Storage

## Identity
* **Name**: Storage
* **Architecture Status**: STABLE
* **Owner**: Core Infrastructure

## Purpose
* [REQUIREMENT] Define the persistence layer technologies and their architectural roles.

## Responsibilities
* Describe PostgreSQL usage.
* Describe Redis usage.
* Describe BullMQ usage.
* Describe File Storage usage.
* Describe Graph persistence.

## Technologies

### PostgreSQL
* **Role**: Primary relational store.
* **Usage**: Stores canonical models, Execution Logs, Configuration, and tabular representations of stable knowledge.

### Redis
* **Role**: In-memory data structure store.
* **Usage**: Caching, state hashing, deduplication buffers, and ephemeral event correlation windows.

### BullMQ
* **Role**: Message Queue.
* **Usage**: Execution Scheduler queueing, worker coordination, and retry backoff management.

### File Storage
* **Role**: Blob store.
* **Usage**: Stores `VisualObservation`s, large HAR traces, and generated artifacts that exceed DB size limits.

### Graph Persistence
* **Role**: Graph Database (e.g., Neo4j or Postgres-compatible graph extension).
* **Usage**: Stores the Runtime Graph and Knowledge Graph nodes, edges, and provenance lineages.

## Cross References
* `SYSTEM_ARCHITECTURE.md`
