"use client";

import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export default function LogoutButton() {
    return (
        <Button
            variant="destructive"
            className="w-full"
            size="sm"
            onClick={() => {
                void signOut({ callbackUrl: "/login" });
            }}
        >
            Sign out
        </Button>
    );
}
