import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

        // Include kycStatus in the JWT so middleware can enforce KYC gating at the edge
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            kycStatus: user.kycStatus,
        });

        const res = NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                companyName: user.companyName,
                kycStatus: user.kycStatus,
            },
        });

        res.cookies.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        return res;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
