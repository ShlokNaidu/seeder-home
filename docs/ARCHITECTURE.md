# System Architecture

The Seeder platform uses a strictly capability-driven, generic orchestration pipeline. The core execution loop resides in `apps/seeder/src/index.ts`.

## Core Subsystems

### Session Acquisition Engine
Located in `apps/seeder/src/subsystems/session-acquisition/`.
Uses headless Playwright to navigate to a target application, generically discover email/password forms, execute a login, and capture the resulting HTTP cookies and LocalStorage origins.

### Discovery Engine
Located in `apps/seeder/src/subsystems/discovery/`.
Safely crawls the authenticated application to map UI topology and discover `MutationSurface` forms.
- **Action Classifier**: Uses heuristics to classify buttons as `SAFE_REVEAL` or `DANGEROUS`.
- **Navigation Safety Engine**: Traps mutations and ensures only read operations execute during the discovery phase.
- **State Hasher**: Generates unique identifiers for UI states to prevent infinite crawling loops.

### Runtime Capability Detector
Located in `apps/seeder/src/subsystems/discovery/RuntimeCapabilityDetector.ts`.
Probes the application offline to determine environmental capabilities (e.g. `transaction_sandbox`, `api_delete`, `disposable_db_reset`).

### Prisma Parser
Located in `apps/seeder/src/subsystems/schema/PrismaParser.ts`.
Optional subsystem that extracts entities and types from a `schema.prisma` file if available to enrich confidence weighting.

### Generic Probe Engine
Inline execution in `apps/seeder/src/index.ts`.
Applies discovered mutations against the SaaS application dynamically based on the capabilities found by the `RuntimeCapabilityDetector`. Traps backend responses and determines entity behaviors and relationships through passive observation.

## Strict Monorepo Boundaries
- `apps/*`: Active execution engines and applications (e.g., `seeder`, `test-app`).
- `packages/contracts`: Strictly defines typescript interfaces (e.g. `MutationSurface`, `CapabilityProfile`).
- `packages/browser-runtime`: Generic Playwright wrapper used universally across engines.
