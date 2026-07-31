import { PAGINATION } from "@/config/constants";
import prisma from "@/lib/db";
import {
  createTRPCRouter,
  premiumProcedure,
  protectedProcedure,
} from "@/trpc/init";
import { generateSlug } from "random-word-slugs";
import { z } from "zod";
import { NodeType } from "../../../../generated/prisma";
import type { Edge, Node } from "@xyflow/react";
import { inngest } from "@/inngest/client";

const nodeInput = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  position: z.object({
    x: z.number().finite(),
    y: z.number().finite(),
  }),
  data: z.record(z.string(), z.unknown()).default({}),
});

const edgeInput = z.object({
  id: z.string().optional(),
  source: z.string().min(1),
  target: z.string().min(1),
  sourceHandle: z.string().nullish(),
  targetHandle: z.string().nullish(),
});

const updateWorkflowInput = z.object({
  id: z.string().min(1),
  nodes: z.array(nodeInput),
  edges: z.array(edgeInput),
});

const assertValidNodeTypes = (nodes: Array<z.infer<typeof nodeInput>>) => {
  const validTypes = new Set(Object.values(NodeType));

  for (const node of nodes) {
    if (!validTypes.has(node.type as NodeType)) {
      throw new Error(`Unsupported workflow node type: ${node.type}`);
    }
  }
};

export const workFlowsRouter = createTRPCRouter({
  execute: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });

      await inngest.send({
        name: "workflows/execute.workflow",
        data: {
          workflowId: workflow.id,
        },
      });

      return workflow;
    }),

  create: premiumProcedure.mutation(({ ctx }) => {
    return prisma.workflow.create({
      data: {
        name: generateSlug(3),
        userId: ctx.auth.user.id,
        nodes: {
          create: {
            type: NodeType.INITIAL,
            position: { x: 0, y: 0 },
            name: NodeType.INITIAL,
          },
        },
      },
    });
  }),

  remove: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(({ ctx, input }) => {
      return prisma.workflow.delete({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
    }),

  update: protectedProcedure
    .input(updateWorkflowInput)
    .mutation(async ({ ctx, input }) => {
      const { id, nodes, edges } = input;

      assertValidNodeTypes(nodes);

      const nodeIds = new Set(nodes.map((node) => node.id));
      if (nodeIds.size !== nodes.length) {
        throw new Error("Workflow contains duplicate node IDs");
      }

      for (const edge of edges) {
        if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
          throw new Error("Workflow contains an edge referencing a missing node");
        }
        if (edge.source === edge.target) {
          throw new Error("Workflow cannot contain self-referencing edges");
        }
      }

      await prisma.workflow.findUniqueOrThrow({
        where: { id, userId: ctx.auth.user.id },
      });

      return prisma.$transaction(async (tx) => {
        // Connections are cascaded from their workflow, but deleting nodes
        // first also relies on the Node -> Connection cascade. Explicitly
        // remove connections to make the replacement operation deterministic.
        await tx.connection.deleteMany({ where: { workflowId: id } });
        await tx.node.deleteMany({ where: { workflowId: id } });

        await tx.node.createMany({
          data: nodes.map((node) => ({
            id: node.id,
            workflowId: id,
            name: node.type,
            type: node.type as NodeType,
            position: node.position,
            data: node.data,
          })),
        });

        if (edges.length > 0) {
          await tx.connection.createMany({
            data: edges.map((edge) => ({
              workflowId: id,
              fromNodeId: edge.source,
              toNodeId: edge.target,
              fromOutput: edge.sourceHandle || "main",
              toInput: edge.targetHandle || "main",
            })),
          });
        }

        return tx.workflow.update({
          where: { id },
          data: { updatedAt: new Date() },
          include: { nodes: true, connections: true },
        });
      });
    }),

  updateName: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().trim().min(1).max(100),
      }),
    )
    .mutation(({ ctx, input }) => {
      return prisma.workflow.update({
        where: { id: input.id, userId: ctx.auth.user.id },
        data: { name: input.name },
      });
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: input.id, userId: ctx.auth.user.id },
        include: { nodes: true, connections: true },
      });

      const nodes: Node[] = workflow.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position as { x: number; y: number },
        data: (node.data as Record<string, unknown>) || {},
      }));

      const edges: Edge[] = workflow.connections.map((connection) => ({
        id: connection.id,
        source: connection.fromNodeId,
        target: connection.toNodeId,
        sourceHandle: connection.fromOutput,
        targetHandle: connection.toInput,
      }));

      return {
        id: workflow.id,
        name: workflow.name,
        nodes,
        edges,
      };
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .coerce
          .number()
          .int()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().trim().default(""),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;
      const where = {
        userId: ctx.auth.user.id,
        name: {
          contains: search,
          mode: "insensitive" as const,
        },
      };

      const [items, totalCount] = await Promise.all([
        prisma.workflow.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where,
          orderBy: { updatedAt: "desc" },
        }),
        prisma.workflow.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        items,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    }),
});
