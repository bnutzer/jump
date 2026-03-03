import { useState, useEffect, useCallback } from 'react';
import {
    hasSeenOnboarding,
    markOnboardingSeen,
    resetOnboardingSeen,
} from '../data/storage';

export function useOnboarding() {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        hasSeenOnboarding().then((seen) => {
            setShowOnboarding(!seen);
            setLoading(false);
        });
    }, []);

    const dismiss = useCallback(() => {
        setShowOnboarding(false);
        markOnboardingSeen();
    }, []);

    const reshow = useCallback(() => {
        setShowOnboarding(true);
        resetOnboardingSeen();
    }, []);

    return { showOnboarding, loading, dismiss, reshow };
}
