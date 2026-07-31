import { auth } from "@/lib/auth";
import { polarClient } from "@/lib/polar";
import { initTRPC, TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { cache } from "react";
import superjson from "superjson";

export const createTRPCContext = cache(async () => {
  return {};
});

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const protectedProcedure = baseProcedure.use(async ({ next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  return next({
    ctx: {
      auth: session,
    },
  });
});

export const premiumProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    try {
      const customer = await polarClient.customers.getStateExternal({
        externalId: ctx.auth.user.id,
      });

      if (!customer.activeSubscriptions?.length) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Active subscription required",
        });
      }

      return next({ ctx: { ...ctx, customer } });
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      // A billing-provider/network failure should not be silently converted
      // into a successful authorization decision.
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unable to verify subscription status",
        cause: error,
      });
    }
  },
);
