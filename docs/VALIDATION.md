# Validation Strategy and History

This document serves as the historical ledger for Seeder's runtime validation proofs.

## Version 1 Release Candidate Status
The platform successfully advanced to V1 RC.
- **Unsupervised Authentication**: Proven against local validation endpoints.
- **Discovery Engine**: Proven navigation, generic state hashing, and Action classification.
- **Validation Execution**: All validation loops successfully process and write into strict `run.json` artifacts, mapping faults strictly against 11 Failure Domains.

## V1 Execution Matrix
Validation runs are processed organically. For detailed breakdowns of every run across target matrices, reference the dynamically generated `/validation-matrix.json` artifact at the root.

## Reproducibility
To replicate all internal validation simulations locally:
```bash
pnpm validate --target test-app
```
To validate against Plane:
```bash
pnpm validate --target plane
```
