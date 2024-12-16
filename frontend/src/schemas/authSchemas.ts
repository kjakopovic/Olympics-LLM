// schemas/validationSchemas.ts

import { z } from "zod";

// Utility Regex Patterns
const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
const phoneNumberRegex = /^\+?[1-9]\d{1,14}$/; // E.164 international phone number format

export const loginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required.",
      invalid_type_error: "Email must be a string.",
    })
    .trim()
    .nonempty({ message: "Email cannot be empty." })
    .email({ message: "Please enter a valid email address." }),

  password: z
    .string({
      required_error: "Password is required.",
      invalid_type_error: "Password must be a string.",
    })
    .trim()
    .nonempty({ message: "Password cannot be empty." })
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(passwordRegex, {
      message:
        "Password must include at least one uppercase letter and one number.",
    }),

  remember_me: z.boolean().optional(), // Added field
});

export const registerSchema = z.object({
  email: z
    .string({
      required_error: "Email is required.",
      invalid_type_error: "Email must be a string.",
    })
    .trim()
    .nonempty({ message: "Email cannot be empty." })
    .email({ message: "Please enter a valid email address." }),

  password: z
    .string({
      required_error: "Password is required.",
      invalid_type_error: "Password must be a string.",
    })
    .trim()
    .nonempty({ message: "Password cannot be empty." })
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(passwordRegex, {
      message:
        "Password must include at least one uppercase letter and one number.",
    }),

  first_name: z
    .string({
      required_error: "First name is required.",
      invalid_type_error: "First name must be a string.",
    })
    .trim()
    .nonempty({ message: "First name cannot be empty." })
    .min(2, { message: "First name must be at least 2 characters long." })
    .regex(/^[A-Za-z]+$/, {
      message: "First name can only contain letters.",
    }),

  last_name: z
    .string({
      required_error: "Last name is required.",
      invalid_type_error: "Last name must be a string.",
    })
    .trim()
    .nonempty({ message: "Last name cannot be empty." })
    .min(2, { message: "Last name must be at least 2 characters long." })
    .regex(/^[A-Za-z]+$/, {
      message: "Last name can only contain letters.",
    }),

  terms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions.",
  }),
});
