import { useEffect, useContext } from 'react';
import { UNSAFE_NavigationContext as NavigationContext } from "react-router-dom";

function useBlocker(blocker, when = true) {
    const navigator = useContext(NavigationContext).navigator;

    useEffect(() => {
        if (!when) return;

        const unblock = navigator.block((tx) => {
            const autoUnblockingTx = {
                ...tx,
                retry() {
                    unblock();
                    tx.retry();
                },
            };
            blocker(autoUnblockingTx);
        });

        return unblock;
    }, [navigator, blocker, when]);
}
export function usePrompt(message, when = true) {
    useBlocker((tx) => {
        if (window.confirm(message)) {
            tx.retry();
        }
    }, when);
}
