# Seeder - Version 1 Release Candidate

## Implemented Capabilities
The following capabilities have been successfully proven against local evaluations (`test-app`):
- **Unsupervised Authentication**: Resolves generic credential barriers dynamically via DOM heuristic parsing.
- **Topological Discovery**: Constructs safe, comprehensive UI maps (`discovery-graph.json`) via headless crawling.
- **Generic Action Classification**: Categorizes UI triggers automatically as `SAFE_REVEAL` or `DANGEROUS` prior to execution.
- **Form Surface Modeling**: Dynamically converts DOM trees into generic `MutationSurface` structures without predefined routes.
- **Deterministic Pipeline Execution**: Funnels all execution states into a strict 11-category failure taxonomy.
- **Probe Capability Profiling**: Adjusts mutation strategies dynamically depending on DB capabilities (e.g., transaction-rollback, API-delete).
- **Behavioral Learning**: Discovers hidden server-side or frontend schema constraints strictly through iterative runtime exploration.

## Supported Environments
- OS: Linux (Ubuntu), macOS, Windows
- Runtime: Node.js 18+
- Package Manager: `pnpm` 8+
- Tested Architectures: CSR (Client-Side Rendering) React applications.

## Unsupported Scenarios
- **Complex Authentication**: OAuth, Magic Links, MFA, and SSO architectures are currently not supported.
- **Shadow DOM / Web Components**: Deep traversal of shadow roots for form discovery is limited.
- **Canvas / WebGL UIs**: Strictly unsupported. The platform relies on HTML5 DOM APIs.

## Known Limitations
- The Dataset Specification generation is operational and successfully outputs the schema, but the LLM phase that actually synthesizes localized CSV/JSON data based on this spec is not yet active.
- Current benchmarks are exclusively derived from `test-app` simulations on `localhost:3000`. Full production evaluations against `Plane` and `Twenty` remain pending CI capability expansions.

## Reproducible Validation Procedure
An external developer can replicate the V1 runtime evidence completely without repository-specific knowledge.

1. **Clone and Install**
   ```bash
   git clone https://github.com/organization/seeder.git
   cd seeder
   pnpm install
   pnpm build
   ```

2. **Execute Built-In Validation Simulation**
   This command autonomously launches the test SaaS app and sequentially discovers, models, and mutates it.
   ```bash
   pnpm validate --target test-app
   ```

3. **Verify Evidence Artifacts**
   The execution will output an artifact bundle inside `artifacts/test-app/latest/`. You can independently inspect:
   - `capability-profile.json`
   - `discovery.json`
   - `dataset-specification.json`
   - `run.json`
