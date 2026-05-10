"use client";

import { signOut } from "next-auth/react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export default function LogoutButton() {
    return (
        <DropdownMenuItem
            onSelect={() => {
                void signOut({ callbackUrl: "/login" });
            }}
        >
            Sign out
        </DropdownMenuItem>
    );
}
