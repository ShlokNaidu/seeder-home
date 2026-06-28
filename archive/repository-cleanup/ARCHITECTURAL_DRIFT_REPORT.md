# Architectural Drift Report

## The Frozen Architecture
The canonical architecture mandates a strictly generic pipeline executing inside `index.ts`, generating passive JSON artifacts based purely on Runtime Observations.

## Detected Drift
Prior to the final implementation directive, the codebase experimented with creating explicit `ProbeOrchestrationEngine` and `CorrelationEngine` abstractions. 
These subsystems violated the frozen architectural mandate because they:
1. Attempted to establish new execution phases.
2. Hoped to parse DB SQL logs directly (`DatabaseObserver.ts`), which violates the capability-driven environment agnostic rule.

## Remediation
These specific files have been identified as `ARCHITECTURAL_DRIFT` and have exactly zero inbound imports. They will be relegated to `archive/pre-freeze/`.
