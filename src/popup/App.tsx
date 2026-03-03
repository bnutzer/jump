import { t } from '../i18n';
import { useJumpMap } from '../hooks/useJumpMap';
import { useOnboarding } from '../hooks/useOnboarding';
import { useTheme } from '../shared/useTheme';
import Onboarding from './Onboarding';

function openUrl(url: string) {
    chrome.tabs.create({ url });
}

function openOptions() {
    chrome.runtime.openOptionsPage();
}

export default function App() {
    const { targets, loading: mapLoading } = useJumpMap();
    const {
        showOnboarding,
        loading: onboardingLoading,
        dismiss,
        reshow,
    } = useOnboarding();
    useTheme(); // apply stored theme

    if (mapLoading || onboardingLoading) {
        return <div className="popup-loading">{t('loading')}</div>;
    }

    return (
        <div className="popup">
            <header className="popup-header">
                <h1>{t('popupHeading')}</h1>
            </header>

            {showOnboarding ? (
                <Onboarding onDismiss={dismiss} />
            ) : targets.length === 0 ? (
                <div className="jump-empty">{t('popupEmpty')}</div>
            ) : (
                <ul className="jump-list">
                    {targets.map(({ key, url, description }) => (
                        <li
                            key={key}
                            className="jump-item"
                            onClick={() => openUrl(url)}
                        >
                            <span className="jump-key">{key}</span>
                            <span className="jump-desc">{description}</span>
                        </li>
                    ))}
                </ul>
            )}

            <footer className="popup-footer">
                {!showOnboarding && (
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            reshow();
                        }}
                    >
                        {t('popupShowOnboarding')}
                    </a>
                )}
                <a
                    className="footer-edit"
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        openOptions();
                    }}
                >
                    {t('popupEditTargets')}
                </a>
            </footer>
        </div>
    );
}
