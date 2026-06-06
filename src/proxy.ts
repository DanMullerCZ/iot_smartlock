import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_API_PREFIXES = ["/api/auth", "/api/health", "/api/users", "/api/docs"];
const PUBLIC_PAGES = ["/", "/login", "/register"];
const ADMIN_PAGE_PREFIXES = [
    "/dashboard",
    "/users",
    "/rooms",
    "/locks",
    "/access-cards",
    "/permissions",
    "/access-logs",
];

function matchesPathPrefix(pathname: string, prefixes: string[]) {
    return prefixes.some((prefix) => {
        return pathname === prefix || pathname.startsWith(`${prefix}/`);
    });
}

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (
        PUBLIC_API_PREFIXES.some((prefix) => {
            return pathname.startsWith(prefix);
        })
    ) {
        return NextResponse.next();
    }

    if (PUBLIC_PAGES.includes(pathname)) {
        return NextResponse.next();
    }

    // API key requests bypass session auth — the route handler validates the key
    if (req.headers.get("x-api-key") && pathname.startsWith("/api/")) {
        if (!validateGateway(req)) {
            return Response.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.next();
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        if (pathname.startsWith("/api/")) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = "/login";
        return NextResponse.redirect(loginUrl);
    }

    const isAdminApi = pathname.startsWith("/api/admin/");
    const isAdminPage = matchesPathPrefix(pathname, ADMIN_PAGE_PREFIXES);

    if ((isAdminApi || isAdminPage) && token.role !== "SUPER_ADMIN") {
        if (isAdminApi) {
            return Response.json({ error: "Forbidden" }, { status: 403 });
        }

        return new Response("Forbidden", { status: 403 });
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

function validateGateway(req: NextRequest): boolean {
    const { method, nextUrl } = req;
    const { pathname } = nextUrl;

    if (method.toLowerCase() === "post") {
        return pathname.startsWith("/api/access-logs") || pathname.startsWith("/api/access");
    } else {
        return pathname.startsWith("/api") && method.toLowerCase() === "get";
    }
}
