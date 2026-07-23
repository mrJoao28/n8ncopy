import { useTRPC } from "@/trpc/client"
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { useCredentialsParams } from "./use-credentials-params"
import type { CredentialType } from "../../../../generated/prisma"

export const useSuspenseCredentials = () => {
    const trpc = useTRPC()
    const [params] = useCredentialsParams()

    return useSuspenseQuery(trpc.credentials.getMany.queryOptions(params))
}

export const useSuspenseCredential = (id: string) => {
    const trpc = useTRPC()
    return useSuspenseQuery(trpc.credentials.getOne.queryOptions({ id }))
}

// Non-suspense: used inside dialogs/dropdowns (e.g. the AI node's
// credential picker) that shouldn't block rendering while loading.
export const useCredentialsByType = (type: CredentialType) => {
    const trpc = useTRPC()
    return useQuery(
        trpc.credentials.getMany.queryOptions({ type, pageSize: 100 })
    )
}

export const useCreateCredential = () => {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    return useMutation(
        trpc.credentials.create.mutationOptions({
            onSuccess: (data) => {
                toast.success(`Credential "${data.name}" created`)
                queryClient.invalidateQueries(trpc.credentials.getMany.queryOptions({}))
            },
            onError: (error) => {
                toast.error(`Failed to create credential ${error.message}`)
            },
        })
    )
}

export const useUpdateCredential = () => {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    return useMutation(
        trpc.credentials.update.mutationOptions({
            onSuccess: (data) => {
                toast.success(`Credential "${data.name}" updated`)
                queryClient.invalidateQueries(trpc.credentials.getMany.queryOptions({}))
                queryClient.invalidateQueries(
                    trpc.credentials.getOne.queryOptions({ id: data.id })
                )
            },
            onError: (error) => {
                toast.error(`Failed to update credential ${error.message}`)
            },
        })
    )
}

export const useRemoveCredential = () => {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    return useMutation(
        trpc.credentials.remove.mutationOptions({
            onSuccess: (data) => {
                toast.success(`Credential "${data.name}" removed`)
                queryClient.invalidateQueries(trpc.credentials.getMany.queryOptions({}))
                queryClient.invalidateQueries(
                    trpc.credentials.getOne.queryFilter({ id: data.id })
                )
            },
            onError: (error) => {
                toast.error(`Failed to remove credential ${error.message}`)
            },
        })
    )
}
