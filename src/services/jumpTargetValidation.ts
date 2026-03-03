import { t } from '../i18n';
import { isValidUrl } from '../utils/isValidUrl';

export function validateTarget(
    url: string,
    description: string,
): string | null {
    if (!url) {
        return t('validationUrlRequired');
    }
    if (!isValidUrl(url)) {
        return t('validationUrlInvalid');
    }
    if (!description) {
        return t('validationDescRequired');
    }
    return null;
}

export function validateNewTarget(
    key: string,
    url: string,
    description: string,
    existingKeys: string[],
): string | null {
    if (!key) {
        return t('validationKeyRequired');
    }
    if (/\s/.test(key)) {
        return t('validationKeyWhitespace');
    }
    if (existingKeys.includes(key)) {
        return t('errorKeyExists', key);
    }
    return validateTarget(url, description);
}
