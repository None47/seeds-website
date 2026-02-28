import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "SeedsCo India – Premium Hybrid Seeds for Indian Agriculture",
    description: "B2B seed distribution platform for verified distributors and retailers across India. Order premium hybrid seeds with GST-compliant invoicing.",
    keywords: "hybrid seeds India, B2B seeds distributor, agricultural seeds, wheat seeds, rice seeds, vegetable seeds",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
