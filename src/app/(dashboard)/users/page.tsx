import { UsersOverview } from "@/features/admin/users/components/users-overview";
import { getUsersOverview } from "@/features/admin/users/queries";

export default async function UsersPage() {
    const data = await getUsersOverview();

    return <UsersOverview data={data} />;
}
