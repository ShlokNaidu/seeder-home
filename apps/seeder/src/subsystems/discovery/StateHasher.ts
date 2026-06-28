import { createHash } from 'node:crypto';
import { Page } from 'playwright';

export class StateHasher {
    
    public async computeHash(page: Page): Promise<{ hash: string, snapshot: any }> {
        // Execute a script inside the browser context to extract a normalized structural snapshot
        const snapshot = await page.evaluate(`(() => {
            const getStructure = (el) => {
                const tag = el.tagName.toLowerCase();
                const isStructural = ['form', 'input', 'button', 'a', 'dialog', 'table', 'tr', 'td', 'th', 'nav'].includes(tag) 
                    || el.getAttribute('role') === 'dialog' 
                    || tag.startsWith('h');
                let children = [];
                for (const child of Array.from(el.children)) {
                    const childStruct = getStructure(child);
                    if (childStruct) children.push(childStruct);
                }
                if (!isStructural && children.length === 0) return null;
                const node = { tag };
                if (tag === 'input') {
                    node.type = el.getAttribute('type') || 'text';
                    node.name = el.getAttribute('name') || '';
                }
                if (tag === 'button' || tag === 'a') {
                    node.text = (el.textContent || '').replace(/[0-9]+/, '#').trim();
                }
                if (tag === 'form') {
                    node.id = el.id || '';
                }
                if (tag === 'table') {
                    node.rowCount = children.length;
                    children = [];
                }
                if (children.length > 0) node.children = children;
                return node;
            };
            return {
                path: window.location.pathname,
                structure: getStructure(document.body) || {}
            };
        })()`);

        // Compute hash
        const jsonString = JSON.stringify(snapshot);
        const hash = createHash('sha256').update(jsonString).digest('hex');

        return { hash, snapshot };
    }
}
