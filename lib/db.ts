import { PrismaClient } from "@prisma/client";
import { ContactSubmission, ValuationRequest } from "./validation";

// Prisma client singleton
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// In-memory storage for form submissions (until database is fully migrated)
const contactSubmissions: ContactSubmission[] = [];
const valuationRequests: ValuationRequest[] = [];

// Generate unique IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Legacy in-memory database for form submissions
export const db = {
  // Contact Submissions
  contact: {
    create: async (data: Omit<ContactSubmission, "id" | "createdAt">): Promise<ContactSubmission> => {
      const submission: ContactSubmission = {
        ...data,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      contactSubmissions.push(submission);
      console.log("[DB] Contact submission created:", submission.id);
      return submission;
    },

    findAll: async (): Promise<ContactSubmission[]> => {
      return [...contactSubmissions].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },

    findById: async (id: string): Promise<ContactSubmission | null> => {
      return contactSubmissions.find(s => s.id === id) || null;
    },

    updateStatus: async (id: string, status: ContactSubmission["status"]): Promise<ContactSubmission | null> => {
      const submission = contactSubmissions.find(s => s.id === id);
      if (submission) {
        submission.status = status;
        return submission;
      }
      return null;
    },

    getCount: async (): Promise<number> => {
      return contactSubmissions.length;
    },
  },

  // Valuation Requests
  valuation: {
    create: async (data: Omit<ValuationRequest, "id" | "createdAt">): Promise<ValuationRequest> => {
      const request: ValuationRequest = {
        ...data,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      valuationRequests.push(request);
      console.log("[DB] Valuation request created:", request.id);
      return request;
    },

    findAll: async (): Promise<ValuationRequest[]> => {
      return [...valuationRequests].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },

    findById: async (id: string): Promise<ValuationRequest | null> => {
      return valuationRequests.find(r => r.id === id) || null;
    },

    updateStatus: async (id: string, status: ValuationRequest["status"]): Promise<ValuationRequest | null> => {
      const request = valuationRequests.find(r => r.id === id);
      if (request) {
        request.status = status;
        return request;
      }
      return null;
    },

    getCount: async (): Promise<number> => {
      return valuationRequests.length;
    },
  },
};
