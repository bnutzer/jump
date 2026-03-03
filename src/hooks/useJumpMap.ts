import { useState, useEffect } from 'react';
import { SortedJumpTarget } from '../data/jumpMap';
import { loadSortedTargets } from '../data/storage';

export function useJumpMap() {
    const [targets, setTargets] = useState<SortedJumpTarget[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSortedTargets().then((data) => {
            setTargets(data);
            setLoading(false);
        });
    }, []);

    return { targets, loading };
}
