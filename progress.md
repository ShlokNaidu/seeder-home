# Data Seeder Project - Handoff & Progress State

## 1. Current State of the Project
The project is currently in the **Productization & Validation Phase**. 
- **Architecture Freeze:** The architecture is completely frozen. No new engines, execution phases, or abstractions may be introduced.
- **Implementation Freeze:** The implementation logic is currently frozen for evidence collection.
- **Repository Hygiene:** A massive cleanup has been completed. Unused assets, mock data, and deprecated architectures were stripped. The codebase is lean and modular. (See `FINAL_HYGIENE_REPORT.md`).
- **Validation Campaign:** We have just completed Pass 1 (Evidence Collection) and Pass 2 (Failure Analysis) of the Cross-Application Validation Campaign on 7 diverse open-source SaaS applications (Directus, Plane, Twenty, Appsmith, ToolJet, OpenProject, Outline).
- **Next Immediate Step:** Begin **Pass 3 — Generic Implementation Fixes** to solve the objective gaps discovered during Pass 2.

## 2. Key Validation Discoveries (What to fix next)
During Pass 2, we generated three critical reports outlining generic bugs that must be fixed in Pass 3.
1. **Target Identity Handshake (Critical):** The `SessionAcquisitionEngine` currently connects blindly to `localhost:3000`. During Pass 1, a background `test-app` server intercepted traffic meant for 6 different Docker targets, resulting in false-positive identical graphs. The engine must verify the application identity before crawling.
2. **Vue.js / Non-React Heuristics (High):** The `CapabilityDetector` completely failed to understand Directus (Vue.js), leaving the graph blank because it heavily relies on React hydration markers.
3. **SSO / OIDC Deadlocks (Medium):** The engine must detect when an application strictly forces OAuth (like Outline) and emit a graceful `success: false` rather than claiming a shallow victory.

## 3. Strict Operating Directives for the Next Agent
- **No Speculative Engineering:** Do not refactor architecture. Do not build features you *think* might be useful.
- **Evidence-Based Only:** Every single code change in Pass 3 MUST map directly to a documented gap in `IMPLEMENTATION_GAPS.md`.
- **Generic Fallbacks:** If a target application fails, you must fix the generic heuristic in `@seeder/browser-runtime`, not hardcode application-specific branches (e.g., `if (app === 'plane')`).

---

## 4. Required Reading List for Context Recovery
If you are an AI agent picking up this workspace on a new machine, **READ THESE FILES IN ORDER** before writing any code:

### The Constraints & Rules
1. `AGENTS.md` (or `CLAUDE.md` / `GEMINI.md`) - Project-specific behavioral rules.
2. `FINAL_HYGIENE_REPORT.md` - Context on what was removed and why the repo is so minimal.

### The Architecture (How it works)
3. `docs/ARCHITECTURE.md` - The top-level system overview.
4. `docs/diagrams/high-level-architecture.md` - System bounds.
5. `docs/data-model/graph-schema.md` & `docs/data-model/runtime-schema.md` - The canonical structures all engines communicate with.
6. `docs/API.md` - Internal package boundaries.

### The Validation Outcomes (What you need to fix)
7. `FINAL_FAILURE_ANALYSIS_REPORT.md` - The objective evidence of where the engine failed.
8. `CROSS_APPLICATION_PATTERNS.md` - The logical deductions.
9. `IMPLEMENTATION_GAPS.md` - The literal roadmap for the code you need to write in Pass 3.

### The Code (Where to start looking)
10. `apps/seeder/src/index.ts` - The main CLI entry point. Follow the execution chain from here.
11. `packages/browser-runtime/src/BrowserRuntime.ts` - Where the port-collision identity bug and Vue.js capabilities need to be addressed.
