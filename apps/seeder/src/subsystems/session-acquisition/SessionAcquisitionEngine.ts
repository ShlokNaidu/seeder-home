import { BrowserRuntime } from '@seeder/browser-runtime';

interface AuthenticatedBrowserSession {
    cookies: any[];
    origins: any[];
    traceId: string;
}

export class SessionAcquisitionEngine {
    constructor(private readonly runtime: BrowserRuntime) {}

    async acquireSession(url: string, email: string, password: string, artifactDir?: string): Promise<AuthenticatedBrowserSession> {
        console.log(`[SessionAcquisitionEngine] Navigating to ${url}`);
        await this.runtime.launch(true, artifactDir);
        const page = this.runtime.getPage();

        await this.runtime.navigate(url);
        
        // Wait a bit for the page to render fully
        await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

        if (artifactDir) {
            await page.screenshot({ path: `${artifactDir}/screenshots/before_auth.png` }).catch(() => {});
        }

        console.log(`[SessionAcquisitionEngine] Finding email input generically...`);
        const emailInput = page.locator('input[type="email"], input[name*="email" i], input[id*="email" i]').first();
        await emailInput.waitFor({ state: 'visible', timeout: 10000 });
        await emailInput.fill(email);

        console.log(`[SessionAcquisitionEngine] Finding password input generically...`);
        const passwordInput = page.locator('input[type="password"]').first();
        await passwordInput.fill(password);

        console.log(`[SessionAcquisitionEngine] Finding submit button generically...`);
        // Often it's button[type="submit"] or a button containing 'Login'/'Sign in'
        const submitBtn = page.locator('button[type="submit"], button:has-text("Log in"), button:has-text("Sign in"), button:has-text("Submit")').first();
        await submitBtn.click();

        console.log(`[SessionAcquisitionEngine] Waiting for navigation post-login...`);
        // Wait for the URL to change or network to settle as proof of login
        await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

        if (artifactDir) {
            await page.screenshot({ path: `${artifactDir}/screenshots/after_auth.png` }).catch(() => {});
        }

        const context = page.context();
        const state = await context.storageState();
        
        // Redact secrets and persist them directly here to avoid breaking runtime session
        if (artifactDir) {
            const redactedCookies = state.cookies.map(c => ({ ...c, value: '[REDACTED_SECRET]' }));
            const redactedOrigins = state.origins.map(o => ({
                ...o,
                localStorage: o.localStorage.map(ls => ({ ...ls, value: '[REDACTED_SECRET]' }))
            }));
            
            const fs = require('fs/promises');
            await fs.writeFile(`${artifactDir}/cookies-snapshot.json`, JSON.stringify(redactedCookies, null, 2)).catch(() => {});
            await fs.writeFile(`${artifactDir}/storage-snapshot.json`, JSON.stringify(redactedOrigins, null, 2)).catch(() => {});
        }

        return {
            cookies: state.cookies,
            origins: state.origins,
            traceId: this.runtime.getTraceId()
        };
    }
}
