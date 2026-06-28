# Discovery Engine

## Identity
* **Name**: Discovery Engine
* **Architecture Status**: STABLE
* **Owner**: Discovery Subsystem

## Purpose
* [REQUIREMENT] Act as the platform's **Application Topology Discovery Engine**.
* [REQUIREMENT] Autonomously crawl the target application to discover every observable, non-mutating structural element.

## Responsibilities
* [REQUIREMENT] **Navigation**: Discover routes, menus, navigation trees, breadcrumbs, tabs, nested navigation, and dynamic routes.
* [REQUIREMENT] **Mutation Surfaces**: Discover forms, dialogs, drawers, editable tables, inline editors, wizards, and bulk editors. Identify them but never execute them.
* [REQUIREMENT] **Read Surfaces**: Discover tables, lists, cards, detail views, dashboards, calendars, and Kanban boards.
* [REQUIREMENT] **UI Topology**: Map parent-child page relationships, navigation graphs, reachability, and workflow entry points.
* [REQUIREMENT] **Interaction Opportunities**: Discover buttons, actions, context menus, overflow menus, and floating actions. Do not invoke mutating actions.
* [REQUIREMENT] **Application State**: Track visited states, state hashes, duplicate detection, and navigation history.

## Explicit Non-Responsibilities
* [REQUIREMENT] Must never submit forms.
* [REQUIREMENT] Must never mutate application data.
* [REQUIREMENT] Must never probe controls.
* [REQUIREMENT] Must never generate evidence.
* [REQUIREMENT] Must never observe database changes.
* [REQUIREMENT] Must never write to the Runtime Graph.
* [REQUIREMENT] Must never write to the Knowledge Graph.
* [REQUIREMENT] Must never generate business values.

## Architectural Rule
* [DESIGN_DECISION] **Discovery is PASSIVE**.
* Allowed interactions: Expand menu, open accordion, open drawer, switch tab, scroll, paginate, expand tree node (Passive Reveal).
* Forbidden interactions: Save, create, delete, update, confirm, submit, approve (Mutation).

## Inputs
* `AuthenticatedBrowserSession` (from Session Acquisition Engine)

## Outputs
* Canonical `DiscoverySession`
* Canonical `Route`
* Canonical `MutationSurface`
* Canonical `ReadSurface`
* Canonical `NavigationEdge`
* Canonical `WorkflowCandidate`
* Canonical `UIState`
* Canonical `StateHash`
* `NavigationSafetyClassification`

## Dependencies
* Session Acquisition Engine

## Consumers
* Runtime Observer
* Probe Engine

## Public Interfaces
* `startDiscovery(session: AuthenticatedBrowserSession, startUrl: string): Promise<DiscoverySession>`
* `pauseDiscovery(sessionId: string): void`

## Internal Components
* Structural DOM Walker
* Navigation Enumerator
* Surface Classifier
* Reachability Graph Builder
* State Hash Engine

## State
* Idle -> Crawling -> Passively Revealing -> Classifying -> Completed

## Produced Events
* `TopologyDiscovered`
* `SurfaceIdentified`
* `DiscoveryComplete`

## Consumed Events
* `SessionAcquired`

## Read Models
* None

## Write Models
* None (Writes only to ephemeral event streams)

## Algorithms Used
* Breadth-First Navigation (prioritizes shallow wide crawls).
* DOM Hash Deduplication (prevents re-crawling structurally identical pages).
* Visual/Structural Classification heuristics.

## Failure Modes
* Browser crash / Out of Memory.
* Infinite navigation loop (e.g., calendar widgets).
* Application session termination mid-crawl.

## Recovery Strategy
* Restart browser session automatically and resume from last known unvisited `Route` or `UIState`.
* Heuristically ignore repetitive path patterns based on `StateHash`.

## Retry Strategy
* Retry page loads up to 3 times on timeout.

## Performance Constraints
* Must process and hash a DOM structure in < 100ms.
* Must cap max open parallel tabs to prevent memory exhaustion (default: 3).

## Security Constraints
* Must respect standard browser sandbox limits.

## Configuration
* `MAX_DEPTH`
* `MAX_PAGES`
* `CONCURRENCY_LIMIT`

## Testing Strategy
* Run against local mock application containing infinite loops, dynamic forms, hidden routes, and diverse read surfaces.

## Observability
* Trace: Page load latency, DOM analysis latency.
* Metrics: Unique routes, surfaces, and UI states discovered per minute.

## Open Design Decisions
* None

## Future Extension Points
* Automated OpenAPI/Swagger scraping.
* SPA (Single Page Application) state machine inference.

## Cross References
* `CORE_DATA_MODEL_SPECIFICATION.md` (Canonical Models)
* `SYSTEM_EXECUTION_FLOW.md` (Discovery Flow)
