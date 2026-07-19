"use client"
 
import {
    CreditCardIcon,
    FolderOpenIcon,
    HistoryIcon,
    KeyIcon,
    LogOutIcon,
    StarIcon,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"
import { useHasActiveSubscription } from "@/features/subscriptions/hooks/use-subscription"
 
const navItems = [
    {
        title: "Workflows",
        url: "/workflows",
        icon: FolderOpenIcon,
    },
    {
        title: "Executions",
        url: "/executions",
        icon: HistoryIcon,
    },
    {
        title: "Credentials",
        url: "/credentials",
        icon: KeyIcon,
    },
    {
        title: "Templates",
        url: "/templates",
        icon: StarIcon,
    },
]
 
export function AppSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const {hasActivateSubscription , isLoading} = useHasActiveSubscription();
 
    async function handleLogout() {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/login")
                },
                onError: () => {
                    toast.error("Não foi possível sair. Tente novamente.")
                },
            },
        })
    }
 
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <Image
                                    src="/logo.svg"
                                    alt="Logo"
                                    width={24}
                                    height={24}
                                    priority
                                />
                                <span className="text-base font-semibold">
                                    n8nCopy
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
 
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => {
                                const isActive =
                                    pathname === item.url ||
                                    pathname.startsWith(`${item.url}/`)
 
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.title}
                                        >
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
 
            <SidebarFooter>
                <SidebarMenu>
                    {!hasActivateSubscription && !isLoading && (
                         <SidebarMenuItem>
    <SidebarMenuButton
        tooltip="Upgrade to Pro"
        onClick={() => {
            authClient.checkout({ slug: "pro" })
        }}
    >
        <StarIcon />
        <span>Upgrade to Pro</span>
    </SidebarMenuButton>
</SidebarMenuItem>
                    )}
                   
                    <SidebarMenuItem>
                        <SidebarMenuButton  tooltip="Billing"   onClick={()=>authClient.customer.portal()}>
                            
                                <CreditCardIcon />
                                <span>Billing</span>
                            
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="Sair"
                            onClick={handleLogout}
                        >
                            <LogOutIcon />
                            <span>Sair</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
 