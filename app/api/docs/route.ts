import { getOpenApiSpec } from "@/lib/openapi/spec";

export const dynamic = "force-dynamic";

export function GET() {
    return Response.json(getOpenApiSpec());
}
