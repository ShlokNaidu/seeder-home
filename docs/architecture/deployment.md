# Deployment

## Identity
* **Name**: Deployment
* **Architecture Status**: STABLE
* **Owner**: Core Infrastructure

## Purpose
* [REQUIREMENT] Define the deployment topology and scaling strategy.

## Architecture

### Worker Topology
* **Pattern**: Hub and Spoke. A central orchestrator dispatches tasks to `N` horizontally scaled workers.

### Docker
* **Pattern**: Containerized subsystems.
* **Images**: `data-seeder-core`, `data-seeder-worker`, `data-seeder-ui`.

### Environment Variables
* **Pattern**: Strictly typed `env` configuration for all stateful connections (DB, Redis, Groq).

### Scaling Strategy
* **Horizontal Scaling**: Task Workers scale linearly based on queue depth.
* **Queue Workers**: Managed via BullMQ. Separate queues for Discovery, Probing, and Seeding.

## Cross References
* `SYSTEM_ARCHITECTURE.md`
