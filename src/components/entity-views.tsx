"use client";

import Link from "next/link";
import { Loader2Icon, MoreVerticalIcon, PencilIcon, PlusIcon, SearchIcon ,  Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    AlertCircleIcon,
    InboxIcon
} from "lucide-react";
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
    EmptyContent,
} from "@/components/ui/empty";
import React from "react";
import { Input } from "./ui/input";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardAction,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuShortcut,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";

type EntityHeaderProps = {
    title: string;
    description?: string;
    newButtonLabel?: string;
    disabled?: boolean;
    isCreating?: boolean;
} & (
    | { onNew: () => void; newButtonHref?: never }
    | { newButtonHref: string; onNew?: never }
    | { onNew?: never; newButtonHref?: never }
);

export const EntityHeader = ({
    title,
    description,
    onNew,
    newButtonHref,
    newButtonLabel,
    disabled,
    isCreating,
}: EntityHeaderProps) => {
    const showButton = !!onNew || !!newButtonHref;

    return (
        <div className="flex flex-row items-center justify-between gap-x-4">
            <div className="flex flex-col">
                <h1 className="text-lg md:text-xl font-semibold">{title}</h1>
                {description && (
                    <p className="text-xs md:text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>

            {showButton && (
                <>
                    {onNew && (
                        <Button
                            onClick={onNew}
                            disabled={disabled || isCreating}
                        >
                            {isCreating ? (
                                <Loader2Icon className="size-4 animate-spin" />
                            ) : (
                                <PlusIcon className="size-4" />
                            )}
                            {newButtonLabel ?? "New"}
                        </Button>
                    )}

                    {newButtonHref && (
                        <Button
                            asChild
                            disabled={disabled || isCreating}
                        >
                            <Link href={newButtonHref} prefetch>
                                {isCreating ? (
                                    <Loader2Icon className="size-4 animate-spin" />
                                ) : (
                                    <PlusIcon className="size-4" />
                                )}
                                {newButtonLabel ?? "New"}
                            </Link>
                        </Button>
                    )}
                </>
            )}
        </div>
    );
};

type EntityContainerProps = {
    header?: React.ReactNode;
    search?: React.ReactNode;
    children: React.ReactNode;
    pagination?: React.ReactNode;

};

export const EntityContainer = ({
    header,
    search,
    children,
    pagination,

}: EntityContainerProps) => {
    return (
        <div className="p-4 md:px-10 md:py-6 h-full">
            <div className="mx-auto max-w-screen-xl">{header}
        
        <div className="flex flex-col gap-y-4 h-full">
            {search}
            {children}
        </div>
        {pagination}
        </div></div>
    );
};

interface EntitySearchProps{
    value:string;
    onChange:(value:string)=>void;
    placeholder?:string;
}
export const EntitySearch = ({value,onChange,placeholder="Search"}:EntitySearchProps) =>{
    return (
        <div className="relative ml-auto">
            <SearchIcon className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></SearchIcon>
            <Input className="max-w-[200px] bg-background shadow-none border-border pl-8"  placeholder={placeholder}  value={value} onChange={(e)=>onChange(e.target.value)} />
        </div>
    )
}

interface EnityPaginationProps {
    page:number;
    totalPages:number;
    onPageChange: (page:number)=>void;
    disabled?:boolean
}

export const EntityPagination = ({
    page,totalPages , onPageChange , disabled
}:EnityPaginationProps) =>{
    return (
        <div className="flex items-center justify-between gap-x-2">
            <div className="flex-1 text-sm text-muted-foreground">
                Page {page} of {totalPages || 1}
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button disabled={page===1 || disabled} variant="outline" size="sm" onClick={()=>onPageChange(Math.max(1,page-1))}>
                    Previous
                </Button>
                <Button disabled={page===totalPages || totalPages===0 || disabled} variant="outline" size="sm" onClick={()=>onPageChange(Math.min(totalPages,page+1))}>
                    Next
                </Button>

            </div>
        </div>

    )
}

interface StateViewProps {
    message?: string;
}

interface LoadingViewProps extends StateViewProps {
    entity?: string;
}

export const LoadingView = ({ entity, message }: LoadingViewProps) => {
    return (
        <div className="flex flex-col items-center justify-center gap-y-2 py-10 text-muted-foreground">
            <Loader2Icon className="size-6 animate-spin" />
            <p className="text-sm">
                {message ?? `Loading ${entity ?? "data"}...`}
            </p>
        </div>
    );
};



export const ErrorView = ({ message}: StateViewProps) => {
    return (
        <div className="flex flex-col items-center justify-center gap-y-2 py-10 text-center">
            <AlertCircleIcon className="size-6 text-destructive" />
            <p className="text-sm text-muted-foreground">
                {message ?? "Something went wrong. Please try again."}
            </p>
            
        </div>
    );
};

interface EmptyViewProps extends StateViewProps {
    entity?: string;
    onNew?: () => void;
    newButtonLabel?: string;
}

export const EmptyView = ({
    entity,
    message,
    onNew,
    newButtonLabel,
}: EmptyViewProps) => {
    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <InboxIcon />
                </EmptyMedia>
                <EmptyTitle>No {entity ?? "results"} found</EmptyTitle>
                <EmptyDescription>
                    {message ?? `You don't have any ${entity ?? "results"} yet.`}
                </EmptyDescription>
            </EmptyHeader>
            {onNew && (
                <EmptyContent>
                    <Button size="sm" onClick={onNew}>
                        <PlusIcon className="size-4" />
                        {newButtonLabel ?? "New"}
                    </Button>
                </EmptyContent>
            )}
        </Empty>
    );
};

interface EntityListProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    getKey?: (item: T, index: number) => string | number;
    emptyView?: React.ReactNode;
    className?: string;
}

export const EntityList = <T,>({
    items,
    renderItem,
    getKey,
    emptyView,
    className,
}: EntityListProps<T>) => {
    if (items.length === 0) {
        return <>{emptyView ?? <EmptyView />}</>;
    }

    return (
        <div className={cn("flex flex-col gap-y-2", className)}>
            {items.map((item, index) => (
                <div key={getKey ? getKey(item, index) : index}>
                    {renderItem(item, index)}
                </div>
            ))}
        </div>
    );
};


interface EntityItemProps {
    href: string;
    title: string;
    subtitle?: React.ReactNode;
    image?: React.ReactNode;
    actions?: React.ReactNode;
    onRemove?: () => void | Promise<void>;
    isRemoving?: boolean;
    className?: string;
}

export const EntityItem = ({
    href,
    title,
    subtitle,
    image,
    actions,
    onRemove,
    isRemoving,
    className,
}: EntityItemProps) => {
    const handleRemove = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isRemoving) {
            return;
        }
        if (onRemove) {
            await onRemove();
        }
    };

    return (
        <Card className={cn("transition-colors hover:bg-accent/50", className)}>
            <CardHeader>
                <Link href={href} prefetch className="flex min-w-0 flex-col gap-y-1">
                    <CardTitle className="truncate">{title}</CardTitle>
                    {subtitle && (
                        <CardDescription className="truncate">
                            {subtitle}
                        </CardDescription>
                    )}
                </Link>

                {(actions || onRemove) && (
                    <CardAction>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={isRemoving}
                                    className="text-muted-foreground"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {isRemoving ? (
                                        <Loader2Icon className="size-4 animate-spin" />
                                    ) : (
                                        <MoreVerticalIcon className="size-4" />
                                    )}
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                <DropdownMenuGroup>
                                    <DropdownMenuItem asChild>
                                        <Link href={href}>
                                            <PencilIcon className="size-4" />
                                            Edit
                                            <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
                                        </Link>
                                    </DropdownMenuItem>

                                    {actions}

                                    {onRemove && (
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>
                                                <Trash2Icon className="size-4" />
                                                Remove
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuPortal>
                                                <DropdownMenuSubContent>
                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        onClick={handleRemove}
                                                    >
                                                        Confirm remove
                                                    </DropdownMenuItem>
                                                </DropdownMenuSubContent>
                                            </DropdownMenuPortal>
                                        </DropdownMenuSub>
                                    )}
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardAction>
                )}
            </CardHeader>

            {image && (
                <CardContent>
                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                        {image}
                    </div>
                </CardContent>
            )}
        </Card>
    );
};