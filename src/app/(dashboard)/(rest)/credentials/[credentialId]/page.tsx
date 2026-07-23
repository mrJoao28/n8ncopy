import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary"
import { CredentialEdit, CredentialEditError, CredentialEditLoading } from "@/features/credentials/components/credential-edit";
import { prefetchCredential } from "@/features/credentials/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";

interface PageProps {
    params: Promise<{
        credentialId: string,
    }>
}

const Page = async ({ params }: PageProps) => {
    await requireAuth();
    const { credentialId } = await params;
    prefetchCredential(credentialId);

    return (
        <HydrateClient>
            <ErrorBoundary fallback={<CredentialEditError />}>
                <Suspense fallback={<CredentialEditLoading />}>
                    <CredentialEdit credentialId={credentialId} />
                </Suspense>
            </ErrorBoundary>
        </HydrateClient>
    )
}

export default Page;
