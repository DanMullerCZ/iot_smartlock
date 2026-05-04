"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { Activity, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listAccessRequests, listAccessResults } from "@/lib/frontend/admin-api";
import type { AccessRequest, AccessResult, PaginationMeta } from "@/lib/frontend/admin-types";

function formatDate(value: string | null | undefined) {
    if (!value) {
        return "—";
    }

    return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

function matchesRequest(row: AccessRequest, search: string) {
    if (!search.trim()) {
        return true;
    }

    const query = search.trim().toLowerCase();
    return `${row.user.name} ${row.user.email} ${row.room.name} ${row.card.code}`
        .toLowerCase()
        .includes(query);
}

function matchesResult(row: AccessResult, search: string) {
    if (!search.trim()) {
        return true;
    }

    const request = row.accessRequest;
    const query = search.trim().toLowerCase();
    return `${request.user.name} ${request.user.email} ${request.room.name} ${request.card.code}`
        .toLowerCase()
        .includes(query);
}

export function AccessLogs() {
    const [tab, setTab] = useState("requests");
    const [search, setSearch] = useState("");
    const [result, setResult] = useState("all");
    const [requestPage, setRequestPage] = useState(1);
    const [resultPage, setResultPage] = useState(1);
    const [requests, setRequests] = useState<AccessRequest[]>([]);
    const [results, setResults] = useState<AccessResult[]>([]);
    const [requestMeta, setRequestMeta] = useState<PaginationMeta | null>(null);
    const [resultMeta, setResultMeta] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [requestResponse, resultResponse] = await Promise.all([
                listAccessRequests({ page: requestPage, limit: 10 }),
                listAccessResults({
                    page: resultPage,
                    limit: 10,
                    result: result === "all" ? undefined : result,
                }),
            ]);
            setRequests(requestResponse.data);
            setRequestMeta(requestResponse.meta);
            setResults(resultResponse.data);
            setResultMeta(resultResponse.meta);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Access logs failed to load.");
        } finally {
            setLoading(false);
        }
    }, [requestPage, result, resultPage]);

    useEffect(() => {
        void load();
    }, [load]);

    const requestColumns = useMemo(() => {
        return [
            {
                header: "User",
                cell: ({ row }: { row: { original: AccessRequest } }) => {
                    return `${row.original.user.name} · ${row.original.user.email}`;
                },
            },
            {
                header: "Room",
                cell: ({ row }: { row: { original: AccessRequest } }) => {
                    return row.original.room.name;
                },
            },
            {
                header: "Card",
                cell: ({ row }: { row: { original: AccessRequest } }) => {
                    return row.original.card.code;
                },
            },
            {
                header: "Result",
                cell: ({ row }: { row: { original: AccessRequest } }) => {
                    return row.original.accessResult ? (
                        <StatusBadge value={row.original.accessResult.result} />
                    ) : (
                        <StatusBadge value="TIMEOUT" />
                    );
                },
            },
            {
                header: "Requested",
                cell: ({ row }: { row: { original: AccessRequest } }) => {
                    return formatDate(row.original.requestedAt);
                },
            },
        ];
    }, []);

    const resultColumns = useMemo(() => {
        return [
            {
                header: "Result",
                cell: ({ row }: { row: { original: AccessResult } }) => {
                    return <StatusBadge value={row.original.result} />;
                },
            },
            {
                header: "User",
                cell: ({ row }: { row: { original: AccessResult } }) => {
                    return `${row.original.accessRequest.user.name} · ${row.original.accessRequest.user.email}`;
                },
            },
            {
                header: "Room",
                cell: ({ row }: { row: { original: AccessResult } }) => {
                    return row.original.accessRequest.room.name;
                },
            },
            {
                header: "Card",
                cell: ({ row }: { row: { original: AccessResult } }) => {
                    return row.original.accessRequest.card.code;
                },
            },
            {
                header: "Completed",
                cell: ({ row }: { row: { original: AccessResult } }) => {
                    return formatDate(row.original.completedAt);
                },
            },
        ];
    }, []);

    const filteredRequests = useMemo(() => {
        return requests.filter((row) => {
            return matchesRequest(row, search);
        });
    }, [requests, search]);

    const filteredResults = useMemo(() => {
        return results.filter((row) => {
            return matchesResult(row, search);
        });
    }, [results, search]);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Access Logs"
                description="Read-only audit history for access requests and completed controller results."
            />
            <Card>
                <CardHeader>
                    <CardTitle>Audit Trail</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-9"
                                placeholder="Search user, room, or card"
                                value={search}
                                onChange={(event) => {
                                    setSearch(event.target.value);
                                }}
                            />
                        </div>
                        <Select
                            value={result}
                            onValueChange={(value) => {
                                setResult(value);
                                setResultPage(1);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Result" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All results</SelectItem>
                                {["OK", "DENIED", "TIMEOUT", "GENERIC_ERROR"].map((option) => {
                                    return (
                                        <SelectItem key={option} value={option}>
                                            {option.replaceAll("_", " ")}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <Tabs value={tab} onValueChange={setTab}>
                        <TabsList>
                            <TabsTrigger value="requests">Requests</TabsTrigger>
                            <TabsTrigger value="results">Results</TabsTrigger>
                        </TabsList>
                        <TabsContent value="requests">
                            <DataTable
                                columns={requestColumns}
                                data={filteredRequests}
                                meta={requestMeta}
                                loading={loading}
                                onPageChange={setRequestPage}
                                empty={
                                    <EmptyState
                                        icon={Activity}
                                        title="No access requests"
                                        description="Device requests will appear here."
                                    />
                                }
                            />
                        </TabsContent>
                        <TabsContent value="results">
                            <DataTable
                                columns={resultColumns}
                                data={filteredResults}
                                meta={resultMeta}
                                loading={loading}
                                onPageChange={setResultPage}
                                empty={
                                    <EmptyState
                                        icon={Activity}
                                        title="No access results"
                                        description="Completed controller responses will appear here."
                                    />
                                }
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
