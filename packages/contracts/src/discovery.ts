export type ActionClassification = 
  | 'SAFE_NAVIGATION'
  | 'SAFE_REVEAL'
  | 'POTENTIAL_MUTATION'
  | 'CONFIRMED_MUTATION'
  | 'UNKNOWN';

export interface UIState {
    id: string;
    stateHash: string;
    route: string;
    url: string;
    title: string;
    parentStateId?: string;
    // For logging/debugging
    structuralSnapshot?: any;
    navigationPath?: NavigationPath;
}

export interface Action {
    id: string;
    selector: string;
    type: 'click' | 'fill' | 'submit';
    classification: ActionClassification;
    originStateId: string;
    targetStateId?: string; 
}

export interface MutationSurface {
    id: string;
    stateId: string;
    formSelector?: string;
    inputs: Array<{ name: string; type: string; selector: string }>;
    submitActionId: string;
    navigationPath?: NavigationPath;
}

export interface ReadSurface {
    id: string;
    stateId: string;
    selector: string;
}

export interface NavigationEdge {
    sourceStateId: string;
    actionId: string;
    targetStateId: string;
}

export interface NavigationAction {
    selector: string;
    ariaRole?: string;
    accessibleName?: string;
    label?: string;
    text?: string;
    placeholder?: string;
    actionType: 'click' | 'fill' | 'hover';
}

export type NavigationPath = NavigationAction[];
