"use client"

import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog"
import z from "zod";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"
import { useEffect } from "react";


const formSchema = z.object({
    endpoint: z.url({ message: "Pelase enter a valid URL" }),
    method: z.enum(["GET", "POST", "PUT", "DELETE"]),
    body: z
    .string()
    .optional()
   // .refine()
})

export type HttpRequestFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    defaultValues?:Partial<HttpRequestFormValues>
}

export const HttpRequestDialog = ({ open, onOpenChange, onSubmit, defaultValues={} }: Props) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            endpoint:defaultValues.endpoint||"" ,
            method: defaultValues.method||"GET",
            body: defaultValues.body||"",
        }
    })

    useEffect(()=>{
        if (open){
            form.reset({
                endpoint:defaultValues.endpoint||"" ,
                method: defaultValues.method||"GET",
                body: defaultValues.body||"",
            })
        }
    } , [open,defaultValues,form])

    const watchMethod = form.watch("method");
    const showBodyField = ["POST", "PUT", "PATCH"].includes(watchMethod)

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values)
        onOpenChange(false)
    }

    // Reseta o form com os valores atuais sempre que o dialog for reaberto
    useEffect(() => {
        if (open) {
            form.reset({
                endpoint:defaultValues.endpoint||"" ,
                method: defaultValues.method||"GET",
                body: defaultValues.body||"",
            })
        }
    }, [open, defaultValues, form])

    return (
        <Dialog open={open} onOpenChange={onOpenChange} >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>HTTP  Request</DialogTitle>
                    <DialogDescription>Configure settings for the http request</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 mt-4">
                        <FormField control={form.control} name="method" render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Method
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a method" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="GET">GET</SelectItem>
                                        <SelectItem value="POST">POST</SelectItem>
                                        <SelectItem value="PUT">PUT</SelectItem>
                                        <SelectItem value="DELETE">DELETE</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                The HTTP method
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="endpoint" render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Endpoint
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="https://api.example.com/resource" {...field} />
                                </FormControl>
                                <FormDescription>
                                    A URL completa que receberá a requisição
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />

                        {showBodyField && (
                            <FormField control={form.control} name="body" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Body
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder='{ "key": "value" }'
                                            className="min-h-32 font-mono text-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Payload JSON enviado no corpo da requisição
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}