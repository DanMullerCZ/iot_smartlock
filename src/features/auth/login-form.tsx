import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface LoginErrorResponse {
    error?: string;
}

interface LoginSuccessResponse {
    email: string;
    uuid: string;
    name: string;
    issuedAt: string | number;
    token: string;
}

async function readJson(response: Response): Promise<unknown> {
    try {
        return (await response.json()) as unknown;
    } catch {
        return {};
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function isLoginErrorResponse(value: unknown): value is LoginErrorResponse {
    return isRecord(value) && (value.error === undefined || typeof value.error === "string");
}

function isLoginSuccessResponse(value: unknown): value is LoginSuccessResponse {
    return (
        isRecord(value) &&
        typeof value.email === "string" &&
        typeof value.uuid === "string" &&
        typeof value.name === "string" &&
        (typeof value.issuedAt === "string" || typeof value.issuedAt === "number") &&
        typeof value.token === "string"
    );
}

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const form = e.currentTarget;
        const email = (form.elements.namedItem("email") as HTMLInputElement).value;
        const password = (form.elements.namedItem("password") as HTMLInputElement).value;

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { Authorization: `Basic ${btoa(`${email}:${password}`)}` },
        });

        if (!res.ok) {
            setLoading(false);

            const data = await readJson(res);

            if (isLoginErrorResponse(data)) {
                setError(data.error ?? "Invalid email or password.");
            } else {
                setError("Invalid email or password.");
            }

            return;
        }

        const data = await readJson(res);

        if (!isLoginSuccessResponse(data)) {
            setLoading(false);
            setError("Unexpected login response. Please try again.");
            return;
        }

        const result = await signIn("credentials", {
            email: data.email,
            uuid: data.uuid,
            name: data.name,
            issuedAt: String(data.issuedAt),
            token: data.token,
            redirect: false,
        });

        setLoading(false);

        if (result?.error) {
            setError("Sign in failed. Please try again.");
        } else {
            router.push("/dashboard");
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <div>
                <Button variant="ghost" asChild>
                    <Link href="/" className="text-sm text-muted-foreground">
                        &larr; Back to home
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Sign in to your account</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form
                        onSubmit={(e) => {
                            void handleSubmit(e);
                        }}
                    >
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    autoComplete="email"
                                    required
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                />
                            </Field>

                            {error && (
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            )}

                            <Field>
                                <Button type="submit" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Spinner />
                                            Signing in…
                                        </>
                                    ) : (
                                        "Sign in"
                                    )}
                                </Button>

                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => {
                                        void signIn("google", { callbackUrl: "/dashboard" });
                                    }}
                                    className="w-full"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        width="16"
                                        height="16"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    Continue with Google
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>

                <CardFooter>
                    <Field>
                        <FieldDescription className="text-center">
                            Don&apos;t have an account? <a href="/register">Sign up</a>
                        </FieldDescription>
                    </Field>
                </CardFooter>
            </Card>
        </div>
    );
}
