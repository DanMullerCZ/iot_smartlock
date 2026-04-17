import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.email(),
    password: z.string().min(8).max(64),
});

export type RegisterInput = z.infer<typeof registerSchema>;
