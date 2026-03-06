import { z } from "zod";

// ─── Auth ────────────────────────────────────────────────────

export const loginSchema = z.object({
  email_or_username: z.string().min(3, "Enter your email or username"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  username: z
    .string()
    .min(3, "At least 3 characters")
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
  password: z.string().min(8, "At least 8 characters").max(100),
  display_name: z.string().min(1, "Display name is required").max(100),
});

export const devTokenSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

// ─── Studio ──────────────────────────────────────────────────

export const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(500).optional(),
});

export const createEpisodeSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
});

export const sceneSchema = z.object({
  script_text: z.string().min(1, "Script text is required"),
  duration_seconds: z.number().min(0.1).max(120),
});

// ─── Inferred types ──────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type DevTokenInput = z.infer<typeof devTokenSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type CreateEpisodeInput = z.infer<typeof createEpisodeSchema>;
export type SceneInput = z.infer<typeof sceneSchema>;
