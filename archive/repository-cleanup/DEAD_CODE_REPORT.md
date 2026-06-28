# Dead Code Report

The following files are definitively unreachable and are never imported or instantiated in the entire execution lifecycle.

| File Path | Classification | Reason |
|-----------|----------------|--------|
| `archive/pre-freeze/correlation/CorrelationEngine.ts` | DEAD | Attempted to introduce a non-generic execution phase. Replaced by unified generic orchestrator in `index.ts`. Zero inbound imports across monorepo. |
| `archive/pre-freeze/probe/ProbeOrchestrationEngine.ts` | DEAD | Drifted from architecture. Probe capabilities are now executed dynamically and capability-driven directly in `index.ts`. Zero inbound imports. |
| `archive/pre-freeze/probe/DatabaseObserver.ts` | DEAD | Violated capability-agnostic mandate by assuming `pg_stat_statements` would be available. Zero inbound imports. |
| `archive/pre-freeze/correlation/CompletenessEvaluator.ts` | DEAD | Theoretical stub. Never fully wired into the execution loop. Zero inbound imports. |

No code has been permanently deleted in accordance with the user directive, but these files are guaranteed unreachable.
