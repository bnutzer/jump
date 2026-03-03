import { t } from '../i18n';

interface OnboardingProps {
    onDismiss: () => void;
}

export default function Onboarding({ onDismiss }: OnboardingProps) {
    return (
        <section className="onboarding">
            <h2 className="onboarding-title">{t('onboardingTitle')}</h2>
            <p className="onboarding-intro">{t('onboardingIntro')}</p>

            <ol className="onboarding-steps">
                <li>{t('onboardingStep1')}</li>
                <li>{t('onboardingStep2')}</li>
                <li>{t('onboardingStep3')}</li>
            </ol>

            <div className="onboarding-example">
                {t('onboardingExample')}
            </div>

            <button className="onboarding-dismiss" onClick={onDismiss}>
                {t('onboardingDismiss')}
            </button>
        </section>
    );
}
