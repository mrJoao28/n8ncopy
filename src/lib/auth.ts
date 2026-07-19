import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { polar, checkout, portal, webhooks } from "@polar-sh/better-auth"
import prisma from "@/lib/data"
import { polarClient } from "@/lib/polar"

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: ["google", "github"],
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    return {
                        data: {
                            ...user,
                            emailVerified: true,
                        },
                    }
                },
            },
        },
    },
    plugins: [
        polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    products: [
                        {
                            productId: process.env.POLAR_PRO_PRODUCT_ID as string,
                            slug: "pro",
                        },
                    ],
                    successUrl: process.env.POLAR_SUCCESS_URL,
                    authenticatedUsersOnly: true,
                }),
                portal(),
                webhooks({
                    secret: process.env.POLAR_WEBHOOK_SECRET as string,
                    onOrderPaid: async (payload) => {
                        // libera acesso pro usuário aqui
                        // ex: prisma.user.update({ where: { id: ... }, data: { plan: "pro" } })
                    },
                    onSubscriptionCanceled: async (payload) => {
                        // rebaixa o plano do usuário aqui
                    },
                }),
            ],
        }),
    ],
})