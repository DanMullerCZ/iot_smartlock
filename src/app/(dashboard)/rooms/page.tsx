import { RoomsOverview } from "@/features/admin/rooms/components/rooms-overview";
import { getRoomsOverview } from "@/lib/server/admin-rooms";

export default async function RoomsPage() {
    const data = await getRoomsOverview();

    return <RoomsOverview data={data} />;
}
