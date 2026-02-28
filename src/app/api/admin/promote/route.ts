import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/admin/promote
 *
 * Safely promotes any user to admin role.
 * Protected by ADMIN_SETUP_SECRET environment variable.
 *
 * Usage (one-time, from terminal):
 *   curl -X POST http://localhost:3000/api/admin/promote \
 *     -H "Content-Type: application/json" \
 *     -d '{"email":"your@email.com","secret":"your-ADMIN_SETUP_SECRET"}'
 *
 * Set ADMIN_SETUP_SECRET in .env — keep it strong and private.
 * This route is intentionally stateless and does NOT require an existing
 * admin session, so you can create the first admin without bootstrapping.
 */
export async function POST(req: NextRequest) {
    try {
        const { email, secret } = await req.json();

        // Validate setup secret
        const setupSecret = process.env.ADMIN_SETUP_SECRET;
        if (!setupSecret) {
            return NextResponse.json(
                { error: "ADMIN_SETUP_SECRET is not configured on the server." },
                { status: 503 }
            );
        }
        if (secret !== setupSecret) {
            return NextResponse.json({ error: "Invalid secret." }, { status: 403 });
        }

        // Find user
        if (!email || typeof email !== "string") {
            return NextResponse.json({ error: "email is required." }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ error: `No user found with email: ${email}` }, { status: 404 });
        }

        if (user.role === "admin") {
            return NextResponse.json({ message: `${email} is already an admin.` });
        }

        // Promote
        await prisma.user.update({
            where: { email },
            data: { role: "admin" },
        });

        return NextResponse.json({
            message: `✅ ${email} has been promoted to admin. Re-login to get a new JWT.`,
        });
    } catch (error) {
        console.error("Promote error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
