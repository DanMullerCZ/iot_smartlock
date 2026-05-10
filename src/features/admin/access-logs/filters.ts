import { accessLogSearchText, getRequestResult } from "./format";
import type { AccessLogRequestRow, AccessLogResultRow, AccessLogResultFilter } from "./types";

export function matchesAccessLogRequest(
    row: AccessLogRequestRow,
    search: string,
    result: AccessLogResultFilter,
) {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || accessLogSearchText(row).toLowerCase().includes(query);
    const matchesResult = result === "ALL" || getRequestResult(row) === result;

    return matchesSearch && matchesResult;
}

export function matchesAccessLogResult(
    row: AccessLogResultRow,
    search: string,
    result: AccessLogResultFilter,
) {
    const query = search.trim().toLowerCase();
    const matchesSearch =
        !query || accessLogSearchText(row.accessRequest).toLowerCase().includes(query);
    const matchesResult = result === "ALL" || row.result === result;

    return matchesSearch && matchesResult;
}
