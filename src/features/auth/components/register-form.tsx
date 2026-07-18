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
//import {authClient} from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { authClient } from "@/lib/auth-client"
 
const registerSchema = z
    .object({
        email: z
            .string()
            .min(1, "Email is required")
            .email("Enter a valid email"),
        password: z
            .string()
            .min(1, "Password is required")
            .min(6, "Password must be at least 6 characters"),
        confirmPassword: z
            .string()
            .min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    })
 
type RegisterFormValues = z.infer<typeof registerSchema>
 
export function RegisterForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
 
    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    })
 
    async function onSubmit(values: RegisterFormValues) {
        setIsLoading(true)
        
        try {
            await authClient.signUp.email({
                name:values.email,
                email:values.email,
                password:values.password,
                callbackURL:"/",
            },
        {
            onSuccess:()=>{
                router.push("/");
            },
            onError: (ctx)=>{
                toast.error(ctx.error.message)
            }
        })
            // const { error } = await authClient.signUp.email({
            //     email: values.email,
            //     password: values.password,
            // })
            //
            // if (error) {
            //     toast.error(error.message ?? "Couldn't create account")
            //     return
            // }
 
            toast.success("Account created successfully")
            
        } catch (error) {
            toast.error("Something went wrong. Try again.")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }
 
    const [socialLoading, setSocialLoading] = useState<"github" | "google" | null>(null)

async function handleSocialRegister(provider: "github" | "google") {
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
                            src="/logo.svg"
                            alt="Logo"
                            width={40}
                            height={40}
                            priority
                        />
                    </div>
                    <CardTitle className="text-xl">Get Started</CardTitle>
                    <CardDescription>
                        Create your account to get started
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-3">
                        <Button
    type="button"
    variant="outline"
    className="w-full"
    disabled={socialLoading !== null}
    onClick={() => handleSocialRegister("github")}
>
    {/* ...svg... */}
    {socialLoading === "github" ? "Conectando..." : "Continue with GitHub"}
</Button>
<Button
    type="button"
    variant="outline"
    className="w-full"
    disabled={socialLoading !== null}
    onClick={() => handleSocialRegister("google")}
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
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                autoComplete="new-password"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
 
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                autoComplete="new-password"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
 
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Signing up..." : "Sign up"}
                            </Button>
                        </form>
                    </Form>
 
                    <div className="mt-4 text-center text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="underline underline-offset-4">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
            </div>
        </div>
    )
}