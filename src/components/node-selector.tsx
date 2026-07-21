"use client"
import { createId } from "@paralleldrive/cuid2"
import { useReactFlow } from "@xyflow/react"
import {
    GlobeIcon,
    MousePointerIcon,
    WebhookIcon,
    PlusIcon,
    SearchIcon,
} from "lucide-react"

import { useCallback, useMemo, useState } from "react"
import { toast } from "sonner"
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger
} from "@/components/ui/sheet"

import { NodeType } from "../../generated/prisma"
import { Separator } from "./ui/separator"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ScrollArea } from "./ui/scroll-area"
import { cn } from "@/lib/utils"

export type NodeTypeOption = {
    type: NodeType;
    label: string;
    descrition: string;
    icon: React.ComponentType<{ className?: string }> | string;
}

// n8n-style categories: triggers (start the flow) and actions (do something)
const TRIGGER_OPTIONS: NodeTypeOption[] = [
    {
        type: NodeType.INITIAL,
        label: "Initial Trigger",
        descrition: "Default entry point of the flow",
        icon: WebhookIcon,
    },
    {
        type: NodeType.MANUAL_TRIGGER,
        label: "Manual Trigger",
        descrition: "Starts the flow manually, with a click",
        icon: MousePointerIcon,
    },
]

const ACTION_OPTIONS: NodeTypeOption[] = [
    {
        type: NodeType.HTTP_REQUEST,
        label: "HTTP Request",
        descrition: "Sends an HTTP request to a URL",
        icon: GlobeIcon,
    },
]

export const NODE_SELECTOR_OPTIONS = [...TRIGGER_OPTIONS, ...ACTION_OPTIONS]

type NodeSelectorProps = {
    children?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function NodeSelector({ children, open: controlledOpen, onOpenChange }: NodeSelectorProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const [search, setSearch] = useState("")
    const { addNodes, getNodes, screenToFlowPosition } = useReactFlow()

    // Supports both controlled usage (open/onOpenChange passed by the parent)
    // and uncontrolled usage (component manages its own open state)
    const open = controlledOpen ?? internalOpen
    const setOpen = onOpenChange ?? setInternalOpen

    const query = search.trim().toLowerCase()

    const filteredTriggers = useMemo(
        () =>
            TRIGGER_OPTIONS.filter(
                (option) =>
                    option.label.toLowerCase().includes(query) ||
                    option.descrition.toLowerCase().includes(query)
            ),
        [query]
    )

    const filteredActions = useMemo(
        () =>
            ACTION_OPTIONS.filter(
                (option) =>
                    option.label.toLowerCase().includes(query) ||
                    option.descrition.toLowerCase().includes(query)
            ),
        [query]
    )

    const hasResults = filteredTriggers.length > 0 || filteredActions.length > 0

    const handleSelect = useCallback(
        (option: NodeTypeOption) => {
            // Impede adicionar um segundo trigger do mesmo tipo no fluxo
            const isTrigger = TRIGGER_OPTIONS.some((trigger) => trigger.type === option.type)
            if (isTrigger) {
                const alreadyExists = getNodes().some((node) => node.type === option.type)
                if (alreadyExists) {
                    toast.error(`"${option.label}" já existe neste fluxo`)
                    return
                }
            }

            // Finds the react-flow pane on screen and converts its center
            // (in screen coordinates) into flow coordinates
            const paneBounds = document.querySelector(".react-flow")?.getBoundingClientRect()
            const centerScreenX = paneBounds ? paneBounds.x + paneBounds.width / 2 : window.innerWidth / 2
            const centerScreenY = paneBounds ? paneBounds.y + paneBounds.height / 2 : window.innerHeight / 2

            const position = screenToFlowPosition({
                x: centerScreenX + (Math.random() - 0.5) * 40,
                y: centerScreenY + (Math.random() - 0.5) * 40,
            })

            addNodes({
                id: createId(),
                type: option.type,
                position,
                data: { label: option.label },
            })

            toast.success(`"${option.label}" added to the flow`)
            setSearch("")
            setOpen(false)
        },
        [addNodes, getNodes, screenToFlowPosition, setOpen]
    )

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {children ?? (
                    <Button variant="outline" className="gap-2">
                        <PlusIcon className="size-4" />
                        Add node
                    </Button>
                )}
            </SheetTrigger>

            <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
                <SheetHeader className="gap-3 border-b p-4">
                    <SheetTitle>What happens next?</SheetTitle>
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            autoFocus
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search for a node..."
                            className="pl-9"
                        />
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1">
                    <div className="flex flex-col gap-4 p-4">
                        {filteredTriggers.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <span className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Triggers
                                </span>
                                <div className="flex flex-col gap-1">
                                    {filteredTriggers.map((option) => {
                                        const Icon = option.icon
                                        return (
                                            <button
                                                key={option.type}
                                                type="button"
                                                onClick={() => handleSelect(option)}
                                                className={cn(
                                                    "flex w-full items-start gap-3 rounded-md border border-transparent p-3 text-left",
                                                    "transition-colors hover:border-border hover:bg-accent"
                                                )}
                                            >
                                                <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted">
                                                    {typeof Icon === "string" ? (
                                                        <img src={Icon} alt="" className="size-5" />
                                                    ) : (
                                                        <Icon className="size-5" />
                                                    )}
                                                </span>
                                                <span className="flex flex-col gap-0.5">
                                                    <span className="text-sm font-medium">{option.label}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {option.descrition}
                                                    </span>
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {filteredTriggers.length > 0 && filteredActions.length > 0 && (
                            <Separator />
                        )}

                        {filteredActions.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <span className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Actions
                                </span>
                                <div className="flex flex-col gap-1">
                                    {filteredActions.map((option) => {
                                        const Icon = option.icon
                                        return (
                                            <button
                                                key={option.type}
                                                type="button"
                                                onClick={() => handleSelect(option)}
                                                className={cn(
                                                    "flex w-full items-start gap-3 rounded-md border border-transparent p-3 text-left",
                                                    "transition-colors hover:border-border hover:bg-accent"
                                                )}
                                            >
                                                <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted">
                                                    {typeof Icon === "string" ? (
                                                        <img src={Icon} alt="" className="size-5" />
                                                    ) : (
                                                        <Icon className="size-5" />
                                                    )}
                                                </span>
                                                <span className="flex flex-col gap-0.5">
                                                    <span className="text-sm font-medium">{option.label}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {option.descrition}
                                                    </span>
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {!hasResults && (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No nodes found for &quot;{search}&quot;
                            </p>
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}