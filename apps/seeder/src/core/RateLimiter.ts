interface RateLimiterConfig {
    delayMs: number;
    jitterMs: number;
    maxRetries: number;
}

export class RateLimiter {
    private config: RateLimiterConfig;

    constructor(config?: Partial<RateLimiterConfig>) {
        this.config = {
            delayMs: 1000,
            jitterMs: 500,
            maxRetries: 3,
            ...config
        };
    }

    public async throttle(): Promise<void> {
        const jitter = Math.random() * this.config.jitterMs;
        const totalDelay = this.config.delayMs + jitter;
        await new Promise(resolve => setTimeout(resolve, totalDelay));
    }

    public checkResponse(status: number): void {
        if (status === 429) {
            throw new Error("SafetyPolicy Violation: HTTP 429 Too Many Requests. Aborting to protect target.");
        }
        if (status === 403) {
            // Very naive check for blocked/CAPTCHA responses
            console.warn("[RateLimiter] Detected HTTP 403. Potential CAPTCHA or anti-bot challenge.");
        }
    }
}
