# Implementation Gaps

This document translates the observed failures and cross-application patterns into actionable implementation gaps for Pass 3 (Generic Fixes).

## 1. Missing Target Verification Handshake (Critical)
**Root Cause**: The engine blindly connects to `http://localhost:<port>` and begins execution without verifying if the connected DOM corresponds to the expected `config.yaml` target.
**Confidence**: 100%
**Artifact Evidence**: `plane/run-.../discovery.json` explicitly shows the discovery of "Test App" elements instead of Plane.
**Recommended Action**: Implement an **Identity Handshake** phase within `SessionAcquisitionEngine` prior to execution. The engine should extract `<title>`, `<meta name="description">`, and key structural identifiers to verify they match expected heuristics (or user-provided metadata) for the target app. If the identity cannot be verified, execution should abort with an `InfrastructureError` instead of succeeding.

## 2. Inadequate Non-React Heuristics (High)
**Root Cause**: Capability detection rules prioritize React-specific data markers, leaving the engine helpless when interacting with Vue.js (Directus) or other shadow DOM implementations.
**Confidence**: 100%
**Artifact Evidence**: `directus/run-.../capability-profile.json` reports `UNKNOWN` for framework, leading to a shallow discovery of only 1 UI state.
**Recommended Action**: Expand `CapabilityDetector` inside `@seeder/browser-runtime`. Add heuristic profiles for Vue.js (e.g., detecting `__vue_app__` or `v-data` attributes), Angular (e.g., `ng-version`), and Svelte. The discovery engine needs generic fallback rules for Shadow DOM traversal when framework-specific synthetic events are unavailable.

## 3. Graceful Failure on SSO Lockouts (Medium)
**Root Cause**: When an application strictly forces OAuth/SAML (e.g., Outline), the `SessionAcquisitionEngine` correctly avoids destructive clicks, but exits gracefully as `success: true` despite having completely failed to acquire a session.
**Confidence**: High
**Artifact Evidence**: Logical deduction based on Outline's deployment constraints (requires OIDC) combined with generic engine architecture.
**Recommended Action**: Update `run.json` success criteria. If the engine determines it is blocked at an authentication gate (e.g., cannot bypass OAuth buttons) and has not reached the underlying application dashboard, it must classify the run as `success: false` with `failureReason: "AUTH_GATED_SSO"`.

## 4. Host/Docker Network Isolation Check (Low)
**Root Cause**: Developers often run local dev servers (Vite/Next.js) on port 3000 on the host machine while running Docker validation targets configured for the same port.
**Confidence**: 100%
**Artifact Evidence**: Widespread identical artifacts on port 3000 across 6 distinct targets.
**Recommended Action**: This is strictly an infrastructure/environmental issue. However, the CLI tool (`apps/seeder`) could implement a pre-flight port bind test or warning mechanism if the process bound to the target port does not belong to the docker network namespace.
