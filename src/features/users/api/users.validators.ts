import { z } from "zod";

export const userFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phoneNumber: z.string().min(5),
  role: z.enum(["Admin", "User", "Guest"]),
  active: z.boolean(),
  avatar: z.string().url().optional().or(z.literal("")),
  bio: z.string().max(500).optional().default(""),
});
export type UserFormInput = z.infer<typeof userFormSchema>;
