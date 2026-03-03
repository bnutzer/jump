import { t } from '../i18n';
import { type ThemeChoice } from './useTheme';

interface Props {
    theme: ThemeChoice;
    setTheme: (choice: ThemeChoice) => void;
}

const options: { value: ThemeChoice; labelKey: string }[] = [
    { value: 'system', labelKey: 'themeAuto' },
    { value: 'light', labelKey: 'themeLight' },
    { value: 'dark', labelKey: 'themeDark' },
];

export default function ThemeToggle({ theme, setTheme }: Props) {
    return (
        <div className="theme-toggle">
            {options.map(({ value, labelKey }) => (
                <button
                    key={value}
                    className={`theme-toggle-btn${theme === value ? ' active' : ''}`}
                    onClick={() => setTheme(value)}
                    aria-pressed={theme === value}
                >
                    {t(labelKey)}
                </button>
            ))}
        </div>
    );
}
