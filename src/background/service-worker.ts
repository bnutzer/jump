import { defaultJumpMap } from '../data/jumpMap';
import { loadJumpMap, saveJumpMap } from '../data/storage';

chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
        await saveJumpMap(defaultJumpMap);
        console.log('Seeded default jump targets into storage');
    }
});

async function getUrlForShortcut(text: string): Promise<string | undefined> {
    const map = await loadJumpMap();
    if (text in map) {
        return map[text].url;
    }
    return undefined;
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

chrome.omnibox.onInputEntered.addListener(async (text, disposition) => {
    console.log('Looking up jump for shortcut ' + text);
    const url = await getUrlForShortcut(text);

    if (url === undefined) {
        console.log('Unknown jump target');
        return;
    }

    console.log('Opening jump url ' + url + ' (' + disposition + ')');
    openUrlForDisposition(url, disposition);
});
