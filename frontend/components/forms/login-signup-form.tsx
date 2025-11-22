import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface IPropLoginSignupForm {
    className?: string;
    isSignUp?: boolean;
    onSubmit?: (data: { email: string, password: string, mode: "login" | "signup" }) => void;
}

export function LoginSignupForm({
    className,
    isSignUp,
    onSubmit,
}: IPropLoginSignupForm) {

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!onSubmit) return;

        const formData = new FormData(e.currentTarget);
        const email = (formData.get("email") as string) || "";
        const password = (formData.get("password") as string) || "";
        const mode: "login" | "signup" = isSignUp ? "signup" : "login";

        onSubmit({ email, password, mode });
    };

    return (
        <div className={cn("flex flex-col gap-6", className)}>
            <Card>
                <CardHeader>
                    <CardTitle>
                        {isSignUp ? "Sign up to your account" : "Login to your account"}
                    </CardTitle>
                    <CardDescription>
                        Enter your email below to{" "}
                        {isSignUp ? "sign up to your account" : "login to your account"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                />
                            </Field>
                            <Field>
                                <Button type="submit">
                                    {isSignUp ? "Sign up" : "Login"}
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
