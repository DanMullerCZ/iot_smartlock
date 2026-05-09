import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { PageHeader } from "@/components/common/page-header";
import { UsersTable } from "@/features/admin/users/components/users-table";
import type { AdminUsersOverview } from "@/lib/server/admin-users";

interface UsersOverviewProps {
    data: AdminUsersOverview;
}

export async function UsersOverview({ data }: UsersOverviewProps) {
    const session = await getServerSession();

    if (!session) {
        redirect("/");
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="space-y-6">
                <PageHeader
                    title="Users"
                    description="Manage operators and access-control identities"
                />

                <UsersTable users={data.users} />
            </div>
        </div>
    );
}
