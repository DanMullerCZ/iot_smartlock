import { User } from "lucide-react";
import { getServerSession } from "next-auth/next";

import LogoutButton from "@/components/common/logout-button";
import { StatusBadge, type StatusValue } from "@/components/common/status-badge";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { authOptions } from "@/lib/auth/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    const signedUserName = session ? (session.user.name ?? "Unknown user") : "Not logged in";
    const signedUserRole = (session?.user.role ?? "USER") as StatusValue;

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger />
                        <Kbd>⌘ + B</Kbd>
                    </div>

                    <div className="flex items-center gap-3">
                        <StatusBadge value={signedUserRole} />

                        <Separator orientation="vertical" className="h-6" />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost">
                                    <User />
                                    {signedUserName}
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                                <DropdownMenuGroup>
                                    <LogoutButton />
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Separator orientation="vertical" className="h-6" />

                        <ThemeToggle />
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-8 overflow-auto">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    );
}
