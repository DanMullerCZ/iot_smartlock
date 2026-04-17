import type { Session } from "next-auth";
import { getServerSession } from "next-auth/next";

import LogoutButton from "@/components/layout/LogoutButton";
import { authOptions } from "@/lib/auth/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session: Session | null = await getServerSession(authOptions);

    const signedUserName = session ? (session.user.name ?? "Unknown user") : "Not logged in";

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
            <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-700 dark:bg-zinc-800">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    SmartLock
                </span>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        {signedUserName}
                    </span>
                    <LogoutButton />
                </div>
            </header>
            <main className="p-6">{children}</main>
        </div>
    );
}
