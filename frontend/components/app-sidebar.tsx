import * as React from "react"
import { LogOut } from "lucide-react"
import { ChevronRight } from "lucide-react"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { logoutServerFunction } from "@/server-functions/authService"
import { useRouter } from "next/navigation"

// This is sample data.
const data = {
    navMain: [
        {
            title: "Merchant",
            url: "/",
            items: [
                {
                    title: "Analytics",
                    url: "/dashboard",
                },
                // {
                //     title: "Update Details",
                //     url: "/dashboard/merchant/update",
                // },
            ],
        },
        {
            title: "Transactions",
            url: "/dashboard/transactions",
            items: [
                {
                    title: "Transactions View",
                    url: "/dashboard/transactions/view",
                },
            ],
        },
        {
            title: "API Reference",
            url: "/dashboard/api-reference",
            items: [
                {
                    title: "API Credentials",
                    url: "/dashboard/api-reference/api-credentials",
                },
                {
                    title: "How To Create HMAC Signature",
                    url: "/dashboard/api-reference/how-to-create-hmac-signature",
                },
            ],
        },
        {
            title: "Checkout",
            url: "/dashboard/checkout",
            items: [
                {
                    title: "Demo Checkout",
                    url: "/checkout",
                },
            ],
        },
        // {
        //     title: "Architecture",
        //     url: "#",
        //     items: [
        //         {
        //             title: "Accessibility",
        //             url: "#",
        //         },
        //     ],
        // },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const router = useRouter();

    return (
        <Sidebar {...props} >
            <SidebarHeader>
            </SidebarHeader>
            <SidebarContent className="gap-0">
                {/* We create a collapsible SidebarGroup for each parent. */}
                {data.navMain.map((item) => (
                    <Collapsible
                        key={item.title}
                        title={item.title}
                        defaultOpen
                        className="group/collapsible"
                    >
                        <SidebarGroup>
                            <SidebarGroupLabel
                                asChild
                                className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
                            >
                                <CollapsibleTrigger>
                                    {item.title}{" "}
                                    <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                </CollapsibleTrigger>
                            </SidebarGroupLabel>
                            <CollapsibleContent>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        {item.items.map((item) => (
                                            <SidebarMenuItem key={item.title}>
                                                <SidebarMenuButton asChild isActive={item.isActive}>
                                                    <a href={item.url}>{item.title}</a>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </CollapsibleContent>
                        </SidebarGroup>
                    </Collapsible>
                ))}

            </SidebarContent>
            <SidebarRail />

            {/* 🚀 LOGOUT — Permanently at bottom */}
            <div className="p-4 border-t">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            className="text-red-600 hover:bg-red-600 hover:text-white"
                            onClick={async () => {
                                await logoutServerFunction();
                                router.push("/auth?type=login");
                            }}
                        >
                            <LogOut className="mr-2 h-4 w-4" /> Logout
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </div>

            <SidebarRail />

        </Sidebar>
    )
}
