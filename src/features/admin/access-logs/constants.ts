import type { AccessLogResultFilter, AccessResultValue } from "./types";

export const ACCESS_RESULT_VALUES = ["OK", "GENERIC_ERROR", "DENIED", "TIMEOUT"] as const;
export const ACCESS_LOG_RESULT_FILTERS = ["ALL", ...ACCESS_RESULT_VALUES] as const;

export const ACCESS_RESULT_LABELS: Record<AccessResultValue, string> = {
    OK: "Ok",
    GENERIC_ERROR: "Generic error",
    DENIED: "Denied",
    TIMEOUT: "Timeout",
};

export const ACCESS_LOG_RESULT_FILTER_LABELS: Record<AccessLogResultFilter, string> = {
    ALL: "All results",
    ...ACCESS_RESULT_LABELS,
};
