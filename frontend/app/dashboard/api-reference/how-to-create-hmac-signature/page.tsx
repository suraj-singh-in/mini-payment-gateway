// app/docs/hmac-signature/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function HmacSignaturePage() {
    const [apiSecret, setApiSecret] = useState(
        ""
    );
    const [bodyText, setBodyText] = useState(
        JSON.stringify(
            {
                amount: 1000,
                currency: "INR",
                customer_email: "test@example.com",
                metadata: { orderId: "ORD-123" },
            },
            null,
            2
        )
    );
    const [timestamp, setTimestamp] = useState<string>("");
    const [signature, setSignature] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    async function generateSignature() {
        try {
            setError(null);
            setSignature("");
            setTimestamp("");

            const parsedBody = JSON.parse(bodyText);
            const ts = Date.now().toString();
            const signingString = `${ts}.${JSON.stringify(parsedBody)}`;

            const enc = new TextEncoder();
            const key = await crypto.subtle.importKey(
                "raw",
                enc.encode(apiSecret),
                { name: "HMAC", hash: "SHA-256" },
                false,
                ["sign"]
            );

            const sigBuffer = await crypto.subtle.sign(
                "HMAC",
                key,
                enc.encode(signingString)
            );

            const hex = Array.from(new Uint8Array(sigBuffer))
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("");

            setTimestamp(ts);
            setSignature(hex);
        } catch (e: any) {
            setError(e?.message || "Failed to generate signature. Check your JSON.");
        }
    }

    return (
        <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10">
            {/* Intro / Theory */}
            <section className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight">
                    How to Create HMAC Signature
                </h1>
                <p className="text-sm text-muted-foreground">
                    This page explains what an HMAC signature is, why we use it in the
                    Mini Payment Gateway, and shows you how to generate the exact
                    signature our API expects.
                </p>
            </section>

            {/* What / Why / How */}
            <section className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>What is HMAC?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <p>
                            <strong>HMAC (Hash-based Message Authentication Code)</strong> is
                            a way to prove that:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>The request came from someone who knows the secret key.</li>
                            <li>The request body was not changed in transit.</li>
                        </ul>
                        <p>
                            It combines your <strong>API secret</strong> and the{" "}
                            <strong>request data</strong> using a hash algorithm (here,
                            <code className="mx-1 rounded bg-muted px-1 py-0.5">
                                SHA-256
                            </code>
                            ).
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>How do we build the signature?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <p>
                            For every signed request, we build a{" "}
                            <strong>signing string</strong> like this:
                        </p>
                        <pre className="rounded bg-muted p-3 text-xs">
                            {`const timestamp = Date.now().toString();
const body = {
  amount: 1000,
  currency: "INR",
  customer_email: "test@example.com",
  metadata: { orderId: "ORD-123" },
};

const signingString = \`\${timestamp}.\${JSON.stringify(body)}\`;`}
                        </pre>
                        <p>Then we compute the HMAC:</p>
                        <pre className="rounded bg-muted p-3 text-xs">
                            {`const crypto = require("crypto");

const signature = crypto
  .createHmac("sha256", apiSecret)
  .update(signingString)
  .digest("hex");`}
                        </pre>
                        <p>
                            The client sends the result in headers, for example:
                        </p>
                        <pre className="rounded bg-muted p-3 text-xs">
                            {`X-API-Key:     mpg_...
X-Timestamp:   1763734141129
X-Signature:   &lt;calculated-hex-signature&gt;`}
                        </pre>
                    </CardContent>
                </Card>
            </section>

            {/* Interactive generator */}
            <section className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Try it: Generate HMAC Signature</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="space-y-2">
                            <label className="text-xs font-medium">API Secret</label>
                            <Input
                                value={apiSecret}
                                onChange={(e) => setApiSecret(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium">Request Body (JSON)</label>
                            <Textarea
                                rows={8}
                                value={bodyText}
                                onChange={(e) => setBodyText(e.target.value)}
                            />
                        </div>

                        <Button type="button" onClick={generateSignature}>
                            Generate Signature
                        </Button>

                        {error && (
                            <p className="text-xs text-red-500 whitespace-pre-wrap">
                                ⚠ {error}
                            </p>
                        )}

                        {(timestamp || signature) && (
                            <div className="space-y-2 rounded border bg-muted p-3 text-xs">
                                <div>
                                    <span className="font-semibold">Timestamp:</span>{" "}
                                    <code>{timestamp}</code>
                                </div>
                                <div className="break-all">
                                    <span className="font-semibold">Signing String:</span>{" "}
                                    <code>
                                        {timestamp &&
                                            `${timestamp}.${JSON.stringify(
                                                JSON.parse(bodyText)
                                            )}`}
                                    </code>
                                </div>
                                <div className="break-all">
                                    <span className="font-semibold">Signature (hex):</span>{" "}
                                    <code>{signature}</code>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>

            {/* Node example section */}
            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Node.js example (`hmac_sign.js`)</h2>
                <p className="text-sm text-muted-foreground">
                    You can also generate the same signature on your backend using Node
                    and the built-in <code>crypto</code> module:
                </p>
                <pre className="rounded bg-muted p-3 text-xs">
                    {`// hmac_sign.js
const crypto = require("crypto");
const apiSecret = "your_api_secrets";
const timestamp = Date.now().toString();
const body = {
  amount: 1000,
  currency: "INR",
  customer_email: "test@example.com",
  metadata: { orderId: "ORD-123" }
};

const signingString = \`\${timestamp}.\${JSON.stringify(body)}\`;
const signature = crypto
  .createHmac("sha256", apiSecret)
  .update(signingString)
  .digest("hex");

console.log({ timestamp, signature });`}
                </pre>
            </section>
        </div>
    );
}
