export interface JumpTarget {
    url: string;
    description: string;
}

export interface SortedJumpTarget extends JumpTarget {
    key: string;
}

export const MAX_TARGETS = 100;

import defaults from './defaultJumpMap.json';

export const defaultJumpMap: Record<string, JumpTarget> = defaults;
