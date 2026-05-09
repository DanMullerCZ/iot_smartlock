import { SearchAlert } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";

export default function NotFound() {
    return (
        <div className="flex flex-col w-full min-h-dvh justify-center items-center">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <SearchAlert />
                    </EmptyMedia>

                    <EmptyTitle>404 - Not found</EmptyTitle>
                    <EmptyDescription>
                        The page you&apos;re looking for doesn&apos;t exist.
                    </EmptyDescription>
                </EmptyHeader>

                <EmptyContent>
                    <Button variant="outline" asChild>
                        <Link href="/">Return Home</Link>
                    </Button>
                </EmptyContent>
            </Empty>
        </div>
    );
}
