"use client"
 
import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
 
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
 
import { Input } from "@/components/ui/input"

import { cn } from "@/lib/utils"
import { useState } from "react"
import { authClient } from "@/lib/auth-client"
 
const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Enter a valid email"),
    password: z
        .string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters"),
})
 
type LoginFormValues = z.infer<typeof loginSchema>
 
export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
 
    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })
 
    async function onSubmit(values: LoginFormValues) {
        setIsLoading(true)
        try {
            await authClient.signIn.email({
                email:values.email,
                password:values.password,
                callbackURL:"/"
            },{
                onSuccess:()=>{
                    router.push("/");
                },
                onError:(ctx)=>{
                    toast.error(ctx.error.message)
                }
            })
            
 
            toast.success("Signed in successfully")
            router.push("/")
        } catch (error) {
            toast.error("Something went wrong. Try again.")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }
 
    async function handleSocialLogin(provider: "github" | "google") {
        try {
            
        } catch (error) {
            toast.error("Something went wrong. Try again.")
            console.error(error)
        }
    }
 
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-4 sm:p-6 md:p-10">
            <div className={cn("w-full max-w-sm flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <div className="mb-2 flex justify-center">
                        <Image
                            src="/logo.svg"
                            alt="Logo"
                            width={40}
                            height={40}
                            priority
                        />
                    </div>
                    <CardTitle className="text-xl">Welcome back</CardTitle>
                    <CardDescription>
                        Login to continue
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => handleSocialLogin("github")}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                className="size-4"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path d="M12 .5C5.73.5.98 5.24.98 11.52c0 4.94 3.2 9.13 7.65 10.6.56.1.76-.24.76-.54 0-.27-.01-1.16-.02-2.1-3.11.68-3.77-1.32-3.77-1.32-.51-1.3-1.24-1.65-1.24-1.65-1.02-.7.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 1.71 2.62 1.22 3.26.93.1-.72.39-1.22.71-1.5-2.48-.28-5.1-1.24-5.1-5.53 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .93-.3 3.05 1.14a10.6 10.6 0 0 1 5.56 0c2.12-1.44 3.05-1.14 3.05-1.14.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.3-2.63 5.24-5.13 5.52.4.35.76 1.03.76 2.08 0 1.5-.01 2.71-.01 3.08 0 .3.2.65.77.54A11.03 11.03 0 0 0 23.02 11.5C23.02 5.24 18.27.5 12 .5Z" />
                            </svg>
                            Continue with GitHub
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => handleSocialLogin("google")}
                        >
                            <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                                <path
                                    fill="#4285F4"
                                    d="M23.52 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3.02c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.26v3.11A12 12 0 0 0 12 24Z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56V6.61H1.26a12 12 0 0 0 0 10.78l4.01-3.11Z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.26 6.61l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
                                />
                            </svg>
                            Continue with Google
                        </Button>
                    </div>
 
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                                Or continue with email
                            </span>
                        </div>
                    </div>
 
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="flex flex-col gap-6"
                        >
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="you@example.com"
                                                autoComplete="email"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
 
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel>Password</FormLabel>
                                            <Link
                                                href="/forgot-password"
                                                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                                            >
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                autoComplete="current-password"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
 
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Signing in..." : "Sign in"}
                            </Button>
                        </form>
                    </Form>
 
                    <div className="mt-4 text-center text-sm">
                        Dosent have an account?{" "}
                        <Link href="/register" className="underline underline-offset-4">
                            Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
            </div>
        </div>
    )
}