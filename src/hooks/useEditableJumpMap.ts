import { useState, useEffect, useMemo } from 'react';
import {
    JumpTarget,
    SortedJumpTarget,
    defaultJumpMap,
    MAX_TARGETS,
} from '../data/jumpMap';
import { t } from '../i18n';
import { loadJumpMap, saveJumpMap } from '../data/storage';

export type MutationResult = { ok: true } | { ok: false; reason: string };

export function useEditableJumpMap() {
    const [map, setMap] = useState<Record<string, JumpTarget> | null>(null);

    useEffect(() => {
        loadJumpMap().then(setMap);
    }, []);

    const targets: SortedJumpTarget[] = useMemo(() => {
        if (!map) {
            return [];
        }
        return Object.keys(map)
            .sort()
            .map((key) => ({ key, ...map[key] }));
    }, [map]);

    const loading = map === null;

    async function addTarget(
        key: string,
        target: JumpTarget,
    ): Promise<MutationResult> {
        if (!map) {
            return { ok: false, reason: t('errorNotLoaded') };
        }
        if (Object.keys(map).length >= MAX_TARGETS) {
            return {
                ok: false,
                reason: t('errorTooManyTargets', String(MAX_TARGETS)),
            };
        }
        if (key in map) {
            return { ok: false, reason: t('errorKeyExists', key) };
        }
        const next = { ...map, [key]: target };
        setMap(next);
        try {
            await saveJumpMap(next);
            return { ok: true };
        } catch {
            setMap(map);
            return { ok: false, reason: t('toastSaveFailed') };
        }
    }

    async function updateTarget(
        key: string,
        target: JumpTarget,
    ): Promise<MutationResult> {
        if (!map) {
            return { ok: false, reason: t('errorNotLoaded') };
        }
        const prev = map;
        const next = { ...map, [key]: target };
        setMap(next);
        try {
            await saveJumpMap(next);
            return { ok: true };
        } catch {
            setMap(prev);
            return { ok: false, reason: t('toastSaveFailed') };
        }
    }

    async function deleteTarget(key: string): Promise<MutationResult> {
        if (!map) {
            return { ok: false, reason: t('errorNotLoaded') };
        }
        const prev = map;
        const { [key]: _, ...rest } = map;
        setMap(rest);
        try {
            await saveJumpMap(rest);
            return { ok: true };
        } catch {
            setMap(prev);
            return { ok: false, reason: t('toastSaveFailed') };
        }
    }

    async function resetToDefaults(): Promise<MutationResult> {
        const prev = map;
        const next = { ...defaultJumpMap };
        setMap(next);
        try {
            await saveJumpMap(next);
            return { ok: true };
        } catch {
            setMap(prev);
            return { ok: false, reason: t('toastSaveFailed') };
        }
    }

    async function importMap(
        newMap: Record<string, JumpTarget>,
    ): Promise<MutationResult> {
        const prev = map;
        setMap(newMap);
        try {
            await saveJumpMap(newMap);
            return { ok: true };
        } catch {
            setMap(prev);
            return { ok: false, reason: t('toastSaveFailed') };
        }
    }

    return {
        targets,
        map,
        loading,
        addTarget,
        updateTarget,
        deleteTarget,
        resetToDefaults,
        importMap,
    };
}
