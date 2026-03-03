import { useEffect, useState } from 'react';

export type ThemeChoice = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'jump-theme';

function getStoredTheme(): ThemeChoice {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
        return stored;
    }
    return 'system';
}

function resolveTheme(choice: ThemeChoice): 'light' | 'dark' {
    if (choice !== 'system') {
        return choice;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

function applyTheme(choice: ThemeChoice) {
    document.documentElement.setAttribute('data-theme', resolveTheme(choice));
}

export function useTheme() {
    const [theme, setThemeState] = useState<ThemeChoice>(getStoredTheme);

    function setTheme(choice: ThemeChoice) {
        localStorage.setItem(STORAGE_KEY, choice);
        setThemeState(choice);
        applyTheme(choice);
    }

    useEffect(() => {
        applyTheme(theme);

        if (theme !== 'system') {
            return;
        }

        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => applyTheme('system');
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [theme]);

    return { theme, setTheme } as const;
}
