"use client";

import type { SubmitEvent } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { USER_ROLE_LABELS, USER_ROLES, USER_STATUS_LABELS, USER_STATUSES } from "../constants";
import type { UserRow, CreateUserFormInput, UserFormInput, UserRole, UserStatus } from "../types";

type UserFormDialogProps =
    | {
          mode: "create";
          open: boolean;
          onOpenChange: (open: boolean) => void;
          onSubmit: (input: CreateUserFormInput) => void;
      }
    | {
          mode: "edit";
          open: boolean;
          user: UserRow | null;
          onOpenChange: (open: boolean) => void;
          onSubmit: (input: UserFormInput) => void;
      };

function formString(formData: FormData, key: string) {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
}

export function UserFormDialog(props: UserFormDialogProps) {
    const isEdit = props.mode === "edit";
    const user = isEdit ? props.user : null;

    function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const input = {
            name: formString(formData, "name"),
            email: formString(formData, "email"),
            role: formString(formData, "role") as UserRole,
            status: formString(formData, "status") as UserStatus,
        };

        if (props.mode === "create") {
            props.onSubmit({
                ...input,
                password: formString(formData, "password"),
            });
            return;
        }

        props.onSubmit(input);
    }

    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent>
                {isEdit && !user ? null : (
                    <form key={user?.id ?? "create"} onSubmit={handleSubmit} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>{isEdit ? "Edit user" : "Create user"}</DialogTitle>
                            <DialogDescription>
                                {isEdit
                                    ? "Update this user's account details."
                                    : "Add a new user to manage."}
                            </DialogDescription>
                        </DialogHeader>

                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor={`${props.mode}-name`}>Name</FieldLabel>
                                <Input
                                    id={`${props.mode}-name`}
                                    name="name"
                                    defaultValue={user?.name}
                                    required
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor={`${props.mode}-email`}>Email</FieldLabel>
                                <Input
                                    id={`${props.mode}-email`}
                                    name="email"
                                    type="email"
                                    defaultValue={user?.email}
                                    required
                                />
                            </Field>

                            {!isEdit && (
                                <Field>
                                    <FieldLabel htmlFor="create-password">Password</FieldLabel>
                                    <Input
                                        id="create-password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        minLength={8}
                                        maxLength={64}
                                        required
                                    />
                                </Field>
                            )}

                            <Field>
                                <FieldLabel htmlFor={`${props.mode}-role`}>Role</FieldLabel>
                                <Select name="role" defaultValue={user?.role ?? "USER"}>
                                    <SelectTrigger id={`${props.mode}-role`}>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectGroup>
                                            <SelectLabel>Select role</SelectLabel>
                                            {USER_ROLES.map((role) => {
                                                return (
                                                    <SelectItem key={role} value={role}>
                                                        {USER_ROLE_LABELS[role]}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor={`${props.mode}-status`}>Status</FieldLabel>
                                <Select name="status" defaultValue={user?.status ?? "ACTIVE"}>
                                    <SelectTrigger id={`${props.mode}-status`}>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectGroup>
                                            <SelectLabel>Select status</SelectLabel>
                                            {USER_STATUSES.map((status) => {
                                                return (
                                                    <SelectItem key={status} value={status}>
                                                        {USER_STATUS_LABELS[status]}
                                                    </SelectItem>
                                                );
                                            })}
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
                                    props.onOpenChange(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
