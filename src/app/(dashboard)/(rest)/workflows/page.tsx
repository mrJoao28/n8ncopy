import { WorkflowsContainer, WorkflowsList } from "@/features/workflows/components/workflows";
import { prefetchhWorkflows } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import {ErrorBoundary} from "react-error-boundary"
import type {SearchParams} from "nuqs/server"
import { workflowsParamsLoader } from "@/features/workflows/server/params";


type Props ={
    searchParams: Promise<SearchParams>;
    
}

const Page = async ({searchParams}:Props)=>{
    await requireAuth();
    const params = await workflowsParamsLoader(searchParams)
    prefetchhWorkflows(params);
    return (
        <WorkflowsContainer>
        <HydrateClient>
            <ErrorBoundary fallback={<p>Error</p>}>
            <Suspense fallback={<p>Loading...</p>}>
            <WorkflowsList>

            </WorkflowsList>
                
            </Suspense>
            </ErrorBoundary>
        </HydrateClient>
        </WorkflowsContainer>
    )
}

export default Page;