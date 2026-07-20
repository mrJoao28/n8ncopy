"use client"

import { EntityContainer, EntityHeader } from "@/components/entity-views";
import { useCreateWorkflow, useSuspenseWorkflows } from "../hooks/user-workflows"
import React, { useReducer } from "react";
import { useUpgradeModal } from "@/hooks/use-upgrade-model";
import { router } from "better-auth/api";
import { useRouter } from "next/navigation";

export const WorkflowsList= ()=>{
    const workflows = useSuspenseWorkflows();

    return (
        <div className="flex-1 flex justify-center items-center">
        <p>{JSON.stringify(workflows.data,null,2)}</p>
        </div>
    )
}

export const WorkflowsHeader=({disabled}:{disabled?:boolean}) =>{
    const createWorkflow = useCreateWorkflow();
    const router = useRouter()
    const {handleError , UpgradeModal} = useUpgradeModal();
    const handleCreate = ()=>{
        createWorkflow.mutate(undefined,{
            onSuccess:(data)=>{
                router.push(`/workflows/${data.id}`)
            },
            onError:(error)=>{
                handleError(error)
            }
        })
    }
    return(
        <>
        {UpgradeModal}
        <EntityHeader title="Workflows"
        description="Create and manage your workflows"
        onNew={handleCreate}
        newButtonLabel="new workflows"
        disabled={disabled}
        isCreating = {createWorkflow.isPending}/>
        </>
    )
}

export const WorkflowsContainer = ({children}:{children:React.ReactNode})=>{
    return (
        <EntityContainer header={<WorkflowsHeader/>}  search={<></>} pagination={<></>}>
            {children}
        </EntityContainer>
    )
}