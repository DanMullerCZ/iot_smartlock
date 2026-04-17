import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_API_PREFIXES = ["/api/auth", "/api/health", "/api/users", "/api/docs"];
const PUBLIC_PAGES = ["/", "/login", "/register"];

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

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        if (pathname.startsWith("/api/")) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = "/login";
        return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith("/api/admin/") && token.role !== "SUPER_ADMIN") {
        return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
