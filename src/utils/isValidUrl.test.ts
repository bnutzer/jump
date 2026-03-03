import { describe, it, expect } from 'vitest';
import { isValidUrl } from './isValidUrl';

describe('isValidUrl', () => {
    it('accepts https URLs', () => {
        expect(isValidUrl('https://example.com')).toBe(true);
    });

    it('accepts http URLs', () => {
        expect(isValidUrl('http://example.com')).toBe(true);
    });

    it('accepts URLs with paths', () => {
        expect(isValidUrl('https://example.com/path/to/page')).toBe(true);
    });

    it('accepts URLs with query params', () => {
        expect(isValidUrl('https://example.com?foo=bar&baz=qux')).toBe(true);
    });

    it('accepts URLs with fragments', () => {
        expect(isValidUrl('https://example.com/page#section')).toBe(true);
    });

    it('rejects empty string', () => {
        expect(isValidUrl('')).toBe(false);
    });

    it('rejects plain text', () => {
        expect(isValidUrl('not a url')).toBe(false);
    });

    it('rejects missing protocol', () => {
        expect(isValidUrl('example.com')).toBe(false);
    });

    it('rejects just a protocol', () => {
        expect(isValidUrl('https://')).toBe(false);
    });

    it('rejects javascript: URLs', () => {
        expect(isValidUrl('javascript:alert(1)')).toBe(false);
    });

    it('rejects data: URLs', () => {
        expect(isValidUrl('data:text/html,<h1>hi</h1>')).toBe(false);
    });

    it('rejects file: URLs', () => {
        expect(isValidUrl('file:///etc/passwd')).toBe(false);
    });

    it('rejects ftp: URLs', () => {
        expect(isValidUrl('ftp://example.com')).toBe(false);
    });
});
