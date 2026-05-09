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

import { CARD_STATUS_LABELS, CARD_STATUSES, CARD_TYPE_LABELS, CARD_TYPES } from "../constants";
import type { AccessCardFormInput, AccessCardRow, CardStatus, CardType } from "../types";

interface AccessCardFormDialogProps {
    mode: "create" | "edit";
    open: boolean;
    accessCard?: AccessCardRow | null;
    onOpenChange: (open: boolean) => void;
    onSubmit: (input: AccessCardFormInput) => void;
}

function formString(formData: FormData, key: string) {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
}

function formNullableNumber(formData: FormData, key: string) {
    const value = formString(formData, key);
    return value ? Number(value) : null;
}

export function AccessCardFormDialog({
    mode,
    open,
    accessCard,
    onOpenChange,
    onSubmit,
}: AccessCardFormDialogProps) {
    const isEdit = mode === "edit";

    function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        onSubmit({
            code: formString(formData, "code"),
            type: formString(formData, "type") as CardType,
            status: formString(formData, "status") as CardStatus,
            userId: formNullableNumber(formData, "userId"),
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                {isEdit && !accessCard ? null : (
                    <form
                        key={accessCard?.id ?? "create"}
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        <DialogHeader>
                            <DialogTitle>
                                {isEdit ? "Edit access card" : "Create access card"}
                            </DialogTitle>
                            <DialogDescription>
                                {isEdit
                                    ? "Update this RFID card's details and assignment."
                                    : "Register a new RFID card."}
                            </DialogDescription>
                        </DialogHeader>

                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor={`${mode}-code`}>RFID Code</FieldLabel>
                                <Input
                                    id={`${mode}-code`}
                                    name="code"
                                    defaultValue={accessCard?.code}
                                    required
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor={`${mode}-type`}>Type</FieldLabel>
                                <Select name="type" defaultValue={accessCard?.type ?? "RFID"}>
                                    <SelectTrigger id={`${mode}-type`}>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectGroup>
                                            <SelectLabel>Select type</SelectLabel>
                                            {CARD_TYPES.map((type) => {
                                                return (
                                                    <SelectItem key={type} value={type}>
                                                        {CARD_TYPE_LABELS[type]}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor={`${mode}-status`}>Status</FieldLabel>
                                <Select
                                    name="status"
                                    defaultValue={accessCard?.status ?? "DISABLED"}
                                >
                                    <SelectTrigger id={`${mode}-status`}>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectGroup>
                                            <SelectLabel>Select status</SelectLabel>
                                            {CARD_STATUSES.map((status) => {
                                                return (
                                                    <SelectItem key={status} value={status}>
                                                        {CARD_STATUS_LABELS[status]}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor={`${mode}-user-id`}>Owner user ID</FieldLabel>
                                <Input
                                    id={`${mode}-user-id`}
                                    name="userId"
                                    type="number"
                                    min={1}
                                    defaultValue={accessCard?.userId ?? ""}
                                />
                                <FieldDescription>
                                    Leave empty to keep the card unassigned.
                                </FieldDescription>
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
