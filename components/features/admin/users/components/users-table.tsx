"use client";

import { Activity, Search, Settings2, Trash2 } from "lucide-react";
import { startTransition, useMemo, useState } from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/admin/data-table";
import { EmptyState } from "@/components/misc/empty-state";
import { StatusBadge } from "@/components/misc/status-badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
import type { UserRole, UserStatus } from "@/lib/frontend/admin-types";
import type { AdminUserRow } from "@/lib/server/admin-users";

import { createUserAction, deleteUserAction, updateUserAction } from "../actions";

interface UsersTableProps {
    users: AdminUserRow[];
}

interface UserFormInput {
    name: string;
    email: string;
    role: string;
    status: string;
}

function formatDate(value: string | null | undefined) {
    if (!value) {
        return "—";
    }

    return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

export function UsersTable({ users }: UsersTableProps) {
    const [createDialogOpen, setCreateOpenDialog] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<AdminUserRow | null>(null);

    function handleCreateUser(newUser: {
        name: string;
        email: string;
        role: string;
        status: string;
    }) {
        startTransition(async () => {
            const response = await createUserAction(newUser);

            if (!response.success) {
                toast.error(response.message);
                return;
            }

            toast.success(response.message);
            setCreateOpenDialog(false);
        });
    }

    function handleUpdateUser(id: number, input: UserFormInput) {
        startTransition(async () => {
            const response = await updateUserAction(id, input);

            if (!response.success) {
                toast.error(response.message);
                return;
            }

            toast.success(response.message);
            setEditDialogOpen(false);
            setEditingRow(null);
        });
    }

    function handleDeleteUser(id: number) {
        startTransition(async () => {
            const response = await deleteUserAction(id);

            if (!response.success) {
                toast.error(response.message);
                return;
            }

            toast.success(response.message);
        });
    }

    const columns = useMemo(() => {
        return [
            {
                header: "Name",
                cell: ({ row }: { row: { original: AdminUserRow } }) => {
                    return row.original.name;
                },
            },
            {
                header: "Email",
                cell: ({ row }: { row: { original: AdminUserRow } }) => {
                    return row.original.email;
                },
            },
            {
                header: "Role",
                cell: ({ row }: { row: { original: AdminUserRow } }) => {
                    return <StatusBadge value={row.original.role as UserRole} />;
                },
            },
            {
                header: "Status",
                cell: ({ row }: { row: { original: AdminUserRow } }) => {
                    return <StatusBadge value={row.original.status as UserStatus} />;
                },
            },
            {
                header: "Created",
                cell: ({ row }: { row: { original: AdminUserRow } }) => {
                    return formatDate(row.original.createdAt);
                },
            },
            {
                id: "actions",
                header: "",
                cell: ({ row }: { row: { original: AdminUserRow } }) => {
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost">
                                    <Settings2 />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent>
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>

                                    <DropdownMenuItem
                                        onClick={() => {
                                            setEditDialogOpen(true);
                                            setEditingRow(row.original);
                                        }}
                                    >
                                        Edit
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        onClick={() => {
                                            setDeleteDialogOpen(true);
                                            setEditingRow(row.original);
                                        }}
                                    >
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ];
    }, []);

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Directory</CardTitle>

                    <CardAction>
                        <Button
                            size="sm"
                            onClick={() => {
                                setCreateOpenDialog(true);
                                setEditingRow(null);
                            }}
                        >
                            New user
                        </Button>
                    </CardAction>
                </CardHeader>

                <CardContent className="space-y-4">
                    <InputGroup>
                        <InputGroupInput placeholder="Search user or email" />

                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                    </InputGroup>

                    <DataTable
                        columns={columns}
                        data={users}
                        meta={null}
                        loading={false}
                        onPageChange={() => {
                            return undefined;
                        }}
                        empty={
                            <EmptyState
                                icon={Activity}
                                title="No users found"
                                description="Create an account or adjust the current filters."
                            />
                        }
                    />
                </CardContent>
            </Card>

            <Dialog open={createDialogOpen} onOpenChange={setCreateOpenDialog}>
                <DialogContent>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();

                            const formData = new FormData(event.currentTarget);
                            const rawName = formData.get("name");
                            const rawEmail = formData.get("email");
                            const rawRole = formData.get("role");
                            const rawStatus = formData.get("status");

                            handleCreateUser({
                                name: typeof rawName === "string" ? rawName.trim() : "",
                                email: typeof rawEmail === "string" ? rawEmail.trim() : "",
                                role: typeof rawRole === "string" ? rawRole.trim() : "",
                                status: typeof rawStatus === "string" ? rawStatus.trim() : "",
                            });
                        }}
                        className="space-y-4"
                    >
                        <DialogHeader>
                            <DialogTitle>Create user</DialogTitle>

                            <DialogDescription>Add a new user to manage.</DialogDescription>
                        </DialogHeader>

                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="create-name">Name</FieldLabel>
                                <Input id="create-name" name="name" required />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="create-email">Email</FieldLabel>
                                <Input id="create-email" name="email" type="email" required />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="create-role">Role</FieldLabel>
                                <Select name="role" defaultValue="USER">
                                    <SelectTrigger id="create-role">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectGroup>
                                            <SelectLabel>Select role</SelectLabel>
                                            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                            <SelectItem value="USER">User</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="create-status">Status</FieldLabel>
                                <Select name="status" defaultValue="ACTIVE">
                                    <SelectTrigger id="create-status">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectGroup>
                                            <SelectLabel>Select status</SelectLabel>
                                            <SelectItem value="ACTIVE">Active</SelectItem>
                                            <SelectItem value="NOT_VERIFIED">
                                                Not verified
                                            </SelectItem>
                                            <SelectItem value="DISABLED">Disabled</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </Field>
                        </FieldGroup>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setCreateOpenDialog(false);
                                }}
                            >
                                Cancel
                            </Button>

                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={editDialogOpen}
                onOpenChange={(open) => {
                    setEditDialogOpen(open);

                    if (!open) {
                        setEditingRow(null);
                    }
                }}
            >
                <DialogContent>
                    {editingRow ? (
                        <form
                            key={editingRow.id}
                            onSubmit={(event) => {
                                event.preventDefault();

                                const formData = new FormData(event.currentTarget);
                                const rawName = formData.get("name");
                                const rawEmail = formData.get("email");
                                const rawRole = formData.get("role");
                                const rawStatus = formData.get("status");

                                handleUpdateUser(editingRow.id, {
                                    name: typeof rawName === "string" ? rawName.trim() : "",
                                    email: typeof rawEmail === "string" ? rawEmail.trim() : "",
                                    role: typeof rawRole === "string" ? rawRole.trim() : "",
                                    status: typeof rawStatus === "string" ? rawStatus.trim() : "",
                                });
                            }}
                            className="space-y-4"
                        >
                            <DialogHeader>
                                <DialogTitle>Edit user</DialogTitle>

                                <DialogDescription>
                                    Update this user&apos;s account details.
                                </DialogDescription>
                            </DialogHeader>

                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="edit-name">Name</FieldLabel>
                                    <Input
                                        id="edit-name"
                                        name="name"
                                        defaultValue={editingRow.name}
                                        required
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="edit-email">Email</FieldLabel>
                                    <Input
                                        id="edit-email"
                                        name="email"
                                        type="email"
                                        defaultValue={editingRow.email}
                                        required
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="edit-role">Role</FieldLabel>
                                    <Select name="role" defaultValue={editingRow.role}>
                                        <SelectTrigger id="edit-role">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent position="popper">
                                            <SelectGroup>
                                                <SelectLabel>Select role</SelectLabel>
                                                <SelectItem value="SUPER_ADMIN">
                                                    Super Admin
                                                </SelectItem>
                                                <SelectItem value="ADMIN">Admin</SelectItem>
                                                <SelectItem value="USER">User</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="edit-status">Status</FieldLabel>
                                    <Select name="status" defaultValue={editingRow.status}>
                                        <SelectTrigger id="edit-status">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent position="popper">
                                            <SelectGroup>
                                                <SelectLabel>Select status</SelectLabel>
                                                <SelectItem value="ACTIVE">Active</SelectItem>
                                                <SelectItem value="NOT_VERIFIED">
                                                    Not verified
                                                </SelectItem>
                                                <SelectItem value="DISABLED">Disabled</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            </FieldGroup>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setEditDialogOpen(false);
                                        setEditingRow(null);
                                    }}
                                >
                                    Cancel
                                </Button>

                                <Button type="submit">Save</Button>
                            </DialogFooter>
                        </form>
                    ) : null}
                </DialogContent>
            </Dialog>

            {editingRow && (
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent size="sm">
                        <AlertDialogHeader>
                            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                                <Trash2 />
                            </AlertDialogMedia>

                            <AlertDialogTitle>Delete user?</AlertDialogTitle>

                            <AlertDialogDescription>
                                This action will delete your account.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                variant="destructive"
                                onClick={() => {
                                    handleDeleteUser(editingRow.id);
                                }}
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </>
    );
}
