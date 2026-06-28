import { Action, NavigationAction } from '@seeder/contracts';

type NavigationSafetyClassification = 'SAFE' | 'UNKNOWN' | 'UNSAFE';

export class NavigationSafetyEngine {
    
    public classifyAction(action: Action | NavigationAction): NavigationSafetyClassification {
        const type = (action as Action).type || (action as NavigationAction).actionType;
        const selector = action.selector.toLowerCase();

        // 1. Unsafe patterns
        if (type === 'submit') return 'UNSAFE';
        const unsafeKeywords = ['delete', 'remove', 'save', 'submit', 'update', 'confirm', 'logout'];
        if (unsafeKeywords.some(keyword => selector.includes(keyword))) {
            return 'UNSAFE';
        }
        
        // 2. Safe patterns
        if ((type as string) === 'hover') { return 'SAFE'; }
        const safeKeywords = ['nav', 'menu', 'tab', 'drawer', 'modal', 'dialog', 'accordion', 'link', 'href'];
        if (safeKeywords.some(keyword => selector.includes(keyword))) {
            return 'SAFE';
        }
        if (type === 'click' && (selector.includes('open') || selector.includes('expand'))) {
            return 'SAFE';
        }

        // 3. Fallback
        return 'UNKNOWN';
    }
}
