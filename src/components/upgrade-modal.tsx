"use client"

import { useState } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { authClient } from "@/lib/auth-client"

interface UpgradeModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title?: string
    description?: string
}

export function UpgradeModal({
    open,
    onOpenChange,
    title = "Faça upgrade do seu plano",
    description = "Você atingiu o limite do seu plano atual. Faça upgrade para continuar criando workflows sem restrições.",
}: UpgradeModalProps) {
    const [loading, setLoading] = useState(false)

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => onOpenChange(false)}>
                        Agora não
                    </AlertDialogCancel>
                    <AlertDialogAction
                        disabled={loading}
                        onClick={async () => {
                            setLoading(true)
                            try {
                                await authClient.checkout({
                                    slug: "pro",
                                })
                            } catch (error) {
                                console.error(error)
                            } finally {
                                setLoading(false)
                                onOpenChange(false)
                            }
                        }}
                    >
                        {loading ? "Redirecionando..." : "Ver planos"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}