# Cross-Application Patterns

After analyzing the artifacts across all validated targets, several recurring patterns emerged that highlight gaps in the platform's heuristic assumptions.

## 1. Port Contention Blindness
**Affected Applications**: Plane, Twenty, Appsmith, ToolJet, OpenProject, Outline.
**Observation**: The platform heavily relies on developers specifying correct configuration URLs in `config.yaml`. However, it makes an implicit assumption that local loopback routes (`http://localhost:3000`) resolve to the intended Docker containers. 
**Pattern**: In environments where a local host process (like Vite or Next.js `test-app`) binds to `0.0.0.0:3000`, the Playwright browser is intercepted by the host before reaching the container network layer. The engine continues execution blissfully unaware of the substitution.

## 2. Identity Verification Gap
**Affected Applications**: All targets.
**Observation**: The `CapabilityDetector` and `SessionAcquisitionEngine` do not possess the ability to assert application identity. 
**Pattern**: As long as *any* DOM responds on the target URL, the platform will categorize it, crawl it, and declare `success: true`. There is no mechanism to cross-reference the observed DOM metadata (`<title>`, meta tags, known specific IDs) against a known signature of the target application (e.g., verifying that the app is actually Plane or Directus before attempting login).

## 3. Non-React Framework Disadvantage
**Affected Applications**: Directus
**Observation**: Directus is built on Vue.js. The `CapabilityDetector` reported `UNKNOWN` for both framework and routing mechanisms.
**Pattern**: The engine is currently highly biased toward React and Next.js applications, likely relying on React-specific hydration tags or synthetic event handlers to map state. When faced with Vue or Svelte shadow DOM patterns, the engine degrades to basic HTML analysis and loses its ability to infer complex routing logic.

## 4. Single Sign-On (SSO) / OIDC Hard-Stops
**Affected Applications**: Outline (and implicitly OpenProject).
**Observation**: Outline strictly enforces SSO for authentication and does not offer an email/password login form by default.
**Pattern**: The `SessionAcquisitionEngine` relies heavily on discovering inputs for `<input type="email">` and `<input type="password">`. When these are absent and only "Login with Google/OIDC" buttons exist, the engine will safely reveal the elements but gracefully exit without ever establishing a session, resulting in extremely shallow graphs.
