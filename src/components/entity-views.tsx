"use client";

import Link from "next/link";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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