export function isValidUrl(s: string): boolean {
    try {
        const url = new URL(s);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}
