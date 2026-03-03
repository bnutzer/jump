import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateTarget, validateNewTarget } from './jumpTargetValidation';

// Mock chrome.i18n.getMessage so t() returns the message key
const mockGetMessage = vi.fn((key: string, subs?: string | string[]) => {
    const subList = Array.isArray(subs) ? subs : subs ? [subs] : [];
    return subList.length > 0 ? `${key}:${subList.join(',')}` : key;
});

vi.stubGlobal('chrome', {
    i18n: { getMessage: mockGetMessage },
});

beforeEach(() => {
    mockGetMessage.mockClear();
});

describe('validateTarget', () => {
    it('returns error when url is empty', () => {
        expect(validateTarget('', 'Some description')).toBe(
            'validationUrlRequired',
        );
    });

    it('returns error when url is invalid', () => {
        expect(validateTarget('not-a-url', 'Some description')).toBe(
            'validationUrlInvalid',
        );
    });

    it('returns error when description is empty', () => {
        expect(validateTarget('https://example.com', '')).toBe(
            'validationDescRequired',
        );
    });

    it('returns null for valid input', () => {
        expect(validateTarget('https://example.com', 'Example')).toBeNull();
    });
});

describe('validateNewTarget', () => {
    const existing = ['gh', 'yt'];

    it('returns error when key is empty', () => {
        expect(
            validateNewTarget('', 'https://example.com', 'Example', existing),
        ).toBe('validationKeyRequired');
    });

    it('returns error when key contains whitespace', () => {
        expect(
            validateNewTarget(
                'my key',
                'https://example.com',
                'Example',
                existing,
            ),
        ).toBe('validationKeyWhitespace');
    });

    it('returns error when key contains a tab', () => {
        expect(
            validateNewTarget(
                'my\tkey',
                'https://example.com',
                'Example',
                existing,
            ),
        ).toBe('validationKeyWhitespace');
    });

    it('returns error when key already exists', () => {
        const result = validateNewTarget(
            'gh',
            'https://example.com',
            'Example',
            existing,
        );
        expect(result).toBe('errorKeyExists:gh');
    });

    it('delegates to validateTarget for url/description checks', () => {
        expect(
            validateNewTarget('newkey', '', 'Example', existing),
        ).toBe('validationUrlRequired');

        expect(
            validateNewTarget('newkey', 'bad', 'Example', existing),
        ).toBe('validationUrlInvalid');

        expect(
            validateNewTarget('newkey', 'https://example.com', '', existing),
        ).toBe('validationDescRequired');
    });

    it('returns null for valid new target', () => {
        expect(
            validateNewTarget(
                'newkey',
                'https://example.com',
                'Example',
                existing,
            ),
        ).toBeNull();
    });
});
