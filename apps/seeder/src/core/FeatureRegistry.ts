interface FeatureFlags {
    capabilityDetection: boolean;
    schemaEnrichment: boolean;
    accessibilityCapture: boolean;
    networkCapture: boolean;
    consoleCapture: boolean;
    screenshotCapture: boolean;
}

export class FeatureRegistry {
    private flags: FeatureFlags;

    constructor(initialFlags?: Partial<FeatureFlags>) {
        this.flags = {
            capabilityDetection: true,
            schemaEnrichment: true,
            accessibilityCapture: true,
            networkCapture: true,
            consoleCapture: true,
            screenshotCapture: true,
            ...initialFlags
        };
    }

    public isEnabled(feature: keyof FeatureFlags): boolean {
        return this.flags[feature];
    }

    public getFlags(): FeatureFlags {
        return { ...this.flags };
    }
}
