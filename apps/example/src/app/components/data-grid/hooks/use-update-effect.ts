import { useEffect, useRef } from 'react';

export function useUpdateEffect(effect: React.EffectCallback, deps: React.DependencyList) {
    const first = useRef(true);

    useEffect(() => {
        if (first.current) {
            first.current = false;
            return;
        }
        return effect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}
