import { BrowserRuntime } from '@seeder/browser-runtime';
import { UIState, Action, MutationSurface, NavigationEdge, ReadSurface, NavigationAction, NavigationPath } from '@seeder/contracts';
import { StateHasher } from './StateHasher';
import { ActionClassifier } from './ActionClassifier';
import { NavigationSafetyEngine } from './NavigationSafetyEngine';
import { randomUUID } from 'node:crypto';
import { Page } from 'playwright';

interface NavigationAttempt {
    selector: string;
    strategy: string;
    success: boolean;
    reason: string;
    retries: number;
}

export class DiscoveryEngine {
    private visitedHashes = new Set<string>();
    private uiStates = new Map<string, UIState>();
    private actions = new Map<string, Action>();
    private edges: NavigationEdge[] = [];
    private mutationSurfaces: MutationSurface[] = [];
    private navigationAttempts: NavigationAttempt[] = [];
    
    private queue: { action: Action, pathFromRoot: NavigationPath }[] = [];
    
    // Coverage Metrics
    private discoveredSafeActionsCount = 0;
    private executedSafeActionsCount = 0;

    constructor(
        private runtime: BrowserRuntime,
        private hasher: StateHasher,
        private classifier: ActionClassifier,
        private safetyEngine: NavigationSafetyEngine
    ) {}

    public async discover(baseUrl: string, session: any): Promise<any> {
        console.log("Starting Discovery...");
        const startTime = Date.now();
        let hashCollisionCount = 0;
        let mergeCount = 0;

        // Root state
        const rootPage = await this.resetToState(baseUrl, session, []);
        const rootStateHashResult = await this.hasher.computeHash(rootPage);
        
        const rootState: UIState = {
            id: randomUUID(),
            stateHash: rootStateHashResult.hash,
            route: new URL(rootPage.url()).pathname,
            url: rootPage.url(),
            title: await rootPage.title(),
            structuralSnapshot: rootStateHashResult.snapshot
        };

        this.visitedHashes.add(rootState.stateHash);
        this.uiStates.set(rootState.id, rootState);

        await this.extractSurfaces(rootPage, rootState.id, []);
        const rootActions = await this.classifier.classifyActions(rootPage, rootState.id);
        
        for (const action of rootActions) {
            this.actions.set(action.id, action);
            const safety = this.safetyEngine.classifyAction(action);
            if (safety === 'SAFE' || action.classification === 'SAFE_REVEAL' || action.classification === 'SAFE_NAVIGATION') {
                this.queue.push({ action, pathFromRoot: [] });
                this.discoveredSafeActionsCount++;
            }
        }

        let iteration = 0;
        // BFS Traversal
        while (this.queue.length > 0 && iteration < 15) {
            iteration++;
            const { action, pathFromRoot } = this.queue.shift()!;
            this.executedSafeActionsCount++;
            console.log(`Executing action ${action.classification} on ${action.selector}`);

            const navAction: NavigationAction = {
                selector: action.selector,
                actionType: action.type as any
            };

            const page = await this.resetToState(baseUrl, session, pathFromRoot);
            
            // Execute the action with robust checks
            let success = false;
            let reason = 'Executed successfully';
            try {
                const locator = page.locator(action.selector).first();
                const isAttached = await locator.count() > 0;
                
                if (!isAttached) {
                    throw new Error('Element detached');
                }
                if (!(await locator.isVisible({ timeout: 500 }))) {
                    throw new Error('Element not visible');
                }
                if (await locator.isDisabled({ timeout: 500 })) {
                    throw new Error('Element disabled');
                }
                
                await locator.click({ timeout: 3000 });
                await page.waitForTimeout(1000); 
                success = true;
            } catch (e: any) {
                success = false;
                reason = e.message;
                console.log(`Failed to execute action ${action.selector}: ${reason}`);
            }

            this.navigationAttempts.push({
                selector: action.selector,
                strategy: action.selector.startsWith('#') ? 'id' : 'css_hierarchy',
                success,
                reason,
                retries: 0 // No retry loop inside this MVP, failed once means fail for this traversal
            });

            if (!success) continue;

            const stateHashResult = await this.hasher.computeHash(page);
            
            if (this.visitedHashes.has(stateHashResult.hash)) {
                hashCollisionCount++;
                mergeCount++;
                // Find the existing state
                const existingState = Array.from(this.uiStates.values()).find(s => s.stateHash === stateHashResult.hash);
                if (existingState) {
                    action.targetStateId = existingState.id;
                    this.edges.push({ sourceStateId: action.originStateId, actionId: action.id, targetStateId: existingState.id });
                }
                continue;
            }

            // New state discovered
            const newState: UIState = {
                id: randomUUID(),
                stateHash: stateHashResult.hash,
                route: new URL(page.url()).pathname,
                url: page.url(),
                title: await page.title(),
                parentStateId: action.originStateId,
                structuralSnapshot: stateHashResult.snapshot
            };

            this.visitedHashes.add(newState.stateHash);
            this.uiStates.set(newState.id, newState);
            
            action.targetStateId = newState.id;
            this.edges.push({ sourceStateId: action.originStateId, actionId: action.id, targetStateId: newState.id });

            const currentNavPath = [...pathFromRoot, navAction];
            await this.extractSurfaces(page, newState.id, currentNavPath);
            const newActions = await this.classifier.classifyActions(page, newState.id);
            
            for (const newAction of newActions) {
                this.actions.set(newAction.id, newAction);
                const safety = this.safetyEngine.classifyAction(newAction);
                if (safety === 'SAFE' || newAction.classification === 'SAFE_REVEAL' || newAction.classification === 'SAFE_NAVIGATION') {
                    this.queue.push({ action: newAction, pathFromRoot: currentNavPath });
                    this.discoveredSafeActionsCount++;
                }
            }
        }

        const duration = Date.now() - startTime;

        return {
            uiStates: Array.from(this.uiStates.values()),
            edges: this.edges,
            actions: Array.from(this.actions.values()),
            mutationSurfaces: this.mutationSurfaces,
            navigationAttempts: this.navigationAttempts,
            stats: {
                uiStatesCount: this.uiStates.size,
                edgesCount: this.edges.length,
                mutationSurfacesCount: this.mutationSurfaces.length,
                readSurfacesCount: 0,
                actionsCount: this.actions.size,
                navigationAttemptsCount: this.navigationAttempts.length,
                crawlDurationMs: duration,
                hashCollisionCount,
                duplicateStateMergeCount: mergeCount,
                discoveredSafeActionsCount: this.discoveredSafeActionsCount,
                executedSafeActionsCount: this.executedSafeActionsCount,
                visitedUiStatesCount: this.uiStates.size,
                discoveredUiStatesCount: this.uiStates.size + this.queue.length
            }
        };
    }

    private async resetToState(baseUrl: string, session: any, pathFromRoot: NavigationPath): Promise<Page> {
        // In a real app we'd spawn a new context. For this MVP we just reuse the runtime page and clear/inject storage
        const page = this.runtime.getPage();
        const context = page.context();
        
        // Inject session
        await context.addCookies(session.cookies);
        
        // We have to navigate first before setting localStorage
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

        // Reload to apply localStorage
        await page.goto(baseUrl);
        await page.waitForTimeout(500); // let UI settle

        // Replay actions
        for (const action of pathFromRoot) {
            if (action.actionType === 'click') {
                await page.click(action.selector, { timeout: 3000 });
                await page.waitForTimeout(500);
            }
        }

        return page;
    }

    private async extractSurfaces(page: Page, stateId: string, navigationPath: NavigationPath) {
        // Extract forms
        const forms = await page.locator('form').all();
        for (const form of forms) {
            const formSelector = await form.evaluate(el => el.id ? `#${el.id}` : 'form');
            const inputs = await form.locator('input').all();
            
            const surfaceInputs = [];
            for (const input of inputs) {
                const name = await input.getAttribute('name') || await input.getAttribute('id') || 'unknown';
                const type = await input.getAttribute('type') || 'text';
                const selector = await input.evaluate(el => el.id ? `#${el.id}` : 'input');
                surfaceInputs.push({ name, type, selector, id: randomUUID() });
            }

            const submitBtn = await form.locator('button[type="submit"]').first();
            let submitActionId = 'unknown';
            if (submitBtn) {
                const submitSelector = await submitBtn.evaluate(el => el.id ? `#${el.id}` : 'button[type="submit"]');
                submitActionId = submitSelector; 
            }

            this.mutationSurfaces.push({
                id: randomUUID(),
                stateId,
                formSelector,
                inputs: surfaceInputs,
                submitActionId,
                navigationPath
            });
        }
    }
}
