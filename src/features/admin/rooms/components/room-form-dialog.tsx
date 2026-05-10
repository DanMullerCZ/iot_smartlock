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
import { Textarea } from "@/components/ui/textarea";

import { ROOM_STATUS_LABELS, ROOM_STATUSES } from "../constants";
import type { RoomFormInput, RoomRow, RoomStatus } from "../types";

interface RoomFormDialogProps {
    mode: "create" | "edit";
    open: boolean;
    room?: RoomRow | null;
    onOpenChange: (open: boolean) => void;
    onSubmit: (input: RoomFormInput) => void;
}

function formString(formData: FormData, key: string) {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
}

export function RoomFormDialog({ mode, open, room, onOpenChange, onSubmit }: RoomFormDialogProps) {
    const isEdit = mode === "edit";

    function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        onSubmit({
            name: formString(formData, "name"),
            location: formString(formData, "location"),
            description: formString(formData, "description"),
            status: formString(formData, "status") as RoomStatus,
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                {isEdit && !room ? null : (
                    <form key={room?.id ?? "create"} onSubmit={handleSubmit} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>{isEdit ? "Edit room" : "Create room"}</DialogTitle>
                            <DialogDescription>
                                {isEdit
                                    ? "Update this room's details and availability."
                                    : "Add a protected room to the directory."}
                            </DialogDescription>
                        </DialogHeader>

                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor={`${mode}-name`}>Name</FieldLabel>
                                <Input
                                    id={`${mode}-name`}
                                    name="name"
                                    defaultValue={room?.name}
                                    required
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor={`${mode}-location`}>Location</FieldLabel>
                                <Input
                                    id={`${mode}-location`}
                                    name="location"
                                    defaultValue={room?.location ?? ""}
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor={`${mode}-description`}>Description</FieldLabel>
                                <Textarea
                                    id={`${mode}-description`}
                                    name="description"
                                    defaultValue={room?.description ?? ""}
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor={`${mode}-status`}>Status</FieldLabel>
                                <Select name="status" defaultValue={room?.status ?? "DISABLED"}>
                                    <SelectTrigger id={`${mode}-status`}>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectGroup>
                                            <SelectLabel>Select status</SelectLabel>
                                            {ROOM_STATUSES.map((status) => {
                                                return (
                                                    <SelectItem key={status} value={status}>
                                                        {ROOM_STATUS_LABELS[status]}
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
