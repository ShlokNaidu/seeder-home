# Setup Guide

## System Requirements
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Playwright Chromium (automatically installed via `pnpm install`)

## Target Configuration
Every application you wish to validate against must have a corresponding configuration entry under `validation-targets/<target-name>/config.yaml`.

Example `validation-targets/quikit/config.yaml`:
```yaml
name: "Quikit Validation"
url: "http://localhost:3000"
credentials:
  email: "admin@quikit.local"
  password: "password123"
database:
  type: "postgresql"
  url: "postgresql://postgres:postgres@localhost:5432/quikit"
```

## Reproducible Validation
To run the orchestration loop and generate an artifact bundle:
```bash
pnpm validate --target <target-name>
```

This will output a timestamped run bundle into `artifacts/<target-name>/run-<timestamp>/`.

## Generating Reports
To re-compile the validation matrices, knowledge diffs, and benchmark scores across all targets:
```bash
pnpm generate-reports
```
