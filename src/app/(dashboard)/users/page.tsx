import { UsersOverview } from "@/features/admin/users/components/users-overview";
import { getUsersOverview } from "@/lib/server/admin-users";

export default async function UsersPage() {
    const data = await getUsersOverview();

    return <UsersOverview data={data} />;
}
