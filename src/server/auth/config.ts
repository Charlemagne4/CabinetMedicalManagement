import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  CredentialsSignin,
  type NextAuthConfig,
  type Session,
  type User,
} from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { db } from "@/server/db";
import { comparePasswords } from "@/utils/passwordHasher";
import { signInFormSchema } from "@/modules/auth/ui/components/MyForm/Schema";
import { logger } from "@/utils/pino";
import { type Role } from "@prisma/client";
import type { JWT } from "next-auth/jwt";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string;
      email?: string;
      image?: string;
      role: Role;
    };
  }

  interface User {
    role?: Role;
    id?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  session: {
    strategy: "jwt", // mandatory for credentials
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email", placeholder: "Chaklamo" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "******",
        },
      },
      authorize: async (credentials) => {
        logger.debug(credentials);
        const { email, password } =
          await signInFormSchema.parseAsync(credentials);
        // Add logic here to look up the user from the credentials supplied
        const user = await db.user.findUnique({
          where: { email },
        });
        // logger.debug(`User in db: ${user?.email}`);

        if (!user) throw new Error("Invalid credentials.");
        if (!user.activated)
          throw new CredentialsSignin("Account not activated");
        if (!user.password || !user.salt || !credentials?.password) {
          // logger.warn("Missing credentials or user data during login attempt");
          return null;
        }
        logger.debug({ comparePasswords }, "result of pw comparaison");

        if (
          await comparePasswords({
            hashedPassword: user.password,
            password,
            salt: user.salt,
          })
        ) {
          // Any object returned will be saved in `user` property of the JWT
          // logger.debug(`user in db: ${user}`);
          return user;
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null;

          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  adapter: PrismaAdapter(db),
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: User }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id!,
          role: token.role! as Role,
        },
      };
    },
  },
} satisfies NextAuthConfig;
