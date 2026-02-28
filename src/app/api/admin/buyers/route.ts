import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { sanitize, isValidGST, isValidPAN } from "@/lib/validate";

export async function GET(req: NextRequest) {
    const user = await getSessionUser();
    if (!user || user.role !== "admin")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const status = new URL(req.url).searchParams.get("status");
    const buyers = await prisma.user.findMany({
        where: { role: "buyer", ...(status ? { kycStatus: status } : {}) },
        orderBy: { createdAt: "desc" },
        select: {
            id: true, email: true, companyName: true, gstNumber: true, panNumber: true,
            state: true, district: true, pincode: true, address: true, phone: true,
            kycStatus: true, kycRejectionReason: true, kycApprovedAt: true,
            creditLimit: true, usedCredit: true, creditEnabled: true,
            createdAt: true,
        },
    });
    return NextResponse.json(buyers);
}

export async function PATCH(req: NextRequest) {
    const user = await getSessionUser();
    if (!user || user.role !== "admin")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { buyerId, kycStatus, kycRejectionReason } = await req.json();

    if (!["approved", "rejected", "pending"].includes(kycStatus))
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });

    const buyer = await prisma.user.findUnique({ where: { id: buyerId } });
    if (!buyer) return NextResponse.json({ error: "Buyer not found" }, { status: 404 });

    const updated = await prisma.user.update({
        where: { id: buyerId },
        data: {
            kycStatus,
            ...(kycStatus === "approved" && { kycApprovedAt: new Date() }),
            ...(kycStatus === "rejected" && kycRejectionReason && {
                kycRejectionReason: sanitize(kycRejectionReason)
            }),
        },
    });

    // Send email notifications
    try {
        const { sendKycApprovalEmail, sendKycRejectionEmail } = await import("@/lib/mailer");
        if (kycStatus === "approved")
            await sendKycApprovalEmail(buyer.email, buyer.companyName || buyer.email);
        else if (kycStatus === "rejected")
            await sendKycRejectionEmail(buyer.email, buyer.companyName || buyer.email, kycRejectionReason);
    } catch (e) {
        console.error("Email send failed:", e);
    }

    return NextResponse.json({ user: updated });
}
