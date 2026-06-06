"use client";

/* eslint-disable react-hooks/incompatible-library */

import type { ColumnDef } from "@tanstack/react-table";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type React from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { PaginationMeta } from "@/lib/frontend/admin-types";

export function DataTable<TData>({
    columns,
    data,
    meta,
    loading,
    empty,
    onPageChange,
}: {
    columns: ColumnDef<TData>[];
    data: TData[];
    meta: PaginationMeta | null;
    loading: boolean;
    empty: React.ReactNode;
    onPageChange: (page: number) => void;
}) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
    });

    const page = meta?.page ?? 1;
    const totalPages = meta?.totalPages ?? 1;
    const total = meta?.total ?? data.length;

    return (
        <div className="space-y-3">
            <div className="overflow-hidden rounded-lg border bg-card">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => {
                            return (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column.columnDef.header,
                                                          header.getContext(),
                                                      )}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            );
                        })}
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, index) => {
                                return (
                                    <TableRow key={index}>
                                        {columns.map((column, cellIndex) => {
                                            return (
                                                <TableCell
                                                    key={`${column.id ?? "column"}-${cellIndex.toString()}`}
                                                >
                                                    <Skeleton className="h-5 w-full max-w-40" />
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })
                        ) : table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => {
                                return (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => {
                                            return (
                                                <TableCell key={cell.id}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext(),
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="p-6">
                                    {empty}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <span>
                    {total} records · page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            onPageChange(Math.max(1, page - 1));
                        }}
                        disabled={loading || page <= 1}
                    >
                        <ChevronLeft />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            onPageChange(Math.min(totalPages, page + 1));
                        }}
                        disabled={loading || page >= totalPages}
                    >
                        Next
                        <ChevronRight />
                    </Button>
                </div>
            </div>
        </div>
    );
}
