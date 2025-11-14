import { z } from "zod";

export const userFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phoneNumber: z.string().min(5),
  role: z.enum(["Admin", "User", "Guest"]),

  active: z.boolean().default(true),
  avatar: z.string().url().or(z.literal("")).default(""),
  bio: z.string().max(500).default(""),
});

export type UserFormInput = z.infer<typeof userFormSchema>;
