export const t = (key: string, ...subs: string[]) =>
    chrome.i18n.getMessage(key, subs);
