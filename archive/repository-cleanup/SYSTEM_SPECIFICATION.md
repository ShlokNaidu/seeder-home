# System Specification

## Architecture Status
STABLE

## Identity
Autonomous runtime understanding and database seeding platform.

## Purpose
* [REQUIREMENT] Autonomously understand an unknown SaaS application.
* [REQUIREMENT] Generate a realistic, fully populated development environment.
* [REQUIREMENT] Operate without source code, manual seed scripts, or application-specific configuration.

## Project Inputs
* [REQUIREMENT] Web Application URL
* [REQUIREMENT] Login Credentials
* [REQUIREMENT] PostgreSQL (Neon) Connection String
* [REQUIREMENT] Prisma Schema
* [DESIGN_DECISION] These inputs shall be provided through a configuration abstraction.
* [DESIGN_DECISION] Every subsystem receives validated configuration from the configuration layer.
* [DESIGN_DECISION] No subsystem may directly access environment variables, parse CLI arguments, or own configuration loading. Configuration ownership belongs to the Configuration Layer.

## High Level Philosophy & Architecture Principles
* [DESIGN_DECISION] Runtime First architecture.
* [DESIGN_DECISION] Runtime behaviour is authoritative.
* [DESIGN_DECISION] Prisma enriches runtime knowledge.
* [DESIGN_DECISION] The browser discovers behaviour.
* [DESIGN_DECISION] The database verifies behaviour.
* [DESIGN_DECISION] The Knowledge Graph stores verified knowledge.
* [DESIGN_DECISION] The Runtime Graph stores observations.
* [DESIGN_DECISION] Planner determines execution.
* [DESIGN_DECISION] LLM generates semantic business values.
* [DESIGN_DECISION] Execution Registry tracks mutations.
* [DESIGN_DECISION] Cleanup restores the environment.

## System Overview
[DESIGN_DECISION] Subsystems execute in the following sequential pipeline. Every subsystem owns exactly one responsibility.

1. Discovery Engine
2. Runtime Observer
3. Probe Engine
4. Evidence Engine
5. Evidence Fusion Engine
6. Runtime Graph
7. Knowledge Graph
8. Planner
9. AI Provider
10. Seeder
11. Execution Registry
12. Cleanup

## AI Architecture & Responsibilities

### Provider Configuration
* [DESIGN_DECISION] The platform shall expose a provider-independent AI abstraction. No subsystem except the AI Provider module may communicate directly with Groq.
* [DESIGN_DECISION] Provider is replaceable (Current: Groq).
* [DESIGN_DECISION] Configurable models (Current: Kimi K2, DeepSeek R1, Llama 4).
* [FUTURE_PROPOSAL] Support for OpenAI, Anthropic, Google, Ollama.
* [DESIGN_DECISION] All AI requests pass through a Provider abstraction. No module may directly depend on Groq.
* [DESIGN_DECISION] Business logic must never depend on a specific model.

### AI Provider Responsibilities
* [REQUIREMENT] Accept structured requests.
* [REQUIREMENT] Execute inference.
* [REQUIREMENT] Validate structured responses.
* [REQUIREMENT] Normalize provider-specific differences.
* [REQUIREMENT] Return provider-independent objects.
* [REQUIREMENT] Provider swappable, Model swappable, Prompt versioning, Structured JSON output, Retry support, Timeout handling, Rate-limit handling, Response validation.

### Allowed Responsibilities
* [REQUIREMENT] Generate realistic business values.
* [REQUIREMENT] Generate semantic entities.
* [REQUIREMENT] Produce structured JSON.

### Forbidden Responsibilities
* [REQUIREMENT] Discover entities.
* [REQUIREMENT] Discover workflows.
* [REQUIREMENT] Discover APIs.
* [REQUIREMENT] Discover routes.
* [REQUIREMENT] Determine foreign keys.
* [REQUIREMENT] Determine execution order.
* [REQUIREMENT] Modify Runtime Graph.
* [REQUIREMENT] Modify Knowledge Graph.
* [REQUIREMENT] Resolve dependencies.

## Technology Stack

| Component | Technology |
| :--- | :--- |
| **Language** | TypeScript |
| **Browser** | Playwright |
| **Database** | PostgreSQL, Neon |
| **Schema** | Prisma AST |
| **Validation** | Zod |
| **Queue** | BullMQ |
| **Cache** | Redis |
| **CLI** | Commander |
| **Logging** | Chalk |
| **Testing** | Vitest, Playwright |
| **Graph Storage** | PostgreSQL |
| **AI Provider** | Groq |


