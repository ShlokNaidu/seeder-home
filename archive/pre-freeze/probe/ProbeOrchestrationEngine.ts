import { BrowserRuntime, AuthenticatedBrowserSession, RuntimeEvent } from '@seeder/browser-runtime';
import { MutationSurface, ProbeContext, ProbeResult, Observation, ObservationGroup } from '@seeder/contracts';
import { DatabaseObserver } from './DatabaseObserver';
import { randomUUID } from 'node:crypto';
import { Page } from 'playwright';

export class ProbeOrchestrationEngine {
    constructor(
        private runtime: BrowserRuntime,
        private dbObserver: DatabaseObserver
    ) {}

    public async executeProbe(
        baseUrl: string, 
        session: AuthenticatedBrowserSession, 
        surface: MutationSurface, 
        route: string, 
        stateHash: string
    ): Promise<ProbeResult> {
        console.log("Initializing ProbeContext...");
        const probeId = randomUUID();
        const expectedEntity = 'Company'; // Hardcoded for this vertical slice
        const signature = `probe-${expectedEntity.toLowerCase()}-${probeId}`;
        const startTime = Date.now();

        const context: ProbeContext = {
            probeId,
            sessionId: 'session-01',
            mutationSurfaceId: surface.id,
            timestamp: startTime,
            deterministicSeed: signature,
            expectedEntity,
            stateHash,
            route,
            entityType: expectedEntity
        };

        const group: ObservationGroup = {
            probeId,
            observations: []
        };

        const result: ProbeResult = {
            context,
            group,
            rollbackSuccess: false,
            durationMs: 0
        };

        // 1. Restore Browser State to the Mutation Surface
        const page = await this.resetToState(baseUrl, session);
        // We know from Discovery that to reach the MutationSurface for Company, we click 'New Company' modal
        // Since we didn't preserve the exact action queue for this MVP in the input, we'll quickly toggle it
        // based on the surface selector if it's hidden. 
        if (surface.formSelector === '#create-company-form') {
            await page.click('#open-new-company-modal');
            await page.waitForSelector(surface.formSelector);
        }

        // 2. PreSnapshot DOM (count modals, rows, alerts)
        const preDomCount = await page.locator('div[role="alert"]').count();

        // 3. Connect to DB & Arm PreSnapshot
        await this.dbObserver.connect();
        const preRowCount = await this.dbObserver.preSnapshot(expectedEntity);

        // 4. Arm Browser Observation
        this.runtime.markEvent('ProbeStart');

        // 5. Execute Probe
        console.log(`Executing probe on surface: ${surface.id} with seed: ${signature}`);
        for (const input of surface.inputs) {
            // Fill deterministic payload
            if (input.name === 'name') {
                await page.fill(input.selector, signature);
            } else if (input.name === 'domain') {
                await page.fill(input.selector, `${signature}.com`);
            }
        }
        
        await page.click(surface.submitActionId);

        // Wait for network idle to ensure the request went through and UI settled
        await page.waitForTimeout(1500); 

        // 6. End Browser Observation
        this.runtime.markEvent('ProbeEnd');
        const probeEvents = this.runtime.getEventsBetween('ProbeStart', 'ProbeEnd');

        // Process Network Events
        for (const ev of probeEvents) {
            if (ev.type === 'network_request' || ev.type === 'network_response') {
                group.observations.push({
                    id: randomUUID(),
                    probeId,
                    source: 'NETWORK',
                    type: ev.type === 'network_request' ? 'request' : 'response',
                    timestamp: ev.timestamp,
                    payload: ev.payload
                });
            }
        }

        // 7. PostSnapshot DOM
        const postDomAlerts = await page.locator('div[role="alert"]').count();
        // Since our test app uses `alert()`, Playwright auto-dismisses alerts by default.
        // We will just capture the fact that the modal closed as a DOM change.
        const isModalVisible = await page.locator(surface.formSelector || 'form').isVisible();
        if (!isModalVisible) {
            group.observations.push({
                id: randomUUID(),
                probeId,
                source: 'DOM',
                type: 'modal_state',
                timestamp: Date.now(),
                payload: { content: 'Modal was closed' }
            });
        }

        // 8. DB PostSnapshot & Diff
        const postRowCount = await this.dbObserver.postSnapshot(expectedEntity);
        console.log(`DB Row Count Pre: ${preRowCount}, Post: ${postRowCount}`);

        const createdRows = await this.dbObserver.locateProbeRecords(expectedEntity, signature);
        for (const row of createdRows) {
            group.observations.push({
                id: randomUUID(),
                probeId,
                source: 'DATABASE',
                type: 'created',
                timestamp: Date.now(),
                payload: row,
                metadata: { tableName: expectedEntity }
            });
        }

        // 9. Rollback
        console.log(`Rolling back records...`);
        const deletedCount = await this.dbObserver.rollback(expectedEntity, signature);
        
        // 10. Verification Final Snapshot
        const finalRowCount = await this.dbObserver.postSnapshot(expectedEntity);
        if (finalRowCount === preRowCount && deletedCount > 0) {
            result.rollbackSuccess = true;
        }

        await this.dbObserver.disconnect();
        
        result.durationMs = Date.now() - startTime;
        return result;
    }

    private async resetToState(baseUrl: string, session: AuthenticatedBrowserSession): Promise<Page> {
        const page = this.runtime.getPage();
        const context = page.context();
        await context.addCookies(session.cookies);
        await page.goto(baseUrl);
        await page.evaluate((origins) => {
            origins.forEach((o: any) => {
                if (window.location.origin === o.origin) {
                    o.localStorage.forEach((ls: any) => {
                        window.localStorage.setItem(ls.name, ls.value);
                    });
                }
            });
        }, session.origins);
        await page.goto(baseUrl);
        await page.waitForTimeout(500); 
        return page;
    }
}
