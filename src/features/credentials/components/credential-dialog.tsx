"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AI_PROVIDERS } from "@/config/ai-providers";
import { CredentialType } from "../../../../generated/prisma";

const CREDENTIAL_TYPE_OPTIONS = [
    { value: CredentialType.GEMINI, label: AI_PROVIDERS.gemini.label },
    { value: CredentialType.OPENAI, label: AI_PROVIDERS.openai.label },
    { value: CredentialType.ANTHROPIC, label: AI_PROVIDERS.anthropic.label },
];

const formSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    type: z.nativeEnum(CredentialType),
    value: z.string().optional(),
});

export type CredentialFormValues = z.infer<typeof formSchema>;

interface Props {
    mode: "create" | "edit";
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: CredentialFormValues) => void;
    defaultValues?: Partial<CredentialFormValues>;
    isSubmitting?: boolean;
}

export const CredentialDialog = ({
    mode,
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {},
    isSubmitting,
}: Props) => {
    const form = useForm<CredentialFormValues>({
        resolver: zodResolver(
            mode === "create"
                ? formSchema.extend({
                    value: z.string().min(1, { message: "Value is required" }),
                })
                : formSchema
        ),
        defaultValues: {
            name: defaultValues.name || "",
            type: defaultValues.type || CredentialType.OPENAI,
            value: "",
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                name: defaultValues.name || "",
                type: defaultValues.type || CredentialType.OPENAI,
                value: "",
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleSubmit = (values: CredentialFormValues) => {
        onSubmit(values);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {mode === "create" ? "New credential" : "Edit credential"}
                    </DialogTitle>
                    <DialogDescription>
                        Credentials store an API key/secret so your AI nodes can
                        authenticate without hardcoding it in the workflow.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-6 mt-4"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="My OpenAI key" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Provider</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a provider" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {CREDENTIAL_TYPE_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="value"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>API key / secret</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            autoComplete="off"
                                            placeholder={
                                                mode === "edit"
                                                    ? "Leave blank to keep the current value"
                                                    : "sk-..."
                                            }
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Stored encrypted. {mode === "edit"
                                            ? "Leave this blank if you don't want to change it."
                                            : "This value is never shown again after saving."}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
