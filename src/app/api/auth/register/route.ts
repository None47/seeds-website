import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const {
            email, password,
            companyName, gstNumber, panNumber,
            state, district, pincode, address,
            gstCertificate,
        } = await req.json();

        // Check existing user
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 400 });

        const hashedPassword = await bcrypt.hash(password, 12);

        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: "buyer",
                companyName,
                gstNumber,
                panNumber,
                state,
                district,
                pincode,
                address,
                gstCertificate,
                kycStatus: "pending",
            },
        });

        return NextResponse.json({ message: "Registration successful. Awaiting KYC approval." }, { status: 201 });
    } catch (error) {
        console.error("Register error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
