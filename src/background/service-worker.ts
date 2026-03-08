import { defaultJumpMap } from '../data/jumpMap';
import { loadJumpMap, saveJumpMap } from '../data/storage';

chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
        await saveJumpMap(defaultJumpMap);
        console.log('Seeded default jump targets into storage');
    }
});

function escapeXml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function msg(key: string, ...subs: string[]): string {
    return chrome.i18n.getMessage(key, subs) || key;
}

async function getUrlForShortcut(
    text: string,
): Promise<string | undefined> {
    const map = await loadJumpMap();
    const key = text.trim();
    if (key in map) return map[key].url;
    // Case-insensitive fallback
    const match = Object.keys(map).find(
        (k) => k.toLowerCase() === key.toLowerCase(),
    );
    return match ? map[match].url : undefined;
}

function openUrlForDisposition(url: string, disposition: string) {
    switch (disposition) {
        case 'currentTab':
            chrome.tabs.update({ url });
            break;
        case 'newForegroundTab':
            chrome.tabs.create({ url });
            break;
        case 'newBackgroundTab':
            chrome.tabs.create({ url, active: false });
            break;
    }
}

function buildAvailableKeysHint(keys: string[]): string {
    const displayKeys = keys
        .slice(0, 8)
        .map((k) => escapeXml(k))
        .join(', ');
    const suffix = keys.length > 8 ? ', \u2026' : '';
    return `${msg('omniboxDefaultHint')} <dim>\u2014 ${msg('omniboxAvailable', displayKeys + suffix)}</dim>`;
}

// Show available shortcuts when omnibox activates
chrome.omnibox.onInputStarted.addListener(async () => {
    const map = await loadJumpMap();
    const keys = Object.keys(map).sort();
    chrome.omnibox.setDefaultSuggestion({
        description: buildAvailableKeysHint(keys),
    });
});

// Provide live suggestions as the user types
chrome.omnibox.onInputChanged.addListener(async (text, suggest) => {
    const map = await loadJumpMap();
    const input = text.trim().toLowerCase();
    const entries = Object.entries(map).sort(([a], [b]) =>
        a.localeCompare(b),
    );

    // Update default suggestion based on current input
    const exactKey = Object.keys(map).find(
        (k) => k.toLowerCase() === input,
    );
    const exactMatch = exactKey ? map[exactKey] : undefined;

    if (exactMatch) {
        chrome.omnibox.setDefaultSuggestion({
            description: `<match>${escapeXml(exactMatch.description)}</match> <url>${escapeXml(exactMatch.url)}</url>`,
        });
    } else if (input) {
        chrome.omnibox.setDefaultSuggestion({
            description: `<dim>${escapeXml(msg('omniboxNoMatch'))}</dim>`,
        });
    } else {
        const keys = Object.keys(map).sort();
        chrome.omnibox.setDefaultSuggestion({
            description: buildAvailableKeysHint(keys),
        });
    }

    // Build suggestion list: prefix matches first, then other matches
    const prefixMatches: chrome.omnibox.SuggestResult[] = [];
    const otherMatches: chrome.omnibox.SuggestResult[] = [];

    for (const [key, target] of entries) {
        if (key.toLowerCase() === input) continue;

        const suggestion: chrome.omnibox.SuggestResult = {
            content: key,
            description: `<match>${escapeXml(key)}</match> <dim>\u2014</dim> ${escapeXml(target.description)} <url>${escapeXml(target.url)}</url>`,
        };

        if (!input || key.toLowerCase().startsWith(input)) {
            prefixMatches.push(suggestion);
        } else if (
            key.toLowerCase().includes(input) ||
            target.description.toLowerCase().includes(input)
        ) {
            otherMatches.push(suggestion);
        }
    }

    suggest([...prefixMatches, ...otherMatches]);
});

// Navigate to target or open options for unknown shortcuts
chrome.omnibox.onInputEntered.addListener(async (text, disposition) => {
    const url = await getUrlForShortcut(text);

    if (url === undefined) {
        chrome.runtime.openOptionsPage();
        return;
    }

    openUrlForDisposition(url, disposition);
});
