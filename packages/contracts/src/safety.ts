export type ExecutionMode = 'analyze' | 'validate' | 'probe' | 'seed';

export type DatabaseSafetyLevel = 'READ_ONLY' | 'READ_WRITE';
export type BrowserSafetyLevel = 'SAFE_ONLY' | 'MUTATION_ALLOWED';
export type NetworkSafetyLevel = 'OBSERVE_ONLY' | 'INTERCEPT_AND_MODIFY';
export type FileSystemSafetyLevel = 'ARTIFACTS_ONLY' | 'WRITE_ALLOWED';

export interface SafetyPolicy {
    database: DatabaseSafetyLevel;
    browser: BrowserSafetyLevel;
    network: NetworkSafetyLevel;
    filesystem: FileSystemSafetyLevel;
}

export const VALIDATE_MODE_POLICY: SafetyPolicy = {
    database: 'READ_ONLY',
    browser: 'SAFE_ONLY',
    network: 'OBSERVE_ONLY',
    filesystem: 'ARTIFACTS_ONLY'
};

export const PROBE_MODE_POLICY: SafetyPolicy = {
    database: 'READ_WRITE', // Allowed only on non-prod
    browser: 'MUTATION_ALLOWED',
    network: 'OBSERVE_ONLY',
    filesystem: 'ARTIFACTS_ONLY'
};
