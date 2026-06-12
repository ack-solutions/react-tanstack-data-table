export type SelectMode = 'page' | 'all';

export interface SelectionState {
    ids: string[];
    type: 'include' | 'exclude';
    selectMode?: SelectMode;
}
