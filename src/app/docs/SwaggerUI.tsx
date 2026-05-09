"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function SwaggerUIComponent({ url }: { url: string }) {
    return (
        <SwaggerUI
            url={url}
            persistAuthorization={true}
            tryItOutEnabled={true}
            filter={true}
            docExpansion="list"
        />
    );
}
