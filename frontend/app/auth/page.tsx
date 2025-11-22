"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { LoginSignupForm } from "@/components/forms/login-signup-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    loginServerFunction,
} from "@/server-functions/authService";

export default function AuthPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const initialType =
        (searchParams.get("type") as "login" | "signup") || "login";
    const [type, setType] = useState<"login" | "signup">(initialType);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const onSubmit = async (
        data: {
            email: string,
            password: string,
            mode: "login" | "signup"
        }
    ) => {
        const { email, password, mode } = data
        setError(null);
        setLoading(true);

        try {
            if (mode === "login") {
                const response = await loginServerFunction(email, password);
                console.log("login response", response);

                if (!response.success) {
                    setError(response?.message || "Login failed");
                    return;
                }

                // cookies are already set in server function
                router.push("/dashboard");
            } else {
                // const response = await registerServerFunction(email, password);
                // console.log("register response", response);

                // if (!response.success) {
                //     setError(response?.message || "Signup failed");
                //     return;
                // }

                // // auto-login after signup → tokens set → go to dashboard
                // router.push("/dashboard");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-md">
                <Tabs
                    value={type}
                    onValueChange={(val) => setType(val as "login" | "signup")}
                >
                    <TabsList className="grid grid-cols-2 w-full mb-4">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="signup">Sign up</TabsTrigger>
                    </TabsList>

                    {error && (
                        <p className="mb-4 text-sm text-red-500 text-center">{error}</p>
                    )}

                    <TabsContent value="login">
                        <LoginSignupForm
                            isSignUp={false}
                            onSubmit={onSubmit}
                            className={loading ? "opacity-70 pointer-events-none" : ""}
                        />
                    </TabsContent>

                    <TabsContent value="signup">
                        <LoginSignupForm
                            isSignUp
                            onSubmit={onSubmit}
                            className={loading ? "opacity-70 pointer-events-none" : ""}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
