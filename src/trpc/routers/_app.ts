import {createTRPCRouter} from '../init';
import { workFlowsRouter } from '@/features/workflows/server/routers';
import { credentialsRouter } from '@/features/credentials/server/routers';
 
export const appRouter = createTRPCRouter({
  workflows:workFlowsRouter,
  credentials:credentialsRouter,
});
 
// export type definition of API
export type AppRouter = typeof appRouter;
