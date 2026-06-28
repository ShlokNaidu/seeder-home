# Implementation Status

| Subsystem | Status | Source Files | Exported API | Dependencies | Runtime Usage | Evidence |
|-----------|--------|--------------|--------------|--------------|---------------|----------|
| **SessionAcquisitionEngine** | Fully implemented | `apps/seeder/src/subsystems/session-acquisition/SessionAcquisitionEngine.ts` | `getSession(url, email, password, runDir)` | Playwright, `@seeder/browser-runtime` | Core Orchestrator (`index.ts`) | Autonomously authenticates to `test-app` without hardcoded selectors. |
| **DiscoveryEngine** | Fully implemented | `apps/seeder/src/subsystems/discovery/DiscoveryEngine.ts` | `discover(baseUrl, session)` | `ActionClassifier`, `StateHasher`, `NavigationSafetyEngine` | Core Orchestrator (`index.ts`) | Crawls UI, generates `discovery.json` and `discovery-graph.json`. |
| **PrismaParser** | Fully implemented | `apps/seeder/src/subsystems/schema/PrismaParser.ts` | `parseSchema(schemaPath)` | `fs/promises` | Core Orchestrator (`index.ts`) | Gracefully falls back to runtime observations when `schema.prisma` is absent. |
| **RuntimeCapabilityDetector** | Fully implemented | `apps/seeder/src/subsystems/discovery/RuntimeCapabilityDetector.ts` | `detectCapabilities()` | None | Core Orchestrator (`index.ts`) | Evaluates generic DB/API features, documented in `qualification.json`. |
| **Generic Probe Engine** | Fully implemented | `apps/seeder/src/index.ts` (Inline Generic Implementation) | N/A (Executes internally) | Playwright Network Interceptor | Core Orchestrator (`index.ts`) | Mutates surfaces, traps requests, evaluates rollbacks, outputs `mutation-surfaces.json`. |
| **CorrelationEngine** | Dead code | `archive/pre-freeze/correlation/CorrelationEngine.ts` | N/A | None (Archived) | None | Zero inbound imports. Removed due to architectural drift. |
| **ProbeOrchestrationEngine** | Dead code | `archive/pre-freeze/probe/ProbeOrchestrationEngine.ts` | N/A | None (Archived) | None | Replaced by generic inline probe engine. |
| **DatabaseObserver** | Dead code | `archive/pre-freeze/probe/DatabaseObserver.ts` | N/A | None (Archived) | None | Failed capability assumptions (pg_stat_statements). |
| **CompletenessEvaluator** | Dead code | `archive/pre-freeze/correlation/CompletenessEvaluator.ts` | N/A | None (Archived) | None | Never wired into execution. |
