"use client";

import {
    BookOpen,
    Users,
    CreditCard,
    PieChart,
    Building2,
    ShieldAlert,
    Activity,
    ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { NavMain } from "@/components/layout/nav-main";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: PieChart,
        },
        {
            title: "Users",
            url: "/users",
            icon: Users,
        },
        {
            title: "Rooms",
            url: "/rooms",
            icon: Building2,
        },
        {
            title: "Access Cards",
            url: "/access-cards",
            icon: CreditCard,
        },
        {
            title: "Permissions",
            url: "/permissions",
            icon: ShieldAlert,
        },
        {
            title: "Access Logs",
            url: "/access-logs",
            icon: Activity,
        },
        {
            title: "API Docs",
            url: "/docs",
            icon: BookOpen,
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <ShieldCheck />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">SmartLock</span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        Facility Access Control
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}
