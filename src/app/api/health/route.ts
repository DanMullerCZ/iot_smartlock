import { prisma } from "@/lib/db";

export async function GET() {
    let db: "ok" | "error" = "ok";

    try {
        await prisma.$queryRaw`SELECT 1`;
    } catch {
        db = "error";
    }

    const status = db === "ok" ? "ok" : "degraded";
    return Response.json({ status, db }, { status: db === "ok" ? 200 : 503 });
}
