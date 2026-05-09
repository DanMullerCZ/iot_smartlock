import { ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth/auth";

export default async function LandingPage() {
    const session = await getServerSession(authOptions);

    if (session) {
        redirect("/dashboard");
    }

    return (
        <div className="flex flex-1 flex-col">
            <main className="mx-auto grid min-h-[calc(100vh-1px)] w-full max-w-6xl items-center gap-10 px-4 py-10 md:grid-cols-[1fr_420px] md:px-8">
                <section className="space-y-7">
                    <div className="space-y-4">
                        <h1 className="max-w-2xl text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
                            SmartLock
                        </h1>
                        <p className="max-w-xl text-base leading-7 text-muted-foreground">
                            A focused operations console for IoT room access, RFID cards, and audit
                            trails.
                        </p>
                    </div>
                    <div className="grid max-w-xl gap-3 sm:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <ShieldCheck className="mb-3 h-5 w-5 text-emerald-600" />
                                <CardTitle>Access rules</CardTitle>
                                <CardDescription>
                                    Manage users, rooms, cards, and permissions from one dashboard.
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader>
                                <KeyRound className="mb-3 h-5 w-5 text-blue-600" />
                                <CardTitle>Real-time control</CardTitle>
                                <CardDescription>
                                    Instantly lock or unlock rooms and update access permissions on
                                    the fly.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </section>

                <Card>
                    <CardHeader>
                        <CardTitle>Open console</CardTitle>
                        <CardDescription>Sign in or create an account to continue.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                        <div className="flex w-full flex-col gap-3">
                            <Button asChild variant="default">
                                <Link href="/login">
                                    Sign in
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/register">Create an account</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
