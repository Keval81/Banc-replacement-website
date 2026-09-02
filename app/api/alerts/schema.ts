import { z } from "zod";

const criteriaSchema = z
  .object({
    minPrice: z.number().int().nonnegative().max(1_000_000_000).optional(),
    maxPrice: z.number().int().nonnegative().max(1_000_000_000).optional(),
    beds: z.number().int().min(0).max(20).optional(),
    propertyType: z.array(z.string().trim().min(1).max(40)).max(10).optional(),
    tenure: z.string().trim().max(40).optional(),
    keywords: z.string().trim().max(200).optional(),
    location: z.string().trim().max(120).optional(),
  })
  .strict();

export const createAlertSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    criteria: criteriaSchema.optional(),
    frequency: z.enum(["instant", "daily", "weekly"]).optional(),
  })
  .strict();

// Only these fields may change after creation; id/userId/createdAt are fixed.
export const updateAlertSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    criteria: criteriaSchema.optional(),
    frequency: z.enum(["instant", "daily", "weekly"]).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();
