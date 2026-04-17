"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import React, { useState } from "react";

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
const STRENGTH_COLOR = ["", "bg-red-500", "bg-yellow-400", "bg-green-500"] as const;
const STRENGTH_TEXT = ["", "text-red-500", "text-yellow-500", "text-green-500"] as const;

function EyeIcon({ open }: { open: boolean }) {
    return open ? (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ) : (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    );
}

export default function RegisterPage() {
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

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data = await res.json();
        if (res.status === 409) {
            setError("An account with this email already exists.");
        } else if (res.status === 422) {
            setError("Please check your input and try again.");
        } else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
            setError(data?.error ?? "Something went wrong. Please try again.");
        }
    }

    return (
        <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-800 p-8 shadow-lg">
            <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                Create account
            </h1>

            <button
                type="button"
                onClick={() => void signIn("google", { callbackUrl: "/dashboard" })}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
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
            </button>

            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-xs text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                        or
                    </span>
                </div>
            </div>

            {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label
                        htmlFor="name"
                        className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                    >
                        Name
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        autoComplete="name"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                        }}
                        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label
                        htmlFor="email"
                        className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                        }}
                        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label
                        htmlFor="password"
                        className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                    >
                        Password
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            minLength={8}
                            maxLength={64}
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setStrength(getStrength(e.target.value));
                            }}
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 pr-9 text-sm outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setShowPassword((v) => {
                                    return !v;
                                });
                            }}
                            className="absolute inset-y-0 right-2.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                            tabIndex={-1}
                        >
                            <EyeIcon open={showPassword} />
                        </button>
                    </div>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">* 8–64 characters</p>
                    {strength > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex gap-1 flex-1">
                                {[1, 2, 3].map((level) => {
                                    return (
                                        <div
                                            key={level}
                                            className={`h-1 flex-1 rounded-full transition-colors ${strength >= level ? STRENGTH_COLOR[strength] : "bg-zinc-200 dark:bg-zinc-600"}`}
                                        />
                                    );
                                })}
                            </div>
                            <span className={`text-xs font-medium ${STRENGTH_TEXT[strength]}`}>
                                {STRENGTH_LABEL[strength]}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <label
                        htmlFor="confirm"
                        className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                    >
                        Confirm password
                    </label>
                    <div className="relative">
                        <input
                            id="confirm"
                            name="confirm"
                            type={showConfirm ? "text" : "password"}
                            required
                            minLength={8}
                            maxLength={64}
                            autoComplete="new-password"
                            value={confirm}
                            onChange={(e) => {
                                setConfirm(e.target.value);
                            }}
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 pr-9 text-sm outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setShowConfirm((v) => {
                                    return !v;
                                });
                            }}
                            className="absolute inset-y-0 right-2.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                            tabIndex={-1}
                        >
                            <EyeIcon open={showConfirm} />
                        </button>
                    </div>
                </div>

                {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

                <button
                    type="submit"
                    disabled={loading || !isValid}
                    className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                    {loading ? "Creating account…" : "Create account"}
                </button>
            </form>
        </div>
    );
}
