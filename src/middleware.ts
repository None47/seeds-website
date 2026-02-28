import { NextRequest, NextResponse } from "next/server";
import { JwtPayload, verifyToken } from "@/lib/auth";

// ─── Route groups ────────────────────────────────────────────────────────────
const ADMIN_ROUTES = ["/admin", "/api/admin"];
const BUYER_ROUTES = ["/dashboard", "/api/orders"];
const PRODUCT_ROUTES = ["/products", "/api/products"];
const AUTH_ROUTES = ["/login", "/register"];

// Middleware runs on Edge — no DB calls, JWT only.
export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get("auth_token")?.value;

    let user: JwtPayload | null = null;
    if (token) {
        user = verifyToken(token);
    }

    const isApi = pathname.startsWith("/api/");

    // ── 1. ADMIN ROUTES (/admin/*, /api/admin/*) ───────────────────────────
    if (ADMIN_ROUTES.some(r => pathname.startsWith(r))) {
        if (!user) {
            return isApi
                ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
                : NextResponse.redirect(new URL("/login?redirect=" + encodeURIComponent(pathname), req.url));
        }
        if (user.role !== "admin") {
            return isApi
                ? NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
                : NextResponse.redirect(new URL("/403", req.url));
        }
        return NextResponse.next();
    }

    // ── 2. BUYER DASHBOARD ROUTES (/dashboard/*, /api/orders/*) ───────────
    if (BUYER_ROUTES.some(r => pathname.startsWith(r))) {
        if (!user) {
            return isApi
                ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
                : NextResponse.redirect(new URL("/login?redirect=" + encodeURIComponent(pathname), req.url));
        }
        return NextResponse.next();
    }

    // ── 3. PRODUCT ROUTES — require approved KYC for authenticated buyers ──
    if (PRODUCT_ROUTES.some(r => pathname.startsWith(r))) {
        // Admins always have full access
        if (user?.role === "admin") return NextResponse.next();

        // Logged-in buyer → enforce KYC approval
        if (user) {
            if (user.kycStatus !== "approved") {
                return isApi
                    ? NextResponse.json({ error: "KYC approval required to access products" }, { status: 403 })
                    : NextResponse.redirect(new URL("/pending-approval", req.url));
            }
            return NextResponse.next();
        }

        // Not logged in → product catalogue is public (read-only browse), allow
        return NextResponse.next();
    }

    // ── 4. AUTH PAGES — redirect already-authenticated users to their home ─
    if (AUTH_ROUTES.some(r => pathname.startsWith(r)) && user) {
        const home = user.role === "admin" ? "/admin" : "/dashboard";
        return NextResponse.redirect(new URL(home, req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/api/admin/:path*",
        "/dashboard/:path*",
        "/api/orders/:path*",
        "/products/:path*",
        "/api/products/:path*",
        "/login",
        "/register",
    ],
};
