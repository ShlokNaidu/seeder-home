import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { randomUUID } from 'node:crypto';

export interface RuntimeEvent {
    type: 'network_request' | 'network_response' | 'console' | 'navigation' | 'dom_mutation' | 'marker';
    payload: any;
    timestamp: number;
    traceId: string;
}

export class BrowserRuntime {
    private browser: Browser | null = null;
    private context: BrowserContext | null = null;
    private page: Page | null = null;
    private traceId: string;
    private events: RuntimeEvent[] = [];

    constructor(traceId?: string) {
        this.traceId = traceId || randomUUID();
    }

    async launch(headless = true, artifactDir?: string): Promise<void> {
        this.browser = await chromium.launch({ headless });
        
        const contextOptions: any = {};
        if (artifactDir) {
            contextOptions.recordHar = {
                path: `${artifactDir}/network.har`
            };
        }
        
        this.context = await this.browser.newContext(contextOptions);
        
        if (artifactDir) {
            await this.context.tracing.start({ screenshots: true, snapshots: true, sources: true });
        }
        
        this.page = await this.context.newPage();

        this.setupInterceptors();
    }

    private setupInterceptors() {
        if (!this.page) return;

        this.page.on('console', msg => {
            this.events.push({
                type: 'console',
                payload: { type: msg.type(), text: msg.text() },
                timestamp: Date.now(),
                traceId: this.traceId
            });
        });

        this.page.on('request', async req => {
            let postData = null;
            try { postData = req.postDataJSON() || req.postData(); } catch(e){}
            this.events.push({
                type: 'network_request',
                payload: { url: req.url(), method: req.method(), postData },
                timestamp: Date.now(),
                traceId: this.traceId
            });
        });

        this.page.on('response', async res => {
            let body = null;
            try { 
                const buffer = await res.body();
                body = buffer.toString('utf-8'); 
            } catch(e){}
            this.events.push({
                type: 'network_response',
                payload: { url: res.url(), status: res.status(), body },
                timestamp: Date.now(),
                traceId: this.traceId
            });
        });
    }

    async navigate(url: string) {
        if (!this.page) throw new Error("Browser not launched");
        await this.page.goto(url);
    }

    async shutdown(artifactDir?: string): Promise<void> {
        if (this.context) {
            if (artifactDir) {
                await this.context.tracing.stop({ path: `${artifactDir}/trace.zip` }).catch(() => {});
            }
            await this.context.close().catch(() => {});
        }
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.context = null;
            this.page = null;
        }
    }

    getPage(): Page {
        if (!this.page) throw new Error("Browser not launched");
        return this.page;
    }

    getEvents(): RuntimeEvent[] {
        return this.events;
    }

    markEvent(name: string) {
        this.events.push({
            type: 'marker',
            payload: { name },
            timestamp: Date.now(),
            traceId: this.traceId
        });
    }

    getEventsBetween(startMarker: string, endMarker: string): RuntimeEvent[] {
        let startIndex = -1;
        let endIndex = -1;
        for (let i = 0; i < this.events.length; i++) {
            if (this.events[i].type === 'marker' && this.events[i].payload.name === startMarker) {
                startIndex = i;
            }
            if (this.events[i].type === 'marker' && this.events[i].payload.name === endMarker) {
                endIndex = i;
                break;
            }
        }
        if (startIndex === -1 || endIndex === -1) return [];
        return this.events.slice(startIndex + 1, endIndex);
    }

    getTraceId(): string {
        return this.traceId;
    }
}
