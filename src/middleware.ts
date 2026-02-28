import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// ─── Route groups ────────────────────────────────────────────────────────────
const ADMIN_ROUTES = ["/admin", "/api/admin"];
const BUYER_ROUTES = ["/dashboard", "/api/orders"];
const PRODUCT_ROUTES = ["/products", "/api/products"];
const AUTH_ROUTES = ["/login", "/register"];

// Encode secret once — jose requires Uint8Array
const getSecret = () =>
    new TextEncoder().encode(
        process.env.JWT_SECRET || "seedscompany_super_secret_jwt_key_2024"
    );

interface TokenPayload {
    userId: string;
    email: string;
    role: string;
    kycStatus: string;
}

async function decodeToken(token: string): Promise<TokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getSecret());
        return payload as unknown as TokenPayload;
    } catch {
        return null;
    }
}

// Middleware runs on Edge — jose is fully Edge-compatible
export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get("auth_token")?.value;

    const user = token ? await decodeToken(token) : null;
    const isApi = pathname.startsWith("/api/");

    // ── 1. ADMIN ROUTES ───────────────────────────────────────────────────
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

    // ── 2. BUYER DASHBOARD ROUTES ─────────────────────────────────────────
    if (BUYER_ROUTES.some(r => pathname.startsWith(r))) {
        if (!user) {
            return isApi
                ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
                : NextResponse.redirect(new URL("/login?redirect=" + encodeURIComponent(pathname), req.url));
        }
        return NextResponse.next();
    }

    // ── 3. PRODUCT ROUTES — KYC gate for authenticated buyers ─────────────
    if (PRODUCT_ROUTES.some(r => pathname.startsWith(r))) {
        if (user?.role === "admin") return NextResponse.next();
        if (user) {
            if (user.kycStatus !== "approved") {
                return isApi
                    ? NextResponse.json({ error: "KYC approval required to access products" }, { status: 403 })
                    : NextResponse.redirect(new URL("/pending-approval", req.url));
            }
            return NextResponse.next();
        }
        return NextResponse.next();
    }

    // ── 4. AUTH PAGES — redirect already-authenticated users ─────────────
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
