import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;
const MOBILE_MEDIA_QUERY = `(max-width: ${String(MOBILE_BREAKPOINT - 1)}px)`;

function subscribe(callback: () => void): () => void {
    const mql = window.matchMedia(MOBILE_MEDIA_QUERY);

    mql.addEventListener("change", callback);

    return () => {
        mql.removeEventListener("change", callback);
    };
}

function getSnapshot(): boolean {
    return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

function getServerSnapshot(): boolean {
    return false;
}

export function useIsMobile(): boolean {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
