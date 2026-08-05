import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/shared/navbar";
import GlobalSpaceFooter from "@/components/shared/footer";
import "katex/dist/katex.min.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Suspense } from "react";
import LayoutLoaderHandler from "@/components/shared/layout-loader-handler";

export const metadata: Metadata = {
    title: "Zukko Halikov",
    description: "Bilim cho'qqilarini birgalikda zabt etamiz!",
    icons: {
        icon: "/logo.png",
    },
    verification: {
        google: "OuRjXr0lK6lZxY7k-Z7QzgPqJxuFh6J58h81AhO4MXs",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html
                lang="en"
                className={`font-sans h-full antialiased`}
            >
                <body className="min-h-full flex flex-col">
                    <Suspense fallback={null}>
                        <LayoutLoaderHandler />
                    </Suspense>
                    <Navbar />
                    {children}
                    <GlobalSpaceFooter />
                </body>
            </html>
        </ClerkProvider>
    );
}
