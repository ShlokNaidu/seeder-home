# Technical Debt

## Architectural Drift
The codebase currently contains orphaned implementations that drifted from the final generic orchestrator architecture. These include:
- `apps/seeder/src/subsystems/correlation/CompletenessEvaluator.ts`
- `apps/seeder/src/subsystems/correlation/CorrelationEngine.ts`
- `apps/seeder/src/subsystems/probe/DatabaseObserver.ts`
- `apps/seeder/src/subsystems/probe/ProbeOrchestrationEngine.ts`

These classes are currently failing TS compilation because they import types that have been removed from `@seeder/contracts`. They have 0 inbound imports.

## Refactoring Debt
- `index.ts` contains dense try-catch logic and local variables. It could be marginally refactored for readability without altering behavior.
- Generic failure classification uses repetitive `if/else` checks string-matching error messages.

## Resolution Plan
1. Move the 4 ORPHAN files to `archive/pre-freeze/` and run `pnpm validate` to prove safe removal.
2. Refactor `index.ts` only for readability.
