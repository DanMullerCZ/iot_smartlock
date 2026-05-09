"use client";

import dynamic from "next/dynamic";

const SwaggerUIComponent = dynamic(
    () => {
        return import("./SwaggerUI");
    },
    {
        ssr: false,
        loading: () => {
            return <p>Loading API docs…</p>;
        },
    },
);

export default function DocsPage() {
    return (
        <main>
            <SwaggerUIComponent url="/api/docs" />
        </main>
    );
}
