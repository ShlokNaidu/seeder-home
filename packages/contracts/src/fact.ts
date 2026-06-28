export type EvidenceQuality = 'DIRECT' | 'INDIRECT' | 'HEURISTIC' | 'ASSUMED';

export interface ConfidenceVector {
    navigation: number;
    discovery: number;
    topology: number;
    schema: number;
    observationCompleteness: number;
}

export interface Provenance {
    observationIds?: string[];
    evidenceQuality: EvidenceQuality;
    uiStateId?: string;
    mutationSurfaceId?: string;
    schemaMatchId?: string;
}

export interface ObservedTopologyFact {
    id: string;
    factType: 'PAGE' | 'NAVIGATION_PATH' | 'FORM' | 'INPUT' | 'MODAL' | 'DRAWER' | 'TABLE' | 'READ_SURFACE';
    description: string;
    provenance: Provenance;
    confidence: ConfidenceVector;
    metadata: any;
}
