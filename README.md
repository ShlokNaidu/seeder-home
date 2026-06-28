# Seeder V1

**Automated SaaS Data-Seeding Platform**

Seeder autonomously discovers, models, and mutates web applications using a capability-driven orchestration engine. It generates rich `dataset-specification.json` artifacts by learning an application's mutation surface through direct runtime exploration.

## Features
- **Application Agnostic**: Requires zero hardcoded selectors, routes, or framework integrations.
- **Capability-Driven**: Adapts to the target's environment (e.g. falling back to safe UI observation if direct DB access is blocked).
- **Deterministic Classification**: Traps all failures into 11 strict diagnostic domains.

## One-Command Installation
```bash
git clone https://github.com/organization/seeder.git
cd seeder
pnpm install
pnpm build
```

## Quick Start
```bash
# Validate against the internal simulation test app
pnpm validate --target test-app

# Validate against Plane (Localhost)
pnpm validate --target plane
```

For advanced configuration, please read `docs/SETUP.md`. If you encounter generic failures, consult `docs/TROUBLESHOOTING.md`.
