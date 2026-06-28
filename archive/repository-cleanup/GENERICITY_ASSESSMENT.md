# Genericity Assessment

This assessment categorizes the true genericity of the automated platform based strictly on the runtime evidence compiled in the `validation-matrix.json`.

## Validation Scope
- **Applications Validated**: 2 (1 live simulation via `test-app`, 1 failed qualification `plane` proving strict infrastructure trapping).
- **Diversity**: Currently limited to Vite/React architectures on localhost.

## Capability Classifications

### Proven
Capabilities successfully demonstrated on a single live target:
- **Generic Form Extractor**: Survived dynamic React forms without hardcoded IDs.
- **Rollback Selection Hierarchy**: Correctly bypassed Postgres/Prisma assumptions when capabilities were unavailable.

### Repeatedly Proven
Capabilities demonstrated across multiple independent executions (3 consecutive runs):
- **Deterministic Failure Classification**: Infrastructure and Auth errors consistently trapped into the 11 rigid failure modes.
- **Evidence Accumulation (Diffing)**: Safely merges multiple runs to establish `repeatability` metrics for Behavioral Constraints.

### Partially Proven
- **Prisma Schema Alignment**: Logic functions gracefully in isolation, but has not yet executed against a live target with a visible schema (reverted to "observation only").

### Unproven
Capabilities architected but lacking real-world evidence:
- **Authentication Portability**: The current credential injection assumes standard HTML `<input type="password">`. Auth models requiring OAuth, passkeys, or shadow DOM injection remain unvalidated.
- **Routing Strategy Resilience**: Has not yet proven capable of traversing highly complex SPA virtual routers beyond simple HTML5 history routing.

## Assumptions Analysis

**Surviving Assumptions:**
- UI forms generally map 1:1 with Backend API entities.
- Lack of offline DB logs (`pg_stat_statements`) can be compensated by falling back to a `non_reversible` deletion strategy.

**Failed Assumptions:**
- *Initial Architecture*: Assuming SQL logs would always be accessible led to the deprecation of `DatabaseObserver.ts`.
- *Initial Architecture*: Assuming multi-engine abstract orchestration was needed. This was resolved by collapsing everything into `index.ts`.
