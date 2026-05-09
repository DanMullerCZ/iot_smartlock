"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { CardContent } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
    AdminAccessLogsOverview,
    AdminAccessLogsRequestRow,
    AdminAccessLogsResultRow,
} from "@/lib/server/admin-access-logs";

import { AccessLogsRequestsTable } from "./access-logs-requests-table";
import { AccessLogsResultsTable } from "./access-logs-results-table";

function matchesRequest(row: AdminAccessLogsRequestRow, search: string, result: string) {
    const query = search.trim().toLowerCase();

    const matchesSearch =
        !query ||
        `${row.user.name} ${row.user.email} ${row.room.name} ${row.card.code}`
            .toLowerCase()
            .includes(query);

    const rowResult = row.accessResult?.result ?? "TIMEOUT";

    const matchesResultFilter = result === "ALL" || rowResult === result;

    return matchesSearch && matchesResultFilter;
}

function matchesResult(row: AdminAccessLogsResultRow, search: string, result: string) {
    const query = search.trim().toLowerCase();

    const request = row.accessRequest;

    const matchesSearch =
        !query ||
        `${request.user.name} ${request.user.email} ${request.room.name} ${request.card.code}`
            .toLowerCase()
            .includes(query);

    const matchesResultFilter = result === "ALL" || row.result === result;

    return matchesSearch && matchesResultFilter;
}

export function AccessLogsTabContent({ requests, results }: AdminAccessLogsOverview) {
    const [tab, setTab] = useState("requests");
    const [search, setSearch] = useState("");
    const [result, setResult] = useState("ALL");

    const filteredRequests = useMemo(() => {
        return requests.filter((row) => {
            return matchesRequest(row, search, result);
        });
    }, [requests, search, result]);

    const filteredResults = useMemo(() => {
        return results.filter((row) => {
            return matchesResult(row, search, result);
        });
    }, [results, search, result]);

    return (
        <CardContent className="space-y-4">
            <div className="inline-flex w-full space-x-4">
                <InputGroup>
                    <InputGroupInput
                        placeholder="Search user, room or card"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                        }}
                    />

                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                </InputGroup>

                <Select
                    value={result}
                    onValueChange={(v) => {
                        setResult(v);
                    }}
                >
                    <SelectTrigger className="w-1/4">
                        <SelectValue placeholder="Result" />
                    </SelectTrigger>

                    <SelectContent position="popper">
                        <SelectGroup>
                            <SelectLabel>Select</SelectLabel>
                            <SelectItem value="ALL">All results</SelectItem>
                            <SelectItem value="OK">Ok</SelectItem>
                            <SelectItem value="DENIED">Denied</SelectItem>
                            <SelectItem value="TIMEOUT">Timeout</SelectItem>
                            <SelectItem value="GENERIC_ERROR">Generic Error</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <Tabs value={tab} onValueChange={setTab}>
                <TabsList>
                    <TabsTrigger value="requests">Requests</TabsTrigger>
                    <TabsTrigger value="results">Results</TabsTrigger>
                </TabsList>

                <TabsContent value="requests">
                    <AccessLogsRequestsTable requests={filteredRequests} />
                </TabsContent>

                <TabsContent value="results">
                    <AccessLogsResultsTable results={filteredResults} />
                </TabsContent>
            </Tabs>
        </CardContent>
    );
}
