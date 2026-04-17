import { createUser } from "@/lib/api/users";
import { registerSchema } from "@/lib/validations/user";
import { Prisma } from "@/generated/prisma/client";

function parseBasicAuth(header: string | null): { email: string; password: string } | null {
  if (!header?.startsWith("Basic ")) return null;
  const decoded = Buffer.from(header.slice(6), "base64").toString("utf-8");
  const colonIndex = decoded.indexOf(":");
  if (colonIndex === -1) return null;
  return {
    email: decoded.slice(0, colonIndex),
    password: decoded.slice(colonIndex + 1),
  };
}

export async function POST(request: Request) {
  const credentials = parseBasicAuth(request.headers.get("Authorization"));
  if (!credentials) {
    return Response.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const parsed = registerSchema.safeParse({
    ...body,
    email: credentials.email,
    password: credentials.password,
  });

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  try {
    const user = await createUser(
      parsed.data.email,
      parsed.data.password,
      parsed.data.name,
    );
    return Response.json(user, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json({ error: "Email already registered" }, { status: 409 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}