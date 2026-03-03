export interface JumpTarget {
    url: string;
    description: string;
}

export interface SortedJumpTarget extends JumpTarget {
    key: string;
}

import defaults from './defaultJumpMap.json';

export const defaultJumpMap: Record<string, JumpTarget> = defaults;
