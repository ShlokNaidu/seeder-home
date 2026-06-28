# Troubleshooting Guide

Seeder V1 traps all runtime failures into exactly 11 generic domains. If your execution aborts, find the classification below for remediation steps.

## Infrastructure Failure
**Symptom**: `fetch failed`, `ERR_CONNECTION_REFUSED`, `unreachable`.
**Resolution**: The target SaaS application is not actively running on the configured `url`. Verify your localhost docker-compose or dev server is bound correctly.

## Authentication Failure
**Symptom**: `Pipeline failed [Authentication Failure]`.
**Resolution**: Seeder attempts to find standard `<input type="email">` and `<input type="password">` fields. If the application uses complex OAuth, Magic Links, or shadow DOM rendering for login, Seeder cannot currently authenticate.

## Safety Policy Violation
**Symptom**: Action classified as `UNSAFE` was blocked.
**Resolution**: The Discovery Engine detected a potentially destructive generic action (e.g., `#delete-account-btn`). This is intended behavior during the exploration phase to prevent data corruption.

## Rollback Failure
**Symptom**: `Pipeline failed [Rollback Failure]`.
**Resolution**: Seeder mutated the application but lacked the capability to reverse the transaction (e.g. `pg_stat_statements` was disabled and the mutation was not generically reversible). Ensure PostgreSQL permissions are elevated.

## Implementation Bug
**Symptom**: `Pipeline failed [Implementation Bug]`.
**Resolution**: An unhandled TypeScript exception occurred. Please submit a GitHub issue with the attached `run.json` artifact bundle.
