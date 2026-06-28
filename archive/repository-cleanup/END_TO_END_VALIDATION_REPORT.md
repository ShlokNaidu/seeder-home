# End-to-End Validation Report

## Target: test-app
### Entity: Company
**UI Surface -> Mutation Surface -> API Request -> Candidate Entity** (Proven by entity-mapping.json)

**Observed Behaviour & Constraints**

**Dataset Specification**
```json
{
  "name": "Company",
  "attributes": [
    {
      "name": "name",
      "type": "text"
    },
    {
      "name": "domain",
      "type": "text"
    }
  ],
  "observedConstraints": [],
  "creationRules": {
    "rollbackStrategy": "non_reversible"
  }
}
```

