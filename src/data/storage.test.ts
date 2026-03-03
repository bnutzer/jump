import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    loadJumpMap,
    saveJumpMap,
    loadSortedTargets,
    hasSeenOnboarding,
    markOnboardingSeen,
    resetOnboardingSeen,
} from './storage';

// In-memory mock for chrome.storage areas
function createStorageAreaMock() {
    let store: Record<string, unknown> = {};
    return {
        get: vi.fn((keys: string | string[]) => {
            const keyList = typeof keys === 'string' ? [keys] : keys;
            const result: Record<string, unknown> = {};
            for (const k of keyList) {
                if (k in store) result[k] = store[k];
            }
            return Promise.resolve(result);
        }),
        set: vi.fn((items: Record<string, unknown>) => {
            Object.assign(store, items);
            return Promise.resolve();
        }),
        remove: vi.fn((keys: string | string[]) => {
            const keyList = typeof keys === 'string' ? [keys] : keys;
            for (const k of keyList) {
                delete store[k];
            }
            return Promise.resolve();
        }),
        _clear: () => {
            store = {};
        },
    };
}

const syncMock = createStorageAreaMock();
const localMock = createStorageAreaMock();

vi.stubGlobal('chrome', {
    storage: {
        sync: syncMock,
        local: localMock,
    },
});

beforeEach(() => {
    syncMock._clear();
    localMock._clear();
    vi.clearAllMocks();
});

describe('loadJumpMap', () => {
    it('returns empty object when storage is empty', async () => {
        const result = await loadJumpMap();
        expect(result).toEqual({});
    });

    it('returns stored map when present', async () => {
        const map = {
            gh: { url: 'https://github.com', description: 'GitHub' },
        };
        await syncMock.set({ jumpTargets: map });
        const result = await loadJumpMap();
        expect(result).toEqual(map);
    });
});

describe('saveJumpMap', () => {
    it('persists data that loadJumpMap can retrieve', async () => {
        const map = {
            yt: { url: 'https://youtube.com', description: 'YouTube' },
        };
        await saveJumpMap(map);
        const result = await loadJumpMap();
        expect(result).toEqual(map);
    });
});

describe('loadSortedTargets', () => {
    it('returns empty array when storage is empty', async () => {
        const result = await loadSortedTargets();
        expect(result).toEqual([]);
    });

    it('returns alphabetically sorted array with keys', async () => {
        const map = {
            yt: { url: 'https://youtube.com', description: 'YouTube' },
            gh: { url: 'https://github.com', description: 'GitHub' },
            am: { url: 'https://amazon.com', description: 'Amazon' },
        };
        await syncMock.set({ jumpTargets: map });

        const result = await loadSortedTargets();
        expect(result).toEqual([
            { key: 'am', url: 'https://amazon.com', description: 'Amazon' },
            { key: 'gh', url: 'https://github.com', description: 'GitHub' },
            { key: 'yt', url: 'https://youtube.com', description: 'YouTube' },
        ]);
    });
});

describe('onboarding helpers', () => {
    it('hasSeenOnboarding returns false initially', async () => {
        expect(await hasSeenOnboarding()).toBe(false);
    });

    it('markOnboardingSeen sets the flag', async () => {
        await markOnboardingSeen();
        expect(await hasSeenOnboarding()).toBe(true);
    });

    it('resetOnboardingSeen clears the flag', async () => {
        await markOnboardingSeen();
        expect(await hasSeenOnboarding()).toBe(true);

        await resetOnboardingSeen();
        expect(await hasSeenOnboarding()).toBe(false);
    });
});
