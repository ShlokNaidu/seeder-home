# Security

## Identity
* **Name**: Security
* **Architecture Status**: STABLE
* **Owner**: Core Infrastructure

## Purpose
* [REQUIREMENT] Define the security boundaries and isolation mechanisms.

## Domains

### Secret Management
* **Policy**: Passwords, API keys, and auth tokens are injected via environment variables and never persisted to the graph or logs.

### Credential Isolation
* **Policy**: The Session Acquisition Engine operates in isolation. Downstream systems receive an `AuthenticatedBrowserSession` without access to the underlying credentials.

### Database Safety
* **Policy**: The Cleanup Engine uses deterministic rollbacks based exclusively on the Execution Registry. Hard deletes are bounded by safety limits.

### Browser Sandboxing
* **Policy**: The Discovery and Probe engines execute within isolated Playwright browser contexts with strict memory limits and timeout bounds.

### Prompt Isolation
* **Policy**: LLM Prompts are strictly structured to prevent prompt injection from target application data (e.g., malicious DOM text).

### AI Provider Security
* **Policy**: Vendor-agnostic abstraction prevents vendor lock-in and isolates network traffic to authorized endpoints.

## Cross References
* `SYSTEM_ARCHITECTURE.md`
