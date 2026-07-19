import { requireAuth } from "@/lib/auth-utils";

interface PageProps{
    params:Promise<{
        executionlId:string,
    }>
}


const Page = async ({params}:PageProps)=>{
    await requireAuth();
    const {executionlId} = await params;
    return (
        <p>Credential id {executionlId}</p>
    )
}

export default Page;