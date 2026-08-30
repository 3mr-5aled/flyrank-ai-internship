import { z } from "zod";

export const CategoryEnum = ["billing", "bug", "feature", "other"];
export const UrgencyEnum = ["low", "normal", "high"];

export const InputSchema = z.object({
  text: z
    .string({
      required_error: "text field is required",
      invalid_type_error: "text field must be a string",
    })
    .min(1, "text field must not be empty")
    .max(2000, "text field must not exceed 2000 characters"),
});

export const OutputSchema = z.object({
  category: z.enum(CategoryEnum),
  urgency: z.enum(UrgencyEnum),
  confidence: z.number().min(0).max(1),
  reason: z.string(),
});

export const STUB_RESPONSE = {
  category: "billing",
  urgency: "normal",
  confidence: 0.95,
  reason: "User issue relates to payment processing.",
};
