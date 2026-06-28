# Failure Analysis Report

## Overview
This report documents the objective runtime evidence collected during Pass 1 of the Cross-Application Validation Campaign. Seven applications were validated: Directus, Plane, Twenty, Appsmith, ToolJet, OpenProject, and Outline.

**Critical Discovery**: 
During the analysis, it was discovered that 6 of the 7 targets produced identical artifact metrics (`topology_facts`, `discovery`, `capability_profile`). Cross-referencing runtime environment tasks proved that the `test-app` scaffolding application was inadvertently left running on the host machine at `localhost:3000` via a background background process (`npm run dev`) that outlived its initial task scope.

Because Plane, Twenty, Appsmith, ToolJet, OpenProject, and Outline were all configured to expose port `3000`, the Playwright instance connecting to `http://localhost:3000` was consistently routed by the Docker host network loopback directly to the `test-app` rather than the deployed containers.

---

## 1. Directus

**Run ID**: `f4e17deb-8650-4ec2-b858-444c545b9c38`
**Target Port**: `8055` (Evaded the `localhost:3000` collision).

### Authentication
* **Did authentication genuinely complete?** No. 
* **Was the authenticated landing page reached?** No.
* **Was the session preserved?** No.
* **Evidence**: `discovery.json` recorded only 1 UI State, 0 Edges, 3 Actions, and 0 Mutation Surfaces. Directus utilizes Vue.js with a highly customized shadow-DOM/login flow that was not penetrated.

### Capability Detection
* **Framework**: UNKNOWN. (Directus uses Vue.js, but the capability detector failed to identify it).
* **Cause for UNKNOWN**: Implementation weakness (our detector relies heavily on React/Angular specific hydration markers and missed Vue artifacts).

### Discovery & Navigation
* **Pages Discovered**: 1
* **UI States**: 1
* **Navigation Edges**: 0
* **Verdict**: Premature stop. The engine failed to interact with the Directus login form or submit it.

### Safety
* **Safety policy**: Maintained. 0 destructive actions taken.

### Failure Classification
* **Discovery Failure**: The engine could not detect the login form elements.
* **Authentication Failure**: The session could not be established.
* **Generic Heuristic Weakness**: Capability detector failed to identify Vue.

---

## 2. Plane, Twenty, Appsmith, ToolJet, OpenProject, Outline

**Target Port**: `3000`

### Authentication
* **Did authentication genuinely complete?** No.
* **Was the authenticated landing page reached?** No.
* **Evidence**: The engine interacted with the `test-app` DOM (Buttons: "Logout", "New Company") instead of the target application.

### Capability Detection
* **Framework**: REACT (Correct for `test-app`, incorrect for some targets).
* **Cause for UNKNOWN**: N/A.

### Discovery & Navigation
* **Pages Discovered**: 1 (Route: `/`)
* **UI States**: 2
* **Navigation Edges**: 2
* **Mutation Surfaces**: 1 (`#create-company-form`)
* **Verdict**: Discovery stopped naturally because the `test-app` contains exactly 2 states.

### Safety
* **Safety policy**: Maintained. 

### Failure Classification
* **Infrastructure Failure**: The engine successfully crawled a target, but it was the *wrong* target. Port collisions compromised the runtime environment.
* **Implementation Bug**: The `SessionAcquisitionEngine` completely lacks an **Identity Verification** heuristic. It blindly accepts whatever DOM responds on the configured URL without cross-referencing it against expected Application Signatures (e.g., verifying `head > title` or specific core IDs).

---

## Conclusion
The validation campaign technically executed successfully across all targets, never crashing and properly emitting structured JSON bundles. However, objectively measuring the artifacts reveals massive **Discovery Failures** on non-standard frameworks (Directus) and a critical **Infrastructure Failure** compounded by an **Implementation Gap** (lack of identity verification) across the rest.
