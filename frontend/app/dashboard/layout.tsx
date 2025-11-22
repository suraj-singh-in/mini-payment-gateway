"use client";

import { ReactNode } from "react";
import { useTokenAutoRefresh } from "@/hooks/use-token-auto-refresh.ts";
import { DashboardProvider } from "@/contexts/dashboard-context";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function DashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    useTokenAutoRefresh();

    return (
        <DashboardProvider>
            <SidebarProvider>
                <AppSidebar />
                <main className="w-full">
                    {children}
                </main>
            </SidebarProvider>
        </DashboardProvider>
    )
}
