import { AccessCardsOverview } from "@/features/admin/access-cards/components/access-cards-overview";
import { getAccessCardsOverview } from "@/features/admin/access-cards/queries";

export default async function AccessCardsPage() {
    const data = await getAccessCardsOverview();

    return <AccessCardsOverview data={data} />;
}
