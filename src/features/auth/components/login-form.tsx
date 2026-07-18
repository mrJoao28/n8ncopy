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
 
 const [socialLoading, setSocialLoading] = useState<"github" | "google" | null>(null)

async function handleSocialLogin(provider: "github" | "google") {
    setSocialLoading(provider)
    try {
        await authClient.signIn.social({
            provider,
            callbackURL: "/",
        }, {
            onSuccess: () => {
                router.push("/")
            },
            onError: (ctx) => {
                toast.error(ctx.error.message ?? "Não foi possível continuar com " + provider)
            },
        })
    } catch (error) {
        toast.error("Algo deu errado. Tente novamente.")
        console.error(error)
    } finally {
        setSocialLoading(null)
    }
}
 
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-4 sm:p-6 md:p-10">
            <div className={cn("w-full max-w-sm flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <div className="mb-2 flex justify-center">
                        <Image
                            src=""
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
    disabled={socialLoading !== null}
    onClick={() => handleSocialLogin("github")}
>
    {/* ...svg... */}
    {socialLoading === "github" ? "Conectando..." : "Continue with GitHub"}
</Button>
<Button
    type="button"
    variant="outline"
    className="w-full"
    disabled={socialLoading !== null}
    onClick={() => handleSocialLogin("google")}
>
    {/* ...svg... */}
    {socialLoading === "google" ? "Conectando..." : "Continue with Google"}
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