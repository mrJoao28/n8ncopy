import { requireAuth } from "@/lib/auth-utils";

const Page = async ()=>{
    await requireAuth();
    return (
        <p>WOrkflow page</p>
    )
}

export default Page;