import { EyeIcon, EyeOffIcon } from "lucide-react";
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
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

function getStrength(password: string): 0 | 1 | 2 | 3 {
    if (password.length === 0) {
        return 0;
    }

    let score = 0;

    if (password.length >= 8) {
        score++;
    }

    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) {
        score++;
    }

    if (/[0-9]/.test(password)) {
        score++;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
        score++;
    }

    if (score <= 1) {
        return 1;
    }

    if (score === 2) {
        return 2;
    }

    return 3;
}

const STRENGTH_LABEL = ["", "Weak", "Fair", "Strong"] as const;
const STRENGTH_TEXT = ["", "text-red-500", "text-yellow-500", "text-green-500"] as const;

interface ApiErrorResponse {
    error?: string;
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

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
    return isRecord(value) && (value.error === undefined || typeof value.error === "string");
}

export function RegisterForm({ className, ...props }: React.ComponentProps<"div">) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [strength, setStrength] = useState<0 | 1 | 2 | 3>(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    const isValid =
        name.trim().length > 0 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
        password.length >= 8 &&
        password.length <= 64 &&
        confirm === password;

    async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const token = btoa(`${email}:${password}`);

        const res = await fetch("/api/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${token}`,
            },
            body: JSON.stringify({ name }),
        });

        setLoading(false);

        if (res.status === 201) {
            router.push("/login");
            return;
        }

        const data = await readJson(res);

        if (res.status === 409) {
            setError("An account with this email already exists.");
            return;
        }

        if (res.status === 422) {
            setError("Please check your input and try again.");
            return;
        }

        if (isApiErrorResponse(data)) {
            setError(data.error ?? "Something went wrong. Please try again.");
            return;
        }

        setError("Something went wrong. Please try again.");
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
                    <CardTitle>Create an account</CardTitle>
                    <CardDescription>
                        Enter your email below to create a new account
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
                                <FieldLabel htmlFor="name">Name</FieldLabel>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                    }}
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                    }}
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                <InputGroup>
                                    <InputGroupInput
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        value={password}
                                        minLength={8}
                                        maxLength={64}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setStrength(getStrength(e.target.value));
                                        }}
                                    />
                                    <InputGroupAddon align="inline-end">
                                        <Button
                                            variant={null}
                                            type="button"
                                            onClick={() => {
                                                setShowPassword((v) => {
                                                    return !v;
                                                });
                                            }}
                                        >
                                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                        </Button>
                                    </InputGroupAddon>
                                </InputGroup>
                                <FieldDescription className="text-xs inline-flex items-center justify-between gap-1">
                                    * 8-64 characters
                                    {strength > 0 && (
                                        <span className={cn(STRENGTH_TEXT[strength])}>
                                            {STRENGTH_LABEL[strength]} password
                                        </span>
                                    )}
                                </FieldDescription>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="confirm">Confirm password</FieldLabel>
                                <InputGroup>
                                    <InputGroupInput
                                        id="confirm"
                                        name="confirm"
                                        type={showConfirm ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        value={confirm}
                                        minLength={8}
                                        maxLength={64}
                                        onChange={(e) => {
                                            setConfirm(e.target.value);
                                        }}
                                    />
                                    <InputGroupAddon align="inline-end">
                                        <Button
                                            variant={null}
                                            type="button"
                                            onClick={() => {
                                                setShowConfirm((v) => {
                                                    return !v;
                                                });
                                            }}
                                        >
                                            {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                                        </Button>
                                    </InputGroupAddon>
                                </InputGroup>
                            </Field>

                            {error && (
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            )}

                            <Field>
                                <Button type="submit" disabled={loading || !isValid}>
                                    {loading ? (
                                        <>
                                            <Spinner />
                                            Creating account…
                                        </>
                                    ) : (
                                        "Create account"
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
                                    Sign up with Google
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>

                <CardFooter>
                    <Field>
                        <FieldDescription>
                            Already have an account?{" "}
                            <Link href="/login" className="text-sm text-primary">
                                Sign in
                            </Link>
                        </FieldDescription>
                    </Field>
                </CardFooter>
            </Card>
        </div>
    );
}
