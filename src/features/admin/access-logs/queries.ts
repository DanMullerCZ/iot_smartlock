import "server-only";

import { prisma } from "@/lib/db";

import type {
    AccessLogRequestRow,
    AccessLogResultRow,
    AccessLogsOverview,
    AccessResultEmbedded,
    AccessResultValue,
    CardType,
} from "./types";

interface ListAccessRequestsInput {
    skip: number;
    take: number;
    userId?: number;
    roomId?: number;
    cardId?: number;
    from?: Date;
    to?: Date;
}

interface ListAccessResultsInput {
    skip: number;
    take: number;
    result?: AccessResultValue;
    from?: Date;
    to?: Date;
}

interface ListAccessRequestsResult {
    requests: AccessLogRequestRow[];
    total: number;
}

interface ListAccessResultsResult {
    results: AccessLogResultRow[];
    total: number;
}

const accessResultEmbeddedSelect = {
    id: true,
    accessRequestId: true,
    result: true,
    completedAt: true,
} as const;

export const accessRequestSelect = {
    id: true,
    userId: true,
    user: { select: { id: true, name: true, email: true } },
    cardId: true,
    card: { select: { id: true, code: true, type: true } },
    roomId: true,
    room: { select: { id: true, name: true, location: true } },
    requestedAt: true,
    accessResult: { select: accessResultEmbeddedSelect },
} as const;

export const accessResultSelect = {
    id: true,
    accessRequestId: true,
    result: true,
    completedAt: true,
    accessRequest: { select: accessRequestSelect },
} as const;

function toAccessResultEmbedded(result: {
    id: bigint;
    accessRequestId: bigint;
    result: string;
    completedAt: Date;
}): AccessResultEmbedded {
    return {
        id: String(result.id),
        accessRequestId: String(result.accessRequestId),
        result: result.result as AccessResultValue,
        completedAt: result.completedAt.toISOString(),
    };
}

export function toAccessLogRequestRow(request: {
    id: bigint;
    userId: number;
    user: { id: number; name: string; email: string };
    cardId: number;
    card: { id: number; code: string; type: string };
    roomId: number;
    room: { id: number; name: string; location: string | null };
    requestedAt: Date;
    accessResult: {
        id: bigint;
        accessRequestId: bigint;
        result: string;
        completedAt: Date;
    } | null;
}): AccessLogRequestRow {
    return {
        id: String(request.id),
        userId: request.userId,
        user: request.user,
        cardId: request.cardId,
        card: { ...request.card, type: request.card.type as CardType },
        roomId: request.roomId,
        room: request.room,
        requestedAt: request.requestedAt.toISOString(),
        accessResult: request.accessResult ? toAccessResultEmbedded(request.accessResult) : null,
    };
}

export function toAccessLogResultRow(result: {
    id: bigint;
    accessRequestId: bigint;
    result: string;
    completedAt: Date;
    accessRequest: Parameters<typeof toAccessLogRequestRow>[0];
}): AccessLogResultRow {
    return {
        id: String(result.id),
        accessRequestId: String(result.accessRequestId),
        result: result.result as AccessResultValue,
        completedAt: result.completedAt.toISOString(),
        accessRequest: toAccessLogRequestRow(result.accessRequest),
    };
}

export async function getAccessLogsOverview(): Promise<AccessLogsOverview> {
    const [requests, results] = await Promise.all([
        prisma.accessRequest.findMany({
            select: accessRequestSelect,
            orderBy: { requestedAt: "desc" },
        }),
        prisma.accessResult.findMany({
            select: accessResultSelect,
            orderBy: { completedAt: "desc" },
        }),
    ]);

    return {
        requests: requests.map(toAccessLogRequestRow),
        results: results.map(toAccessLogResultRow),
    };
}

export async function listAccessRequests({
    skip,
    take,
    userId,
    roomId,
    cardId,
    from,
    to,
}: ListAccessRequestsInput): Promise<ListAccessRequestsResult> {
    const where = {
        ...(userId !== undefined && { userId }),
        ...(roomId !== undefined && { roomId }),
        ...(cardId !== undefined && { cardId }),
        ...((from ?? to) && {
            requestedAt: {
                ...(from && { gte: from }),
                ...(to && { lte: to }),
            },
        }),
    };

    const [requests, total] = await Promise.all([
        prisma.accessRequest.findMany({
            where,
            skip,
            take,
            orderBy: { requestedAt: "desc" },
            select: accessRequestSelect,
        }),
        prisma.accessRequest.count({ where }),
    ]);

    return { requests: requests.map(toAccessLogRequestRow), total };
}

export async function listAccessResults({
    skip,
    take,
    result,
    from,
    to,
}: ListAccessResultsInput): Promise<ListAccessResultsResult> {
    const where = {
        ...(result && { result }),
        ...((from ?? to) && {
            completedAt: {
                ...(from && { gte: from }),
                ...(to && { lte: to }),
            },
        }),
    };

    const [results, total] = await Promise.all([
        prisma.accessResult.findMany({
            where,
            skip,
            take,
            orderBy: { completedAt: "desc" },
            select: accessResultSelect,
        }),
        prisma.accessResult.count({ where }),
    ]);

    return { results: results.map(toAccessLogResultRow), total };
}

export async function getAccessRequestById(id: bigint): Promise<AccessLogRequestRow | null> {
    const request = await prisma.accessRequest.findUnique({
        where: { id },
        select: accessRequestSelect,
    });

    return request ? toAccessLogRequestRow(request) : null;
}

export async function getAccessResultById(id: bigint): Promise<AccessLogResultRow | null> {
    const result = await prisma.accessResult.findUnique({
        where: { id },
        select: accessResultSelect,
    });

    return result ? toAccessLogResultRow(result) : null;
}
