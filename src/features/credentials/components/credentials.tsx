"use client"

import { formatDistanceToNow } from "date-fns"
import { KeyIcon } from "lucide-react";
import React, { useState } from "react";
import { EmptyView, EntityContainer, EntityHeader, EntityItem, EntityList, EntityPagination, EntitySearch, ErrorView, LoadingView } from "@/components/entity-views";
import { AI_PROVIDERS } from "@/config/ai-providers";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { useCreateCredential, useRemoveCredential, useSuspenseCredentials } from "../hooks/use-credentials"
import { useCredentialsParams } from "../hooks/use-credentials-params"
import { CredentialDialog, type CredentialFormValues } from "./credential-dialog";
import { CredentialType, type Credential } from "../../../../generated/prisma";

const CREDENTIAL_TYPE_LABEL: Record<CredentialType, string> = {
    [CredentialType.GEMINI]: AI_PROVIDERS.gemini.label,
    [CredentialType.OPENAI]: AI_PROVIDERS.openai.label,
    [CredentialType.ANTHROPIC]: AI_PROVIDERS.anthropic.label,
};

export const CredentialsSearch = () => {
    const [params, setParams] = useCredentialsParams();

    const { searchValue, onSearchChange } = useEntitySearch({
        params, setParams
    })
    return (
        <EntitySearch value={searchValue} onChange={onSearchChange} placeholder="Search credentials" />
    )
}

export const CredentialsList = () => {
    const credentials = useSuspenseCredentials();

    return (
        <EntityList<Omit<Credential, "value">>
            items={credentials.data.items}
            getKey={(credential) => credential.id}
            renderItem={(credential) => <CredentialItem data={credential} />}
            emptyView={<CredentialsEmpty />}
        />)
}

export const CredentialsHeader = ({ disabled }: { disabled?: boolean }) => {
    const [open, setOpen] = useState(false);
    const createCredential = useCreateCredential();

    const handleSubmit = (values: CredentialFormValues) => {
        createCredential.mutate(
            { name: values.name, type: values.type, value: values.value ?? "" },
            { onSuccess: () => setOpen(false) }
        )
    }

    return (
        <>
            <CredentialDialog
                mode="create"
                open={open}
                onOpenChange={setOpen}
                onSubmit={handleSubmit}
                isSubmitting={createCredential.isPending}
            />
            <EntityHeader title="Credentials"
                description="Store API keys used by your AI nodes"
                onNew={() => setOpen(true)}
                newButtonLabel="new credential"
                disabled={disabled}
                isCreating={createCredential.isPending} />
        </>
    )
}

export const CredentialsPagination = () => {
    const credentials = useSuspenseCredentials();
    const [params, setParams] = useCredentialsParams()

    return (
        <EntityPagination disabled={credentials.isFetching} totalPages={credentials.data.totalPages} page={credentials.data.page} onPageChange={(page) => setParams({ ...params, page })}></EntityPagination>
    )
}

export const CredentialsContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <EntityContainer header={<CredentialsHeader />} search={<CredentialsSearch />} pagination={<CredentialsPagination />}>
            {children}
        </EntityContainer>
    )
}

export const CredentialsLoading = () => {
    return <LoadingView entity="credentials" message="Loading credentials" />
}

export const CredentialsError = () => {
    return <ErrorView message="Error on loading" />
}

export const CredentialsEmpty = () => {
    const [open, setOpen] = useState(false);
    const createCredential = useCreateCredential();

    const handleSubmit = (values: CredentialFormValues) => {
        createCredential.mutate(
            { name: values.name, type: values.type, value: values.value ?? "" },
            { onSuccess: () => setOpen(false) }
        )
    }

    return (
        <>
            <CredentialDialog
                mode="create"
                open={open}
                onOpenChange={setOpen}
                onSubmit={handleSubmit}
                isSubmitting={createCredential.isPending}
            />
            <EmptyView entity="credentials" onNew={() => setOpen(true)} message="You haven't created any credentials yet." />
        </>
    )
}

export const CredentialItem = ({ data }: { data: Omit<Credential, "value"> }) => {
    const removeCredential = useRemoveCredential();

    const handleRemove = () => {
        removeCredential.mutate({ id: data.id })
    }

    return (
        <EntityItem href={`/credentials/${data.id}`} title={data.name}
            subtitle={<>{CREDENTIAL_TYPE_LABEL[data.type]}{" "}&bull; Updated{" "}{formatDistanceToNow(data.updatedAt, { addSuffix: true })}</>}
            image={<div className="size-8 flex items-center justify-center">
                <KeyIcon className="size-5 text-muted-foreground" />
            </div>}
            onRemove={handleRemove}
            isRemoving={removeCredential.isPending}
        />)
}
