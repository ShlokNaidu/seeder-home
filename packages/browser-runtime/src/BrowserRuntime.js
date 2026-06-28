import { chromium } from 'playwright';
import { randomUUID } from 'crypto';
export class BrowserRuntime {
    browser = null;
    context = null;
    page = null;
    traceId;
    events = [];
    constructor(traceId) {
        this.traceId = traceId || randomUUID();
    }
    async launch(headless = true) {
        this.browser = await chromium.launch({ headless });
        this.context = await this.browser.newContext();
        this.page = await this.context.newPage();
        this.setupInterceptors();
    }
    setupInterceptors() {
        if (!this.page)
            return;
        this.page.on('console', msg => {
            this.events.push({
                type: 'console',
                payload: { type: msg.type(), text: msg.text() },
                timestamp: Date.now(),
                traceId: this.traceId
            });
        });
        this.page.on('request', req => {
            this.events.push({
                type: 'network',
                payload: { url: req.url(), method: req.method() },
                timestamp: Date.now(),
                traceId: this.traceId
            });
        });
    }
    async navigate(url) {
        if (!this.page)
            throw new Error("Browser not launched");
        await this.page.goto(url);
    }
    async shutdown() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.context = null;
            this.page = null;
        }
    }
    getPage() {
        if (!this.page)
            throw new Error("Browser not launched");
        return this.page;
    }
    getEvents() {
        return this.events;
    }
    getTraceId() {
        return this.traceId;
    }
}
