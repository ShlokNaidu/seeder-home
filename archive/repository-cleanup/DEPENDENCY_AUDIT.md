# Dependency Audit

## Execution Context
- Evaluated via `pnpm` topological workspace graph and `tsc --noEmit`.

## Results
- **Circular Dependencies**: `0`. The monorepo strictly enforces topological boundaries between `apps/seeder`, `packages/contracts`, `packages/browser-runtime`, etc.
- **Duplicate Packages**: `0`. `pnpm` workspace lockfile resolution ensures single-instance hoisting for shared dependencies like `playwright` and `esbuild`.
- **Version Conflicts**: `0`.
- **Unused Dependencies**: Identified `CorrelationEngine` imports in `package.json` that are no longer used.
- **Missing Dependencies**: `0`. The `tsc --noEmit` and `pnpm build` commands pass completely, guaranteeing all type and runtime references are resolvable.

All package relationships strictly flow from `apps/*` downward into `packages/*`. No `packages/*` reference `apps/*`.
