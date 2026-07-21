import { NodeToolbar } from "@xyflow/react";
import { SettingsIcon, TrashIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./ui/button"

interface WorkflowNodeProps {
    children: ReactNode;
    showToolbar?: boolean;
    onDelete?: () => void;
    onSettings?: () => void;
    name?: string;
    description?: string;
}

export function WorkflowNode({
    children,
    showToolbar,
    onDelete,
    onSettings,
    name,
    description,
}: WorkflowNodeProps) {
    return (
        <>
            {showToolbar && (
                <NodeToolbar>
                    <Button size="sm" variant="ghost" onClick={onSettings}>
                        <SettingsIcon className="size-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={onDelete}>
                        <TrashIcon className="size-4" />
                    </Button>
                </NodeToolbar>
            )}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm min-w-[180px]">
                {(name || description) && (
                    <div className="px-3 py-2 border-b">
                        {name && (
                            <p className="text-sm font-medium leading-none">{name}</p>
                        )}
                        {description && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {description}
                            </p>
                        )}
                    </div>
                )}

                <div className="p-3">
                    {children}
                </div>
            </div>
        </>
    )
}