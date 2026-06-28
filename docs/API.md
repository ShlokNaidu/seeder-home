# API Reference

The Seeder platform is an executable orchestration engine. It operates predominantly via automated CLI triggers rather than exposing an imported module API. 

## Command Line Interface
### `pnpm validate --target <target-name>`
Runs the comprehensive Validation Mode execution sequence against the specified `target-name` configuration (configured in `/validation-targets/`). Emits an execution bundle to `artifacts/`.

### `pnpm generate-reports`
Traverses the `artifacts/` history and compiles the global `validation-matrix.json` and `failure-backlog.json`.

## Core Types (`@seeder/contracts`)

### `MutationSurface`
Represents an actionable form discovered during the topological sweep.
```typescript
interface MutationSurface {
    id: string;
    route: string;
    inputs: FormInput[];
    navigationPath: ActionTrace[];
}
```

### `RuntimeCapabilityProfile`
Documents the offline capabilities of the execution target detected prior to running mutations.
```typescript
interface CapabilityProfile {
    probeCapabilities: {
        supportsTransactionSandbox: boolean;
        canDisposableDbReset: boolean;
        canPerformApiDelete: boolean;
    }
}
```
