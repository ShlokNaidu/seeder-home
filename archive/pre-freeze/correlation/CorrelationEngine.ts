import { ProbeContext, ObservationGroup, RuntimeFact, Provenance } from '@seeder/contracts';
import { randomUUID } from 'node:crypto';

export class CorrelationEngine {
    
    public correlate(context: ProbeContext, group: ObservationGroup): RuntimeFact {
        // Group observations by source
        const networkObs = group.observations.filter(o => o.source === 'NETWORK');
        const dbObs = group.observations.filter(o => o.source === 'DATABASE');
        const domObs = group.observations.filter(o => o.source === 'DOM');

        // Identify primary request
        const primaryRequest = networkObs.find(o => o.type === 'request' && o.payload?.method === 'POST');
        // Identify primary response
        const primaryResponse = networkObs.find(o => o.type === 'response' && o.payload?.status === 200);
        // Identify primary database modification
        const primaryDb = dbObs.find(o => o.type === 'created');
        // Identify primary DOM outcome
        const primaryDom = domObs.find(o => o.type === 'modal_state');

        const provenance: Provenance = {
            probeId: context.probeId,
            mutationSurfaceId: context.mutationSurfaceId,
            uiStateId: context.stateHash, // In a real system, track exact stateId
            observationIds: group.observations.map(o => o.id) // Immutable pointers
        };

        const fact: RuntimeFact = {
            id: randomUUID(),
            entityType: context.entityType,
            businessOperation: 'CREATE',
            mutationSurfaceId: context.mutationSurfaceId,
            uiStateId: context.stateHash,
            requestObservationId: primaryRequest?.id || null,
            responseObservationId: primaryResponse?.id || null,
            databaseObservationId: primaryDb?.id || null,
            domObservationId: primaryDom?.id || null,
            provenance
        };

        return fact;
    }
}
