"use client"

import { ArrowLeftIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ErrorView, LoadingView } from "@/components/entity-views";
import { useRemoveCredential, useSuspenseCredential, useUpdateCredential } from "../hooks/use-credentials";
import { CredentialDialog, type CredentialFormValues } from "./credential-dialog";

interface Props {
    credentialId: string;
}

export const CredentialEdit = ({ credentialId }: Props) => {
    const credential = useSuspenseCredential(credentialId);
    const updateCredential = useUpdateCredential();
    const removeCredential = useRemoveCredential();
    const router = useRouter();
    const [open, setOpen] = useState(true);

    const handleSubmit = (values: CredentialFormValues) => {
        updateCredential.mutate({
            id: credentialId,
            name: values.name,
            type: values.type,
            value: values.value || undefined,
        })
    }

    const handleRemove = () => {
        removeCredential.mutate(
            { id: credentialId },
            { onSuccess: () => router.push("/credentials") }
        )
    }

    return (
        <div className="p-4 md:px-10 md:py-6">
            <div className="mx-auto max-w-screen-sm flex flex-col gap-y-4">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/credentials">
                            <ArrowLeftIcon className="size-4" />
                            Back to credentials
                        </Link>
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        disabled={removeCredential.isPending}
                        onClick={handleRemove}
                    >
                        {removeCredential.isPending ? (
                            <Loader2Icon className="size-4 animate-spin" />
                        ) : (
                            <Trash2Icon className="size-4" />
                        )}
                        Delete
                    </Button>
                </div>

                <CredentialDialog
                    mode="edit"
                    open={open}
                    onOpenChange={(next) => {
                        setOpen(next);
                        if (!next) {
                            router.push("/credentials");
                        }
                    }}
                    onSubmit={handleSubmit}
                    isSubmitting={updateCredential.isPending}
                    defaultValues={{
                        name: credential.data.name,
                        type: credential.data.type,
                    }}
                />
            </div>
        </div>
    )
}

export const CredentialEditLoading = () => {
    return <LoadingView entity="credential" message="Loading credential" />
}

export const CredentialEditError = () => {
    return <ErrorView message="Error on loading" />
}
