
import { inngest } from '@/inngest/client';
import {baseProcedure,  createTRPCRouter, protectedProcedure } from '../init';
import prisma from '@/lib/data';
import {google} from "@ai-sdk/google"
import {generateText} from "ai"
 
export const appRouter = createTRPCRouter({
  textAi: baseProcedure.mutation(async () =>{
      await inngest.send({
        name:"execute/ai"
      })
  }),
    
  getWorkflows: protectedProcedure
    .query(({ctx}) => {
      return prisma.workflow.findMany({
        where:{
          id: ctx.auth.user.id
        },
      });
    }),
  createWorkflow: protectedProcedure
    .mutation(async () => {
      await inngest.send({
        name:"test/hello.world",
        data:{
          email:"joao@gmail.com"
        }
      })
      return prisma.workflow.create({

        data:{
          name: "test-workflow"
        }
      });
    }),
});
 
// export type definition of API
export type AppRouter = typeof appRouter;