import { prisma } from "../../../../prisma/prisma";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { generateSalt, hashPassword } from "@/utils/passwordHasher";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { logger } from "@/utils/pino";
import { now } from "@/lib/daysjs";
import { ShiftType } from "@prisma/client";

export const usersRouter = createTRPCRouter({
  resetPassword: protectedProcedure
    .input(z.object({ userId: z.string(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { userId, password } = input;

      const exists = await db.user.findUnique({ where: { id: userId } });
      if (!exists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not Found",
        });
      }

      const salt = generateSalt();
      const hashed = await hashPassword(password, salt);

      const updatedUser = await db.user.update({
        where: { id: userId },
        data: { password: hashed, salt },
      });
      return { newPassword: password };
    }),
  assignshift: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        type: z.nativeEnum(ShiftType), // one value
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { type: templateType, userId } = input;

      // 1) Find the template by its type
      const template = await ctx.db.shiftTemplate.findFirst({
        where: { type: templateType },
        select: { id: true, userIDs: true },
      });
      if (!template) {
        throw new Error(`ShiftTemplate with type ${templateType} not found`);
      }
      const templateId = template.id;

      // 2) Get the user’s current ShiftTemplatesIDs
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: { ShiftTemplatesIDs: true },
      });
      if (!user) {
        throw new Error("User not found");
      }

      const alreadyLinked = user.ShiftTemplatesIDs.includes(templateId);

      if (alreadyLinked) {
        // Remove link
        await ctx.db.user.update({
          where: { id: userId },
          data: {
            ShiftTemplatesIDs: {
              set: user.ShiftTemplatesIDs.filter((id) => id !== templateId),
            },
          },
        });

        await ctx.db.shiftTemplate.update({
          where: { id: templateId },
          data: {
            userIDs: {
              set: template.userIDs.filter((id) => id !== userId),
            },
          },
        });

        logger.debug({ status: "removed", templateType });
        return { status: "removed", templateType };
      } else {
        // Add link
        await ctx.db.user.update({
          where: { id: userId },
          data: {
            ShiftTemplatesIDs: {
              push: templateId,
            },
          },
        });

        await ctx.db.shiftTemplate.update({
          where: { id: templateId },
          data: {
            userIDs: {
              push: userId,
            },
          },
        });
        logger.debug({ status: "added", templateType });
        return { status: "added", templateType };
      }
    }),
  switchActivate: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const { userId } = input;

      // Ensure only admins can toggle activation
      if (session.user.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only admins can perform this action",
        });
      }

      // Find the user
      const user = await db.user.findUnique({
        where: { id: userId, role: "user" },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Toggle activation
      const updatedUser = await db.user.update({
        where: { id: userId },
        data: { activated: !user.activated },
        select: { name: true, activated: true }, // return minimal useful info
      });

      return updatedUser;
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string(),
            date: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { cursor, limit } = input;

      const data = await db.user.findMany({
        where: { role: "user" },
        include: {
          _count: { select: { Operation: true } },
          ShiftTemplates: true,
        },
        omit: {
          password: true,
          emailVerified: true,
          salt: true,
        },
        orderBy: [
          { createdAt: "desc" },
          { id: "desc" }, // secondary key for stable ordering
        ],
        take: limit + 1, // fetch one extra to check if there's more
        ...(cursor
          ? {
              cursor: { createdAt: cursor.date, id: cursor.id },
              skip: 1,
            }
          : {}),
      });
      logger.debug(data, "Users");

      const hasMore = data.length > limit;
      //remove last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data;
      // set the next cursor to the last item if there is more data
      const lastItem = items[items.length - 1];

      return {
        items,
        nextCursor:
          hasMore && lastItem
            ? {
                id: lastItem.id,
                date: lastItem.createdAt,
              }
            : null,
      };
    }),
  register: protectedProcedure
    .input(
      z.object({
        username: z.string().min(1),
        password: z.string().min(1),
        email: z.string().min(1).email(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { email, password, username } = input;
        const { db } = ctx;

        const exists = await db.user.findUnique({ where: { email } });
        if (exists) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email already in use",
          });
        }

        const salt = generateSalt();
        const hashed = await hashPassword(password, salt);

        await prisma.user.create({
          data: {
            email,
            password: hashed,
            name: username,
            salt,
            createdAt: now().toDate(),
          },
        });

        return { success: true };
      } catch (err) {
        logger.error({ err }, "Registration error");
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
