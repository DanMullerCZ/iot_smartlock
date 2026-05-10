function replacer(_key: string, value: unknown): unknown {
    return typeof value === "bigint" ? value.toString() : value;
}

export function jsonBigInt(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data, replacer), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}
