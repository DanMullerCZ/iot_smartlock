import { createHmac } from "crypto";
import { verify } from "argon2";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

function parseBasicAuth(header: string | null): { email: string; password: string } | null {
  if (!header?.startsWith("Basic ")) return null;
  const decoded = Buffer.from(header.slice(6), "base64").toString("utf-8");
  const colonIndex = decoded.indexOf(":");
  if (colonIndex === -1) return null;
  return { email: decoded.slice(0, colonIndex), password: decoded.slice(colonIndex + 1) };
}

export function generatePreAuthToken(email: string, uuid: string, name: string, issuedAt: number): string {
  return createHmac("sha256", env.NEXTAUTH_SECRET)
    .update(`${email}:${uuid}:${name}:${issuedAt}`)
    .digest("hex");
}

export async function POST(request: Request) {
  const credentials = parseBasicAuth(request.headers.get("Authorization"));
  if (!credentials) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
    select: { uuid: true, name: true, email: true, password: true, status: true, deletedAt: true },
  }).catch(() => null);

  if (!user || !user.password || user.deletedAt !== null) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }
  if (user.status === "DISABLED") {
    return Response.json({ error: "Account is disabled" }, { status: 401 });
  }

  const valid = await verify(user.password, credentials.password).catch(() => false);
  if (!valid) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const issuedAt = Date.now();
  const token = generatePreAuthToken(user.email, user.uuid, user.name, issuedAt);

  return Response.json({ email: user.email, uuid: user.uuid, name: user.name, issuedAt, token });
}