import { describe, it, expect } from 'vitest';
import { parseAndValidateJumpMap } from './jumpMapImport';

describe('parseAndValidateJumpMap', () => {
    it('parses valid JSON with correct structure', () => {
        const input = JSON.stringify({
            gh: { url: 'https://github.com', description: 'GitHub' },
            yt: { url: 'https://youtube.com', description: 'YouTube' },
        });
        const result = parseAndValidateJumpMap(input);
        expect(result).toEqual({
            ok: true,
            map: {
                gh: { url: 'https://github.com', description: 'GitHub' },
                yt: { url: 'https://youtube.com', description: 'YouTube' },
            },
        });
    });

    it('accepts an empty object', () => {
        const result = parseAndValidateJumpMap('{}');
        expect(result).toEqual({ ok: true, map: {} });
    });

    it('returns invalidJson for malformed JSON', () => {
        const result = parseAndValidateJumpMap('not json');
        expect(result).toEqual({ ok: false, error: 'invalidJson' });
    });

    it('returns invalidJson for truncated JSON', () => {
        const result = parseAndValidateJumpMap('{"gh":');
        expect(result).toEqual({ ok: false, error: 'invalidJson' });
    });

    it('returns invalidStructure for an array', () => {
        const result = parseAndValidateJumpMap('[]');
        expect(result).toEqual({ ok: false, error: 'invalidStructure' });
    });

    it('returns invalidStructure for a string', () => {
        const result = parseAndValidateJumpMap('"hello"');
        expect(result).toEqual({ ok: false, error: 'invalidStructure' });
    });

    it('returns invalidStructure for null', () => {
        const result = parseAndValidateJumpMap('null');
        expect(result).toEqual({ ok: false, error: 'invalidStructure' });
    });

    it('returns invalidStructure with failureKey for entry missing url', () => {
        const input = JSON.stringify({
            gh: { description: 'GitHub' },
        });
        const result = parseAndValidateJumpMap(input);
        expect(result).toEqual({
            ok: false,
            error: 'invalidStructure',
            failureKey: 'gh',
        });
    });

    it('returns invalidStructure with failureKey for entry missing description', () => {
        const input = JSON.stringify({
            gh: { url: 'https://github.com' },
        });
        const result = parseAndValidateJumpMap(input);
        expect(result).toEqual({
            ok: false,
            error: 'invalidStructure',
            failureKey: 'gh',
        });
    });

    it('returns invalidStructure with failureKey for non-object entry', () => {
        const input = JSON.stringify({
            gh: 'https://github.com',
        });
        const result = parseAndValidateJumpMap(input);
        expect(result).toEqual({
            ok: false,
            error: 'invalidStructure',
            failureKey: 'gh',
        });
    });

    it('returns invalidStructure with failureKey for entry with wrong types', () => {
        const input = JSON.stringify({
            gh: { url: 123, description: 'GitHub' },
        });
        const result = parseAndValidateJumpMap(input);
        expect(result).toEqual({
            ok: false,
            error: 'invalidStructure',
            failureKey: 'gh',
        });
    });
});
