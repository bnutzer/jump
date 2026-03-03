import { JumpTarget } from '../data/jumpMap';

type ImportResult =
    | { ok: true; map: Record<string, JumpTarget> }
    | {
          ok: false;
          error: 'invalidJson' | 'invalidStructure';
          failureKey?: string;
      };

function isValidTarget(target: Record<string, unknown>) {
    return (
        typeof target === 'object' &&
        target !== null &&
        typeof target.url === 'string' &&
        typeof target.description === 'string'
    );
}

export function parseAndValidateJumpMap(jsonString: string): ImportResult {
    let parsed: unknown;
    try {
        parsed = JSON.parse(jsonString);
    } catch {
        return { ok: false, error: 'invalidJson' };
    }

    if (
        typeof parsed !== 'object' ||
        parsed === null ||
        Array.isArray(parsed)
    ) {
        return { ok: false, error: 'invalidStructure' };
    }

    for (const [key, value] of Object.entries(parsed)) {
        const target = value as Record<string, unknown>;
        if (!isValidTarget(target)) {
            return { ok: false, error: 'invalidStructure', failureKey: key };
        }
    }

    return { ok: true, map: parsed as Record<string, JumpTarget> };
}
