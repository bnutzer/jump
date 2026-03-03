import { JumpTarget, SortedJumpTarget } from './jumpMap';

const STORAGE_KEY = 'jumpTargets';

export async function loadJumpMap(): Promise<Record<string, JumpTarget>> {
    const result = await chrome.storage.sync.get(STORAGE_KEY);
    return (result[STORAGE_KEY] ?? {}) as Record<string, JumpTarget>;
}

export async function saveJumpMap(
    map: Record<string, JumpTarget>,
): Promise<void> {
    await chrome.storage.sync.set({ [STORAGE_KEY]: map });
}

export async function loadSortedTargets(): Promise<SortedJumpTarget[]> {
    const map = await loadJumpMap();
    return Object.keys(map)
        .sort()
        .map((key) => ({ key, ...map[key] }));
}

// --- Onboarding (chrome.storage.local — device-specific UI state) ---

const ONBOARDING_KEY = 'onboardingSeen';

export async function hasSeenOnboarding(): Promise<boolean> {
    const result = await chrome.storage.local.get(ONBOARDING_KEY);
    return result[ONBOARDING_KEY] === true;
}

export async function markOnboardingSeen(): Promise<void> {
    await chrome.storage.local.set({ [ONBOARDING_KEY]: true });
}

export async function resetOnboardingSeen(): Promise<void> {
    await chrome.storage.local.remove(ONBOARDING_KEY);
}
