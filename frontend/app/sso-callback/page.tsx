"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-black text-white">
            <AuthenticateWithRedirectCallback
                signInForceRedirectUrl="/dashboard"
                signUpForceRedirectUrl="/dashboard"
            />
        </div>
    );
}
