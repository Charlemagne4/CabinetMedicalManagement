import { prisma } from "../../../../prisma/prisma";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { generateSalt, hashPassword } from "@/utils/passwordHasher";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const usersRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        username: z.string().min(1),
        password: z.string().min(1),
        email: z.string().min(1).email(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const { email, password, username } = input;

        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email already in use",
          });
        }

        const salt = generateSalt();
        const hashed = await hashPassword(password, salt);

        await prisma.user.create({
          data: { email, password: hashed, name: username, salt },
        });

        return { success: true };
      } catch (err) {
        console.error("Registration error:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Registration failed",
        });
      }
    }),
  getOne: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      //   let currentUserId: string;
      //   const existingUser = await prisma.user.findUnique({
      //     where: { id: input.userId },
      //     include: {
      //       _count: { select: { Subscribers: true, Videos: true } },
      //       Subscribers: true,
      //       // VideoReaction: true,
      //     },
      //   });
      //   if (!existingUser) throw new TRPCError({ code: "NOT_FOUND" });
      //   if (ctx.session) {
      //     currentUserId = ctx.session.user.id;
      //   }
      //   const currentIsSubscribed = existingUser.Subscribers.some(
      //     (subscriber) => subscriber.viewerId === currentUserId,
      //   );
      //   return { ...existingUser, currentIsSubscribed };
    }),
});
