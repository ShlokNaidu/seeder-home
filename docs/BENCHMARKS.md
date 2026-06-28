# Benchmarks

Benchmarks are maintained as runtime-driven artifacts. The platform continuously tracks algorithmic efficiency, discovery throughput, and resource overhead.

## Latest Baseline Metrics
*(Sampled from local generic execution against V1 test-app endpoints)*

- **Discovery Throughput**: ~13 UI states mapped per minute.
- **Mutation Throughput**: ~20 generic form structures mapped per minute.
- **Peak Memory Profile**: ~9 MB Peak Heap utilization for core orchestrator.
- **Bundle Payload**: ~8 MB artifact bundles (including DOM screenshots, traces, and generated specs).
- **Execution Duration**: ~9 seconds end-to-end processing (Authentication → Discovery → Probe → Artifact Emission).

## Historical Benchmarking
The CI/CD pipeline enforces non-regression benchmarking.
For the absolute latest dynamically produced performance characteristics, refer to `product-benchmarks.json` located in the repository root.

To run the full suite dynamically:
```bash
npx tsx apps/seeder/src/benchmark.ts
```
