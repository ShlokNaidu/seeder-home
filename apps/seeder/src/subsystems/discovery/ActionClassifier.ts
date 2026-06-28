import { Page, Locator } from 'playwright';
import { ActionClassification, Action } from '@seeder/contracts';
import { randomUUID } from 'node:crypto';

export class ActionClassifier {
    
    public async classifyActions(page: Page, stateId: string): Promise<Action[]> {
        const actions: Action[] = [];
        
        // Find all buttons and links
        const interactables = await page.locator('button, a, [role="button"]').all();
        
        for (let i = 0; i < interactables.length; i++) {
            const el = interactables[i];
            
            // Generate a deterministic selector path for this element so we can click it later
            const selector = await this.generateSelector(el);
            if (!selector) continue;

            const tagName = await el.evaluate(n => n.tagName.toLowerCase());
            const typeAttr = await el.getAttribute('type');
            const href = await el.getAttribute('href');
            const isInsideForm = await el.evaluate(n => !!n.closest('form'));

            let classification: ActionClassification = 'UNKNOWN';

            if (tagName === 'a') {
                if (href && (href.startsWith('http') || href.startsWith('mailto'))) {
                    classification = 'UNKNOWN'; // External
                } else if (href === '#' || !href) {
                    classification = 'SAFE_REVEAL'; // Likely a UI toggle
                } else {
                    classification = 'SAFE_NAVIGATION';
                }
            } else if (tagName === 'button' || await el.getAttribute('role') === 'button') {
                if (typeAttr === 'submit' || isInsideForm) {
                    classification = 'POTENTIAL_MUTATION';
                } else {
                    classification = 'SAFE_REVEAL'; // Assume it toggles something
                }
            }
            
            // For MVP, we ignore 'Logout' button explicitly to prevent killing session
            const text = await el.textContent() || '';
            if (text.toLowerCase().includes('logout')) {
                classification = 'UNKNOWN';
            }

            actions.push({
                id: randomUUID(),
                selector,
                type: 'click',
                classification,
                originStateId: stateId
            });
        }

        return actions;
    }

    private async generateSelector(locator: Locator): Promise<string | null> {
        // Since we are building an MVP, we can rely on IDs if available, or just a structural path
        return await locator.evaluate((el: Element) => {
            if (el.id) return `#${el.id}`;
            // If no ID, generate a unique nth-match path or simple tag path
            let path = el.tagName.toLowerCase();
            let parent = el.parentElement;
            while (parent && parent.tagName !== 'BODY' && parent.tagName !== 'HTML') {
                let index = 1;
                let sibling = el.previousElementSibling;
                while (sibling) {
                    if (sibling.tagName === el.tagName) index++;
                    sibling = sibling.previousElementSibling;
                }
                path = `${parent.tagName.toLowerCase()} > ${path}:nth-of-type(${index})`;
                el = parent;
                parent = el.parentElement;
            }
            return path;
        }).catch(() => null);
    }
}
