import { z } from "zod";

// Contact Form Schema
export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must agree to be contacted",
  }),
});

export type ContactFormData = z.infer<typeof contactSchema>;

// Valuation Form Schema
export const valuationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(5, "Please enter the property address"),
  postcode: z.string().min(5, "Please enter a valid postcode"),
  propertyType: z.string().optional(),
  bedrooms: z.string().optional(),
  timeframe: z.string().optional(),
  message: z.string().optional(),
});

export type ValuationFormData = z.infer<typeof valuationSchema>;

// Database model types
export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  source: string;
  status: "new" | "responded" | "closed";
  createdAt: string;
}

export interface ValuationRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  propertyType: string | null;
  bedrooms: string | null;
  timeframe: string | null;
  message: string | null;
  status: "new" | "contacted" | "valued" | "instructed";
  createdAt: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
