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

import { ACCESS_LOG_RESULT_FILTER_LABELS, ACCESS_LOG_RESULT_FILTERS } from "../constants";
import { matchesAccessLogRequest, matchesAccessLogResult } from "../filters";
import type { AccessLogResultFilter, AccessLogsOverview } from "../types";
import { AccessLogsRequestsTable } from "./access-logs-requests-table";
import { AccessLogsResultsTable } from "./access-logs-results-table";

export function AccessLogsTabContent({ requests, results }: AccessLogsOverview) {
    const [tab, setTab] = useState("requests");
    const [search, setSearch] = useState("");
    const [result, setResult] = useState<AccessLogResultFilter>("ALL");

    const filteredRequests = useMemo(() => {
        return requests.filter((row) => {
            return matchesAccessLogRequest(row, search, result);
        });
    }, [requests, search, result]);

    const filteredResults = useMemo(() => {
        return results.filter((row) => {
            return matchesAccessLogResult(row, search, result);
        });
    }, [results, search, result]);

    return (
        <CardContent className="space-y-4">
            <div className="inline-flex w-full space-x-4">
                <InputGroup>
                    <InputGroupInput
                        placeholder="Search user, room or card"
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                        }}
                    />
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                </InputGroup>

                <Select
                    value={result}
                    onValueChange={(value) => {
                        setResult(value as AccessLogResultFilter);
                    }}
                >
                    <SelectTrigger className="w-1/4">
                        <SelectValue placeholder="Result" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                        <SelectGroup>
                            <SelectLabel>Select</SelectLabel>
                            {ACCESS_LOG_RESULT_FILTERS.map((filter) => {
                                return (
                                    <SelectItem key={filter} value={filter}>
                                        {ACCESS_LOG_RESULT_FILTER_LABELS[filter]}
                                    </SelectItem>
                                );
                            })}
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
