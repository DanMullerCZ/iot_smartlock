"use client";

import { Trash2 } from "lucide-react";

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

import type { AccessCardRow } from "../types";

interface DeleteAccessCardDialogProps {
    open: boolean;
    accessCard: AccessCardRow | null;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export function DeleteAccessCardDialog({
    open,
    accessCard,
    onOpenChange,
    onConfirm,
}: DeleteAccessCardDialogProps) {
    if (!accessCard) {
        return null;
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                        <Trash2 />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Delete access card?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will remove card {accessCard.code} from the active card directory.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={onConfirm}>
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
