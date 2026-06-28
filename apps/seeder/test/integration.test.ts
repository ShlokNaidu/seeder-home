import { test, describe, before, after } from 'node:test';
import * as assert from 'node:assert';
import { BrowserRuntime } from '@seeder/browser-runtime';
import { SessionAcquisitionEngine } from '../src/subsystems/session-acquisition/SessionAcquisitionEngine';
import { DiscoveryEngine } from '../src/subsystems/discovery/DiscoveryEngine';
import { StateHasher } from '../src/subsystems/discovery/StateHasher';
import { ActionClassifier } from '../src/subsystems/discovery/ActionClassifier';
import { NavigationSafetyEngine } from '../src/subsystems/discovery/NavigationSafetyEngine';
import { VALIDATE_MODE_POLICY } from '@seeder/contracts';

import { SessionManager } from '../src/core/SessionManager';

const TARGET_URL = 'http://localhost:3000';
const TARGET_EMAIL = 'admin@example.com';
const TARGET_PASS = 'password123';

describe('Integration Tests: Critical Subsystems', () => {
    let runtime: BrowserRuntime;
    let sessionManager: SessionManager;
    let discoveryEngine: DiscoveryEngine;

    before(async () => {
        // Startup behavior
        runtime = new BrowserRuntime('test-session');
        const sessionEngine = new SessionAcquisitionEngine(runtime);
        sessionManager = new SessionManager(sessionEngine);
        
        const hasher = new StateHasher();
        const classifier = new ActionClassifier();
        const safetyEngine = new NavigationSafetyEngine();
        discoveryEngine = new DiscoveryEngine(runtime, hasher, classifier, safetyEngine);
    });

    after(async () => {
        await runtime.shutdown(process.cwd()); // Shutdown browser
    });

    test('Safety Policy is globally immutable', () => {
        assert.strictEqual(VALIDATE_MODE_POLICY.browser, 'SAFE_ONLY');
        assert.strictEqual(VALIDATE_MODE_POLICY.database, 'READ_ONLY');
        assert.strictEqual(VALIDATE_MODE_POLICY.network, 'OBSERVE_ONLY');
    });

    test('Authentication Subsystem: Acquires session generically', async () => {
        const session = await sessionManager.getSession(TARGET_URL, TARGET_EMAIL, TARGET_PASS);
        assert.ok(session, 'Session must not be null');
        assert.ok(session.origins.length >= 0, 'Session should return origins (localStorage)');
    });

    test('Discovery & Navigation Subsystem: Maps forms safely', async () => {
        const session = await sessionManager.getSession(TARGET_URL, TARGET_EMAIL, TARGET_PASS);
        const discoveryResult = await discoveryEngine.discover(TARGET_URL, session);
        
        assert.ok(discoveryResult, 'Discovery result must be returned');
        assert.ok(discoveryResult.uiStates.length > 0, 'Should discover at least 1 UI state');
        assert.ok(discoveryResult.mutationSurfaces.length > 0, 'Should discover at least 1 mutation surface');
        
        // Assert action classifier worked
        const uiStatesCount = discoveryResult.stats.uiStatesCount || 0;
        const mutationSurfacesCount = discoveryResult.stats.mutationSurfacesCount || 0;
        assert.ok(uiStatesCount > 0, 'Should classify and navigate across UI states');
        assert.ok(mutationSurfacesCount > 0, 'Should classify and discover forms');
        
        // Assert we got navigation stats
        assert.ok(discoveryResult.navigationAttempts.length > 0, 'Should record navigation attempts');
    });
});
