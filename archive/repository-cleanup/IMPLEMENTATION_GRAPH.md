# Implementation Graph

```mermaid
graph TD
    CLI(index.ts) --> Config(YAML Parser)
    CLI --> Session(SessionAcquisitionEngine)
    CLI --> Capability(RuntimeCapabilityDetector)
    CLI --> Discovery(DiscoveryEngine)
    
    Discovery --> Safety(NavigationSafetyEngine)
    Discovery --> Hash(StateHasher)
    Discovery --> Classify(ActionClassifier)
    
    CLI --> Probe(Generic Probe Mode in index.ts)
    Probe --> Network(Playwright Network Interception)
    Probe --> Rollback(Rollback Strategy Selector)
    
    CLI --> Artifacts(Run Dir)
    
    Reports(generate-reports.ts) --> Diff(Knowledge Merger)
    Reports --> E2E(END_TO_END_VALIDATION_REPORT)
```

## Dependency Classifications
- `apps/seeder/src/index.ts`: **ACTIVE**
- `apps/seeder/src/generate-reports.ts`: **ACTIVE**
- `apps/seeder/src/core/SessionManager.ts`: **ACTIVE**
- `apps/seeder/src/subsystems/discovery/DiscoveryEngine.ts`: **ACTIVE**
- `apps/seeder/src/subsystems/discovery/RuntimeCapabilityDetector.ts`: **ACTIVE**
- `apps/seeder/src/subsystems/discovery/StateHasher.ts`: **ACTIVE**
- `apps/seeder/src/subsystems/discovery/ActionClassifier.ts`: **ACTIVE**
- `apps/seeder/src/subsystems/session-acquisition/SessionAcquisitionEngine.ts`: **ACTIVE**
- `apps/seeder/src/subsystems/correlation/*`: **ORPHAN**
- `apps/seeder/src/subsystems/probe/*`: **ORPHAN**
