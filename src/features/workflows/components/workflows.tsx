"use client"


import { formatDistanceToNow } from "date-fns"
import { EmptyView, EntityContainer, EntityHeader, EntityItem, EntityList, EntityPagination, EntitySearch, ErrorView, LoadingView } from "@/components/entity-views";
import { useCreateWorkflow, useRemoveWorkflow, useSuspenseWorkflows } from "../hooks/user-workflows"
import React from "react";
import { useUpgradeModal } from "@/hooks/use-upgrade-model";
import { useRouter } from "next/navigation";
import { useWorkflowsParams } from "../hooks/use-workflows-params"
import { useEntitySearch } from "@/hooks/use-entity-search";
import type { Workflow } from "../../../../generated/prisma";
import { WorkflowIcon } from "lucide-react";




export const WorkflowsSearch = () => {
    const [params, setParams] = useWorkflowsParams();

    const { searchValue, onSearchChange } = useEntitySearch({
        params, setParams
    })
    return (
        <EntitySearch value={searchValue} onChange={onSearchChange} placeholder="Search workflows" />
    )
}

export const WorkflowsList = () => {
    const workflows = useSuspenseWorkflows();

    return (
        <EntityList<Workflow>
            items={workflows.data.items}
            getKey={(workflow) => workflow.id}
            renderItem={(workflow) => <WorkflowItem data={workflow} />}
            emptyView={<WorkflowsEmpty></WorkflowsEmpty>}
        />)
}

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
    const createWorkflow = useCreateWorkflow();
    const router = useRouter()
    const { handleError, UpgradeModal } = useUpgradeModal();
    const handleCreate = () => {
        createWorkflow.mutate(undefined, {
            onSuccess: (data) => {
                router.push(`/workflows/${data.id}`)
            },
            onError: (error) => {
                handleError(error)
            }
        })
    }
    return (
        <>
            <UpgradeModal />
            <EntityHeader title="Workflows"
                description="Create and manage your workflows"
                onNew={handleCreate}
                newButtonLabel="new workflows"
                disabled={disabled}
                isCreating={createWorkflow.isPending} />
        </>
    )
}

export const WorkflowsPagination = () => {
    const workflows = useSuspenseWorkflows();
    const [params, setParams] = useWorkflowsParams()

    return (
        <EntityPagination disabled={workflows.isFetching} totalPages={workflows.data.totalPages} page={workflows.data.page} onPageChange={(page) => setParams({ ...params, page })}></EntityPagination>
    )
}

export const WorkflowsContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <EntityContainer header={<WorkflowsHeader />} search={<WorkflowsSearch />} pagination={<WorkflowsPagination />}>
            {children}
        </EntityContainer>
    )
}

export const WorkflowsLoading = () => {
    return <LoadingView entity="workflows" message="Loading workflows" />
}

export const WorkflowsError = () => {
    return <ErrorView message="Error on loading" />
}

export const WorkflowsEmpty = () => {
    const createWorkflows = useCreateWorkflow();
    const { handleError, UpgradeModal } = useUpgradeModal();
    const router = useRouter()
    const handleCreate = () => {
        createWorkflows.mutate(undefined, {
            onError: (error) => {
                handleError(error)
            },
            onSuccess: (data) => {
                router.push(`/workflows/${data.id}`)
            }
        })
    }
    return (

        <>
            <UpgradeModal />
            <EmptyView onNew={handleCreate} message="You havent creted any workflows yet." />
        </>
    )
}


export const WorkflowItem = ({ data }: { data: Workflow }) => {

    const removeWorkflow = useRemoveWorkflow();

    const handleRemove = () => {
        removeWorkflow.mutate({ id: data.id })
    }
    return (
        <EntityItem href={`/workflows/${data.id}`} title={data.name} subtitle={<>Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}{" "}&bull; Created{" "} {formatDistanceToNow(data.createdAt, { addSuffix: true })}</>}
            image={<div className="size-8 flex items-center justify-center">
                <WorkflowIcon className="size-5 text-muted-foreground" />
            </div>}
            onRemove={handleRemove}
            isRemoving={removeWorkflow.isPending}


        />)
}