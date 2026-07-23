import { PAGINATION } from "@/config/constants";
import { encryptSecret } from "@/lib/encryption";
import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";
import { CredentialType } from "../../../../generated/prisma";

// Fields that are safe to send to the client. `value` (the encrypted
// secret) never leaves the server.
const credentialSelect = {
    id: true,
    name: true,
    type: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
} as const;

export const credentialsRouter = createTRPCRouter({
    create: protectedProcedure
        .input(z.object({
            name: z.string().min(1, "Name is required"),
            type: z.nativeEnum(CredentialType),
            value: z.string().min(1, "Value is required"),
        }))
        .mutation(({ ctx, input }) => {
            return prisma.credential.create({
                data: {
                    name: input.name,
                    type: input.type,
                    value: encryptSecret(input.value),
                    userId: ctx.auth.user.id,
                },
                select: credentialSelect,
            })
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().min(1, "Name is required"),
            type: z.nativeEnum(CredentialType),
            // Optional on update: leave blank to keep the current secret.
            value: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            await prisma.credential.findUniqueOrThrow({
                where: { id: input.id, userId: ctx.auth.user.id },
            })

            return prisma.credential.update({
                where: { id: input.id, userId: ctx.auth.user.id },
                data: {
                    name: input.name,
                    type: input.type,
                    ...(input.value ? { value: encryptSecret(input.value) } : {}),
                },
                select: credentialSelect,
            })
        }),

    remove: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(({ ctx, input }) => {
            return prisma.credential.delete({
                where: { id: input.id, userId: ctx.auth.user.id },
                select: credentialSelect,
            })
        }),

    getOne: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(({ ctx, input }) => {
            return prisma.credential.findUniqueOrThrow({
                where: { id: input.id, userId: ctx.auth.user.id },
                select: credentialSelect,
            })
        }),

    getMany: protectedProcedure
        .input(z.object({
            page: z.number().default(PAGINATION.DEFAULT_PAGE),
            pageSize: z
                .number()
                .min(PAGINATION.MIN_PAGE_SIZE)
                .max(PAGINATION.MAX_PAGE_SIZE)
                .default(PAGINATION.DEFAULT_PAGE_SIZE),
            search: z.string().default(""),
            // Optional filter used by the AI node's credential dropdown, so
            // it only lists credentials matching the node's provider.
            type: z.nativeEnum(CredentialType).optional(),
        }))
        .query(async ({ ctx, input }) => {
            const { page, pageSize, search, type } = input

            const where = {
                userId: ctx.auth.user.id,
                name: {
                    contains: search,
                    mode: "insensitive" as const,
                },
                ...(type ? { type } : {}),
            }

            const [items, totalCount] = await Promise.all([
                prisma.credential.findMany({
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                    where,
                    orderBy: {
                        updatedAt: "desc"
                    },
                    select: credentialSelect,
                }),
                prisma.credential.count({ where })
            ]);

            const totalPages = Math.ceil(totalCount / pageSize)
            const hasNextPage = page < totalPages
            const hasPreviousPage = page > 1;

            return {
                items,
                page,
                pageSize,
                totalCount,
                totalPages,
                hasNextPage,
                hasPreviousPage
            }
        }),
})
