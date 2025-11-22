"use client";

import BasicAnalytics from "@/components/analytics/BasicAnalytics";
import { CreateMerchantForm } from "@/components/forms/create-merchant-form";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { useDashboard } from "@/contexts/dashboard-context";
// import { CreateMerchantForm } from "@/components/dashboard/create-merchant-form";
// import { BasicAnalytics } from "@/components/dashboard/basic-analytics";

export default function Page() {
    const { merchant, loadingMerchant } = useDashboard();

    return (
        <div className="min-w-full">
            <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </header>

            <div className="flex flex-1 flex-col gap-4 p-4">
                {loadingMerchant ? (
                    <p className="text-sm text-muted-foreground">Loading merchant...</p>
                ) : merchant ? (
                    <BasicAnalytics merchant={merchant} />
                ) : (
                    <CreateMerchantForm />
                )}
            </div>
        </div>
    );
}
