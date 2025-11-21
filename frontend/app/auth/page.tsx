"use client";

import { LoginForm } from "@/components/forms/login-form";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function AuthPage() {
    const searchParams = useSearchParams();
    const [type, setType] = useState(searchParams.get("type") || "login");

    return (

        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <Tabs defaultValue={type || "login"} className="w-[400px]">
                    <TabsList>
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="signup">Signup</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                        <LoginForm />
                    </TabsContent>
                    <TabsContent value="signup">
                        Singup
                        {/* <SignupForm /> */}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
