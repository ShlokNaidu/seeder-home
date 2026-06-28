# Session Acquisition Engine

## Identity
* **Name**: Session Acquisition Engine
* **Architecture Status**: STABLE
* **Owner**: Core Infrastructure

## Purpose
* [REQUIREMENT] Obtain an authenticated browser session against the target web application, regardless of the underlying authentication mechanism (credentials, session tokens, SSO, etc.).

## Responsibilities
* [REQUIREMENT] Parse session-related configuration from the Configuration Layer.
* [REQUIREMENT] Securely obtain and establish an active session state in the browser context.
* [REQUIREMENT] Expose the `AuthenticatedBrowserSession` to downstream consumers without exposing the underlying authentication mechanism.

## Explicit Non-Responsibilities
* [REQUIREMENT] Must NOT discover general application routes (owned by Discovery Engine).
* [REQUIREMENT] Must NOT mutate business state beyond the login transaction.
* [REQUIREMENT] Must NOT enforce a specific authentication strategy on downstream consumers.

## Repository Rule
* [DESIGN_DECISION] Downstream components may never assume a login page exists, username/password authentication, HTML form authentication, or a specific identity provider. They only depend on `AuthenticatedBrowserSession`.

## Inputs
* Project Configuration (via Configuration Layer)
* Credentials / Tokens (if required)

## Outputs
* `AuthenticatedBrowserSession` (Playwright Context)

## Dependencies
* Configuration Layer (from System Initialization)

## Consumers
* Discovery Engine
* Probe Engine

## Public Interfaces
* `acquireSession(config: SessionConfig): Promise<AuthenticatedBrowserSession>`

## Internal Components
* Strategy Selector (Credential, Token, SSO)
* Login Form Automator (for standard auth)
* Session State Injector (for pre-authenticated tokens)

## State
* Unauthenticated -> Acquiring -> SessionEstablished / Failed

## Produced Events
* `SessionAcquired`
* `SessionAcquisitionFailed`

## Consumed Events
* `SystemStarted`

## Read Models
* None

## Write Models
* None

## Algorithms Used
* Adaptive Strategy Resolution (Selects acquisition method based on provided config).

## Failure Modes
* Invalid credentials rejected by target.
* Blocked by MFA, CAPTCHA, or WAF.
* Expired session token provided.

## Recovery Strategy
* Prompt user to provide a fresh, pre-authenticated session cookie via Configuration if automated mechanisms fail.

## Retry Strategy
* 3 exponential backoff retries for network timeout errors. Fail immediately on explicit 401/403 authorization rejections.

## Performance Constraints
* Must complete session acquisition within 30 seconds.

## Security Constraints
* Credentials must never be logged to stdout, traces, or the Execution Registry.
* Session tokens must be stored securely in memory and isolated per crawl session.

## Configuration
* Requires `LOGIN_URL`, `USERNAME`, `PASSWORD` or `SESSION_COOKIE` or `STORAGE_STATE_JSON`.

## Testing Strategy
* See `testing/integration-tests.md` (Mock Login Endpoints, Mock Token Ingestion).

## Observability
* Trace: Acquisition start, Completion latency, Strategy used.
* Log: Obfuscated success/fail status.

## Open Design Decisions
* None

## Future Extension Points
* [FUTURE_EXTENSION] Automated handling of complex multi-step login flows (e.g., SSO redirects).
* [FUTURE_EXTENSION] Enterprise authentication providers integration.

## Cross References
* `SYSTEM_EXECUTION_FLOW.md` (System Initialization)
