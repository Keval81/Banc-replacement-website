import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./db";
import { z } from "zod";
import { authSecret, isAuthConfigured } from "./auth-config";

export { isAuthConfigured };

// Credentials validation schema
const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Extended User type with role
interface ExtendedUser {
  id: string;
  email: string;
  name?: string | null;
  role?: string;
  image?: string | null;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  // Explicit secret + trustHost so a missing env var fails loudly at config
  // time (see isAuthConfigured) rather than 500-ing every /api/auth/session.
  secret: authSecret,
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    newUser: "/account",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validated = credentialsSchema.safeParse(credentials);
        
        if (!validated.success) {
          return null;
        }

        const { email, password } = validated.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        } as ExtendedUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const extendedUser = user as ExtendedUser;
        token.id = extendedUser.id;
        token.role = extendedUser.role;
      }
      
      // Handle session updates
      if (trigger === "update" && session) {
        token.name = session.name;
        token.image = session.image;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Always allow sign in
      return true;
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      // Log sign in events if needed
      console.log(`User signed in with ${account?.provider}`);
    },
  },
});

// Helper function for server components
export async function getSession() {
  return auth();
}

// Helper to get current user
export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

/**
 * Id of the signed-in user, or null. Safe to call when auth is not configured
 * (returns null instead of letting NextAuth throw MissingSecret).
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  if (!isAuthConfigured) return null;
  try {
    const session = await auth();
    return session?.user?.id ?? null;
  } catch (error) {
    console.error("[auth] session lookup failed", error);
    return null;
  }
}
