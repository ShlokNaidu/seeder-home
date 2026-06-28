export interface ProbeContext {
    probeId: string;
    sessionId: string;
    mutationSurfaceId: string;
    timestamp: number;
    deterministicSeed: string; // e.g., probe-company-<probeId>
    expectedEntity: string;    // e.g., 'Company'
    stateHash: string;
    route: string;
    entityType: string;
}

export type ObservationSource = 'DOM' | 'NETWORK' | 'DATABASE' | 'CONSOLE' | 'STORAGE';

export interface Observation {
    id: string;
    probeId: string;
    source: ObservationSource;
    type: string;
    timestamp: number;
    payload: any;
    metadata?: Record<string, any>;
}

export interface ObservationGroup {
    probeId: string;
    observations: Observation[];
}

export interface ProbeResult {
    context: ProbeContext;
    group: ObservationGroup;
    rollbackSuccess: boolean;
    durationMs: number;
}
