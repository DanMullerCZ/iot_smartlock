"use client";

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-misused-promises, @typescript-eslint/no-unsafe-argument, react-hooks/set-state-in-effect */

import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SyntheticEvent } from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    createResource,
    deleteResource,
    listResource,
    updateResource,
} from "@/lib/frontend/admin-api";
import type {
    AccessCard,
    AccessPermission,
    AdminUser,
    ListResponse,
    PaginationMeta,
    ResourceName,
    Room,
} from "@/lib/frontend/admin-types";

type ManagedResource = AdminUser | Room | AccessCard | AccessPermission;

interface ResourceConfig {
    resource: ResourceName;
    title: string;
    description: string;
    createLabel: string;
    emptyTitle: string;
    emptyDescription: string;
    searchPlaceholder: string;
    statusOptions: string[];
    roleOptions?: string[];
}

const CONFIGS: Record<ResourceName, ResourceConfig> = {
    users: {
        resource: "users",
        title: "Users",
        description: "Manage operators and access-control identities.",
        createLabel: "New user",
        emptyTitle: "No users found",
        emptyDescription: "Create an account or adjust the current filters.",
        searchPlaceholder: "Search name or email",
        statusOptions: ["NOT_VERIFIED", "ACTIVE", "DISABLED"],
        roleOptions: ["SUPER_ADMIN", "ADMIN", "USER"],
    },
    rooms: {
        resource: "rooms",
        title: "Rooms",
        description: "Track protected rooms, locations, and room availability.",
        createLabel: "New room",
        emptyTitle: "No rooms found",
        emptyDescription: "Create a room or adjust the current status filter.",
        searchPlaceholder: "Search room or location",
        statusOptions: ["ACTIVE", "BLOCKED", "DISABLED"],
    },
    "access-cards": {
        resource: "access-cards",
        title: "Access Cards",
        description: "Assign and monitor RFID cards used by SmartLock devices.",
        createLabel: "New card",
        emptyTitle: "No cards found",
        emptyDescription: "Register an RFID card or adjust the current filters.",
        searchPlaceholder: "Search card code or owner",
        statusOptions: ["ACTIVE", "DISABLED"],
    },
    "access-permissions": {
        resource: "access-permissions",
        title: "Permissions",
        description: "Control which users can enter which rooms and when.",
        createLabel: "New permission",
        emptyTitle: "No permissions found",
        emptyDescription: "Create a permission or adjust the current filters.",
        searchPlaceholder: "Search user or room",
        statusOptions: ["ACTIVE", "SUSPENDED", "EXPIRED"],
    },
};

function formatDate(value: string | null | undefined) {
    if (!value) {
        return "—";
    }

    return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

function toDateTimeLocal(value: string | null | undefined) {
    if (!value) {
        return "";
    }

    return new Date(value).toISOString().slice(0, 16);
}

function fromDateTimeLocal(value: string | undefined) {
    if (!value) {
        return undefined;
    }

    return new Date(value).toISOString();
}

function getString(formData: FormData, name: string, fallback = "") {
    const value = formData.get(name);
    return typeof value === "string" ? value : fallback;
}

function resourceLabel(resource: ResourceName) {
    return CONFIGS[resource].title.slice(0, -1).toLowerCase();
}

function matchesSearch(resource: ResourceName, row: ManagedResource, search: string) {
    if (!search.trim()) {
        return true;
    }

    const query = search.trim().toLowerCase();

    if (resource === "users") {
        const user = row as AdminUser;
        return `${user.name} ${user.email}`.toLowerCase().includes(query);
    }

    if (resource === "rooms") {
        const room = row as Room;
        return `${room.name} ${room.location ?? ""}`.toLowerCase().includes(query);
    }

    if (resource === "access-cards") {
        const card = row as AccessCard;
        return `${card.code} ${card.user?.name ?? ""} ${card.user?.email ?? ""}`
            .toLowerCase()
            .includes(query);
    }

    const permission = row as AccessPermission;
    return `${permission.user.name} ${permission.user.email} ${permission.room.name}`
        .toLowerCase()
        .includes(query);
}

function useReferenceData(resource: ResourceName) {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);

    useEffect(() => {
        if (resource !== "access-cards" && resource !== "access-permissions") {
            return;
        }

        let cancelled = false;

        async function loadReferences() {
            const [userResponse, roomResponse] = await Promise.all([
                listResource("users", { page: 1, limit: 100 }),
                resource === "access-permissions"
                    ? listResource("rooms", { page: 1, limit: 100 })
                    : Promise.resolve({
                          data: [],
                          meta: { page: 1, limit: 0, total: 0, totalPages: 1 },
                      }),
            ]);

            if (!cancelled) {
                setUsers(userResponse.data);
                setRooms(roomResponse.data);
            }
        }

        void loadReferences().catch((error: unknown) => {
            toast.error(error instanceof Error ? error.message : "Reference data failed to load.");
        });

        return () => {
            cancelled = true;
        };
    }, [resource]);

    return { users, rooms };
}

function ResourceDialog({
    resource,
    row,
    users,
    rooms,
    open,
    onOpenChange,
    onSubmit,
}: {
    resource: ResourceName;
    row: ManagedResource | null;
    users: AdminUser[];
    rooms: Room[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (input: any) => Promise<void>;
}) {
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmitting(true);

        const formData = new FormData(event.currentTarget);

        try {
            if (resource === "users") {
                const input = {
                    name: getString(formData, "name"),
                    email: getString(formData, "email"),
                    role: getString(formData, "role", "USER"),
                    status: getString(formData, "status", "NOT_VERIFIED"),
                    ...(row ? {} : { password: getString(formData, "password") }),
                };
                await onSubmit(input);
            } else if (resource === "rooms") {
                await onSubmit({
                    name: getString(formData, "name"),
                    location: getString(formData, "location") || undefined,
                    description: getString(formData, "description") || undefined,
                    status: getString(formData, "status", "DISABLED"),
                });
            } else if (resource === "access-cards") {
                const userIdValue = getString(formData, "userId", "unassigned");
                await onSubmit({
                    code: getString(formData, "code"),
                    type: "RFID",
                    status: getString(formData, "status", "DISABLED"),
                    userId:
                        userIdValue === "unassigned"
                            ? row
                                ? null
                                : undefined
                            : Number(userIdValue),
                });
            } else {
                await onSubmit({
                    ...(row
                        ? {}
                        : {
                              userId: Number(getString(formData, "userId")),
                              roomId: Number(getString(formData, "roomId")),
                          }),
                    status: getString(formData, "status", "ACTIVE"),
                    from: fromDateTimeLocal(getString(formData, "from")),
                    to: fromDateTimeLocal(getString(formData, "to")),
                });
            }
        } finally {
            setSubmitting(false);
        }
    }

    const title = row ? `Edit ${resourceLabel(resource)}` : `Create ${resourceLabel(resource)}`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Changes are sent to the existing SmartLock admin API.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4">
                    <ResourceFields resource={resource} row={row} users={users} rooms={rooms} />
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                onOpenChange(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ResourceFields({
    resource,
    row,
    users,
    rooms,
}: {
    resource: ResourceName;
    row: ManagedResource | null;
    users: AdminUser[];
    rooms: Room[];
}) {
    if (resource === "users") {
        const user = row as AdminUser | null;
        return (
            <>
                <Field label="Name" name="name" defaultValue={user?.name ?? ""} required />
                <Field
                    label="Email"
                    name="email"
                    type="email"
                    defaultValue={user?.email ?? ""}
                    required
                />
                {!user ? (
                    <Field
                        label="Password"
                        name="password"
                        type="password"
                        minLength={8}
                        required
                    />
                ) : null}
                <SelectField
                    label="Role"
                    name="role"
                    defaultValue={user?.role ?? "USER"}
                    options={["SUPER_ADMIN", "ADMIN", "USER"]}
                />
                <SelectField
                    label="Status"
                    name="status"
                    defaultValue={user?.status ?? "NOT_VERIFIED"}
                    options={["NOT_VERIFIED", "ACTIVE", "DISABLED"]}
                />
            </>
        );
    }

    if (resource === "rooms") {
        const room = row as Room | null;
        return (
            <>
                <Field label="Name" name="name" defaultValue={room?.name ?? ""} required />
                <Field label="Location" name="location" defaultValue={room?.location ?? ""} />
                <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        defaultValue={room?.description ?? ""}
                    />
                </div>
                <SelectField
                    label="Status"
                    name="status"
                    defaultValue={room?.status ?? "DISABLED"}
                    options={["ACTIVE", "BLOCKED", "DISABLED"]}
                />
            </>
        );
    }

    if (resource === "access-cards") {
        const card = row as AccessCard | null;
        return (
            <>
                <Field label="RFID code" name="code" defaultValue={card?.code ?? ""} required />
                <SelectField
                    label="Status"
                    name="status"
                    defaultValue={card?.status ?? "DISABLED"}
                    options={["ACTIVE", "DISABLED"]}
                />
                <SelectField
                    label="Assigned user"
                    name="userId"
                    defaultValue={card?.userId ? String(card.userId) : "unassigned"}
                    options={[
                        "unassigned",
                        ...users.map((user) => {
                            return String(user.id);
                        }),
                    ]}
                    labels={{
                        unassigned: "Unassigned",
                        ...Object.fromEntries(
                            users.map((user) => {
                                return [String(user.id), `${user.name} · ${user.email}`];
                            }),
                        ),
                    }}
                />
            </>
        );
    }

    const permission = row as AccessPermission | null;
    return (
        <>
            {!permission ? (
                <>
                    <SelectField
                        label="User"
                        name="userId"
                        defaultValue={users[0] ? String(users[0].id) : ""}
                        options={users.map((user) => {
                            return String(user.id);
                        })}
                        labels={Object.fromEntries(
                            users.map((user) => {
                                return [String(user.id), `${user.name} · ${user.email}`];
                            }),
                        )}
                    />
                    <SelectField
                        label="Room"
                        name="roomId"
                        defaultValue={rooms[0] ? String(rooms[0].id) : ""}
                        options={rooms.map((room) => {
                            return String(room.id);
                        })}
                        labels={Object.fromEntries(
                            rooms.map((room) => {
                                return [String(room.id), room.name];
                            }),
                        )}
                    />
                </>
            ) : null}
            <SelectField
                label="Status"
                name="status"
                defaultValue={permission?.status ?? "ACTIVE"}
                options={["ACTIVE", "SUSPENDED", "EXPIRED"]}
            />
            <Field
                label="Valid from"
                name="from"
                type="datetime-local"
                defaultValue={toDateTimeLocal(permission?.from)}
            />
            <Field
                label="Valid until"
                name="to"
                type="datetime-local"
                defaultValue={toDateTimeLocal(permission?.to)}
            />
        </>
    );
}

function Field({
    label,
    name,
    type = "text",
    defaultValue,
    required,
    minLength,
}: {
    label: string;
    name: string;
    type?: string;
    defaultValue?: string;
    required?: boolean;
    minLength?: number;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <Input
                id={name}
                name={name}
                type={type}
                defaultValue={defaultValue}
                required={required}
                minLength={minLength}
            />
        </div>
    );
}

function SelectField({
    label,
    name,
    defaultValue,
    options,
    labels,
}: {
    label: string;
    name: string;
    defaultValue: string;
    options: string[];
    labels?: Record<string, string>;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <Select name={name} defaultValue={defaultValue || options[0]}>
                <SelectTrigger id={name}>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => {
                        return (
                            <SelectItem key={option} value={option}>
                                {labels?.[option] ?? option.replaceAll("_", " ")}
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>
        </div>
    );
}

function buildColumns(
    resource: ResourceName,
    onEdit: (row: ManagedResource) => void,
    onDelete: (row: ManagedResource) => void,
): ColumnDef<ManagedResource>[] {
    const actionsColumn: ColumnDef<ManagedResource> = {
        id: "actions",
        header: "",
        cell: ({ row }) => {
            return (
                <div className="flex justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            onEdit(row.original);
                        }}
                    >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                            onDelete(row.original);
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                    </Button>
                </div>
            );
        },
    };

    if (resource === "users") {
        return [
            {
                header: "Name",
                cell: ({ row }) => {
                    return (row.original as AdminUser).name;
                },
            },
            {
                header: "Email",
                cell: ({ row }) => {
                    return (row.original as AdminUser).email;
                },
            },
            {
                header: "Role",
                cell: ({ row }) => {
                    return <StatusBadge value={(row.original as AdminUser).role} />;
                },
            },
            {
                header: "Status",
                cell: ({ row }) => {
                    return <StatusBadge value={(row.original as AdminUser).status} />;
                },
            },
            {
                header: "Created",
                cell: ({ row }) => {
                    return formatDate((row.original as AdminUser).createdAt);
                },
            },
            actionsColumn,
        ];
    }

    if (resource === "rooms") {
        return [
            {
                header: "Room",
                cell: ({ row }) => {
                    return (row.original as Room).name;
                },
            },
            {
                header: "Location",
                cell: ({ row }) => {
                    return (row.original as Room).location ?? "—";
                },
            },
            {
                header: "Status",
                cell: ({ row }) => {
                    return <StatusBadge value={(row.original as Room).status} />;
                },
            },
            {
                header: "Updated",
                cell: ({ row }) => {
                    return formatDate((row.original as Room).updatedAt);
                },
            },
            actionsColumn,
        ];
    }

    if (resource === "access-cards") {
        return [
            {
                header: "RFID code",
                cell: ({ row }) => {
                    return (row.original as AccessCard).code;
                },
            },
            {
                header: "Type",
                cell: ({ row }) => {
                    return (row.original as AccessCard).type;
                },
            },
            {
                header: "Owner",
                cell: ({ row }) => {
                    const card = row.original as AccessCard;
                    return card.user ? `${card.user.name} · ${card.user.email}` : "Unassigned";
                },
            },
            {
                header: "Status",
                cell: ({ row }) => {
                    return <StatusBadge value={(row.original as AccessCard).status} />;
                },
            },
            {
                header: "Assigned",
                cell: ({ row }) => {
                    return formatDate((row.original as AccessCard).assignedAt);
                },
            },
            actionsColumn,
        ];
    }

    return [
        {
            header: "User",
            cell: ({ row }) => {
                const permission = row.original as AccessPermission;
                return `${permission.user.name} · ${permission.user.email}`;
            },
        },
        {
            header: "Room",
            cell: ({ row }) => {
                const permission = row.original as AccessPermission;
                return permission.room.name;
            },
        },
        {
            header: "Status",
            cell: ({ row }) => {
                return <StatusBadge value={(row.original as AccessPermission).status} />;
            },
        },
        {
            header: "Valid from",
            cell: ({ row }) => {
                return formatDate((row.original as AccessPermission).from);
            },
        },
        {
            header: "Valid until",
            cell: ({ row }) => {
                return formatDate((row.original as AccessPermission).to);
            },
        },
        actionsColumn,
    ];
}

export function ResourceManager({ resource }: { resource: ResourceName }) {
    const config = CONFIGS[resource];
    const { users, rooms } = useReferenceData(resource);
    const [rows, setRows] = useState<ManagedResource[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [role, setRole] = useState("all");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<ManagedResource | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const response = (await listResource(resource, {
                page,
                limit: 10,
                status: status === "all" ? undefined : status,
                role: resource === "users" && role !== "all" ? role : undefined,
            })) as ListResponse<ManagedResource>;
            setRows(response.data);
            setMeta(response.meta);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Data failed to load.");
        } finally {
            setLoading(false);
        }
    }, [page, resource, role, status]);

    useEffect(() => {
        void load();
    }, [load]);

    const filteredRows = useMemo(() => {
        return rows.filter((row) => {
            return matchesSearch(resource, row, search);
        });
    }, [resource, rows, search]);

    const columns = useMemo(() => {
        return buildColumns(
            resource,
            (row) => {
                setEditingRow(row);
                setDialogOpen(true);
            },
            (row) => {
                const id = Number((row as { id: number | string }).id);
                if (!window.confirm(`Delete this ${resourceLabel(resource)}?`)) {
                    return;
                }

                void deleteResource(resource, id)
                    .then(() => {
                        toast.success("Record deleted.");
                        return load();
                    })
                    .catch((error: unknown) => {
                        toast.error(error instanceof Error ? error.message : "Delete failed.");
                    });
            },
        );
    }, [load, resource]);

    async function handleSubmit(input: any) {
        if (editingRow) {
            const id = Number((editingRow as { id: number | string }).id);
            await updateResource(resource, id, input);
            toast.success("Record updated.");
        } else {
            await createResource(resource, input);
            toast.success("Record created.");
        }
        setDialogOpen(false);
        setEditingRow(null);
        await load();
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={config.title}
                description={config.description}
                actions={
                    <Button
                        onClick={() => {
                            setEditingRow(null);
                            setDialogOpen(true);
                        }}
                    >
                        <Plus className="h-4 w-4" />
                        {config.createLabel}
                    </Button>
                }
            />

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Directory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-9"
                                placeholder={config.searchPlaceholder}
                                value={search}
                                onChange={(event) => {
                                    setSearch(event.target.value);
                                }}
                            />
                        </div>
                        <Select
                            value={status}
                            onValueChange={(value) => {
                                setStatus(value);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                {config.statusOptions.map((option) => {
                                    return (
                                        <SelectItem key={option} value={option}>
                                            {option.replaceAll("_", " ")}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                        {config.roleOptions ? (
                            <Select
                                value={role}
                                onValueChange={(value) => {
                                    setRole(value);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All roles</SelectItem>
                                    {config.roleOptions.map((option) => {
                                        return (
                                            <SelectItem key={option} value={option}>
                                                {option.replaceAll("_", " ")}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        ) : null}
                    </div>

                    <DataTable
                        columns={columns}
                        data={filteredRows}
                        meta={meta}
                        loading={loading}
                        onPageChange={setPage}
                        empty={
                            <EmptyState
                                icon={Search}
                                title={config.emptyTitle}
                                description={config.emptyDescription}
                            />
                        }
                    />
                </CardContent>
            </Card>

            <ResourceDialog
                resource={resource}
                row={editingRow}
                users={users}
                rooms={rooms}
                open={dialogOpen}
                onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) {
                        setEditingRow(null);
                    }
                }}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
