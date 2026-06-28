import { Page } from 'playwright';

interface RuntimeCapabilityProfile {
    framework: string;
    routingStrategy: string;
    renderingStrategy: string;
    transportMechanisms: string[];
    formLibrary: string;
    probeCapabilities: {
        hasDirectDbAccess: boolean;
        hasPrismaSchema: boolean;
        supportsTransactionSandbox: boolean;
        canPerformApiDelete: boolean;
        canDisposableDbReset: boolean;
    };
}

export class RuntimeCapabilityDetector {
    
    public async detect(page: Page, config?: any): Promise<RuntimeCapabilityProfile> {
        console.log("[CapabilityDetector] Running lightweight capability profile...");

        try {
            await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
            
            const profile = await page.evaluate(() => {
            const result: RuntimeCapabilityProfile = {
                framework: 'UNKNOWN',
                routingStrategy: 'UNKNOWN',
                renderingStrategy: 'UNKNOWN',
                transportMechanisms: ['FETCH'], // Assume fetch by default
                formLibrary: 'UNKNOWN',
                probeCapabilities: {
                    hasDirectDbAccess: false,
                    hasPrismaSchema: false,
                    supportsTransactionSandbox: false,
                    canPerformApiDelete: false,
                    canDisposableDbReset: false
                }
            };

            // Framework detection heuristics
            if ((window as any).__NEXT_DATA__) {
                result.framework = 'NEXT_JS';
                result.renderingStrategy = 'SSR/SSG';
                result.routingStrategy = 'APP_ROUTER_OR_PAGES';
            } else if (document.querySelector('#__nuxt')) {
                result.framework = 'NUXT_JS';
            } else if ((window as any).angular) {
                result.framework = 'ANGULAR';
            } else if (Object.keys(window).find(k => k.startsWith('__REACT'))) {
                result.framework = 'REACT';
            }

            // Forms
            if (document.querySelector('form[data-hook-form]')) {
                result.formLibrary = 'REACT_HOOK_FORM';
            }

            return result;
            });

            if (config) {
                profile.probeCapabilities.hasDirectDbAccess = !!config.database?.connection;
                profile.probeCapabilities.hasPrismaSchema = !!config.schema?.path;
                // Currently defaults to false unless we explicitly implement API delete or DB resets later.
            }

            return profile;
        } catch (e: any) {
            console.warn(`[CapabilityDetector] Failed to detect capabilities: ${e.message}`);
            return {
                framework: 'UNKNOWN',
                routingStrategy: 'UNKNOWN',
                renderingStrategy: 'UNKNOWN',
                transportMechanisms: ['UNKNOWN'],
                formLibrary: 'UNKNOWN',
                probeCapabilities: {
                    hasDirectDbAccess: !!config?.database?.connection,
                    hasPrismaSchema: !!config?.schema?.path,
                    supportsTransactionSandbox: false,
                    canPerformApiDelete: false,
                    canDisposableDbReset: false
                }
            };
        }
    }
}
