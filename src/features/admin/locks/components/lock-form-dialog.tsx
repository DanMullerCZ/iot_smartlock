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
import { Textarea } from "@/components/ui/textarea";

import { LOCK_ROOM_EMPTY_VALUE } from "../constants";
import { formatRoomLabel } from "../format";
import type { LockFormInput, LockRoomOption, LockRow } from "../types";

interface LockFormDialogProps {
    mode: "create" | "edit";
    open: boolean;
    lock?: LockRow | null;
    roomOptions: LockRoomOption[];
    onOpenChange: (open: boolean) => void;
    onSubmit: (input: LockFormInput) => void;
}

function formString(formData: FormData, key: string) {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
}

function formNullableNumber(formData: FormData, key: string) {
    const value = formString(formData, key);
    return value && value !== LOCK_ROOM_EMPTY_VALUE ? Number(value) : null;
}

export function LockFormDialog({
    mode,
    open,
    lock,
    roomOptions,
    onOpenChange,
    onSubmit,
}: LockFormDialogProps) {
    const isEdit = mode === "edit";

    function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        onSubmit({
            name: formString(formData, "name"),
            description: formString(formData, "description"),
            roomId: formNullableNumber(formData, "roomId"),
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                {isEdit && !lock ? null : (
                    <form key={lock?.id ?? "create"} onSubmit={handleSubmit} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>{isEdit ? "Edit lock" : "Create lock"}</DialogTitle>
                            <DialogDescription>
                                {isEdit
                                    ? "Update this lock's details and room assignment."
                                    : "Register a lock for a protected room."}
                            </DialogDescription>
                        </DialogHeader>

                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor={`${mode}-name`}>Name</FieldLabel>
                                <Input
                                    id={`${mode}-name`}
                                    name="name"
                                    defaultValue={lock?.name ?? ""}
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor={`${mode}-room-id`}>Room</FieldLabel>
                                <Select
                                    name="roomId"
                                    defaultValue={
                                        lock?.roomId ? String(lock.roomId) : LOCK_ROOM_EMPTY_VALUE
                                    }
                                >
                                    <SelectTrigger id={`${mode}-room-id`}>
                                        <SelectValue placeholder="Select room" />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectGroup>
                                            <SelectLabel>Select room</SelectLabel>
                                            <SelectItem value={LOCK_ROOM_EMPTY_VALUE}>
                                                Select room
                                            </SelectItem>
                                            {roomOptions.map((room) => {
                                                return (
                                                    <SelectItem
                                                        key={room.id}
                                                        value={String(room.id)}
                                                    >
                                                        {formatRoomLabel(room)}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FieldDescription>Each lock belongs to one room.</FieldDescription>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor={`${mode}-description`}>Description</FieldLabel>
                                <Textarea
                                    id={`${mode}-description`}
                                    name="description"
                                    defaultValue={lock?.description ?? ""}
                                />
                            </Field>
                        </FieldGroup>

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
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
