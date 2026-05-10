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
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
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

import { PERMISSION_STATUS_LABELS, PERMISSION_STATUSES } from "../constants";
import {
    formatPermissionRoom,
    formatPermissionUser,
    localDateTimeToIso,
    toDateTimeInputValue,
} from "../format";
import type {
    AccessPermissionRow,
    PermissionCreateFormInput,
    PermissionStatus,
    PermissionUpdateFormInput,
} from "../types";

type PermissionFormDialogProps =
    | {
          mode: "create";
          open: boolean;
          onOpenChange: (open: boolean) => void;
          onSubmit: (input: PermissionCreateFormInput) => void;
      }
    | {
          mode: "edit";
          open: boolean;
          permission: AccessPermissionRow | null;
          onOpenChange: (open: boolean) => void;
          onSubmit: (input: PermissionUpdateFormInput) => void;
      };

function formString(formData: FormData, key: string) {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
}

function formNumber(formData: FormData, key: string) {
    return Number(formString(formData, key));
}

function formOptionalDateTime(formData: FormData, key: string) {
    const value = formString(formData, key);
    return value ? localDateTimeToIso(value) : undefined;
}

function formNullableDateTime(formData: FormData, key: string) {
    const value = formString(formData, key);
    return value ? localDateTimeToIso(value) : null;
}

export function PermissionFormDialog(props: PermissionFormDialogProps) {
    const isEdit = props.mode === "edit";
    const permission = isEdit ? props.permission : null;

    function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const status = formString(formData, "status") as PermissionStatus;

        if (props.mode === "create") {
            props.onSubmit({
                userId: formNumber(formData, "userId"),
                roomId: formNumber(formData, "roomId"),
                status,
                from: formOptionalDateTime(formData, "from"),
                to: formOptionalDateTime(formData, "to"),
            });
            return;
        }

        props.onSubmit({
            status,
            from: formNullableDateTime(formData, "from"),
            to: formNullableDateTime(formData, "to"),
        });
    }

    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent>
                {isEdit && !permission ? null : (
                    <form
                        key={permission?.id ?? "create"}
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        <DialogHeader>
                            <DialogTitle>
                                {isEdit ? "Edit permission" : "Create permission"}
                            </DialogTitle>
                            <DialogDescription>
                                {isEdit
                                    ? "Update this permission's validity and status."
                                    : "Allow a user to access a protected room."}
                            </DialogDescription>
                        </DialogHeader>

                        <FieldGroup>
                            {isEdit && permission ? (
                                <>
                                    <Field>
                                        <FieldLabel>User</FieldLabel>
                                        <Input value={formatPermissionUser(permission)} disabled />
                                    </Field>

                                    <Field>
                                        <FieldLabel>Room</FieldLabel>
                                        <Input value={formatPermissionRoom(permission)} disabled />
                                    </Field>
                                </>
                            ) : (
                                <>
                                    <Field>
                                        <FieldLabel htmlFor="create-user-id">User ID</FieldLabel>
                                        <Input
                                            id="create-user-id"
                                            name="userId"
                                            type="number"
                                            min={1}
                                            required
                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="create-room-id">Room ID</FieldLabel>
                                        <Input
                                            id="create-room-id"
                                            name="roomId"
                                            type="number"
                                            min={1}
                                            required
                                        />
                                    </Field>
                                </>
                            )}

                            <Field>
                                <FieldLabel htmlFor={`${props.mode}-status`}>Status</FieldLabel>
                                <Select name="status" defaultValue={permission?.status ?? "ACTIVE"}>
                                    <SelectTrigger id={`${props.mode}-status`}>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectGroup>
                                            <SelectLabel>Select status</SelectLabel>
                                            {PERMISSION_STATUSES.map((status) => {
                                                return (
                                                    <SelectItem key={status} value={status}>
                                                        {PERMISSION_STATUS_LABELS[status]}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor={`${props.mode}-from`}>Valid from</FieldLabel>
                                <Input
                                    id={`${props.mode}-from`}
                                    name="from"
                                    type="datetime-local"
                                    defaultValue={toDateTimeInputValue(permission?.from)}
                                />
                                <FieldDescription>Leave empty for no start limit.</FieldDescription>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor={`${props.mode}-to`}>Valid to</FieldLabel>
                                <Input
                                    id={`${props.mode}-to`}
                                    name="to"
                                    type="datetime-local"
                                    defaultValue={toDateTimeInputValue(permission?.to)}
                                />
                                <FieldDescription>Leave empty for no end limit.</FieldDescription>
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
