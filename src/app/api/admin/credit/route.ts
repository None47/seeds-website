import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { sanitizeNumber } from "@/lib/validate";

// GET /api/admin/credit?buyerId=... — get credit info for a buyer
export async function GET(req: NextRequest) {
    const user = await getSessionUser();
    if (!user || user.role !== "admin")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const buyerId = new URL(req.url).searchParams.get("buyerId");
    if (!buyerId) return NextResponse.json({ error: "buyerId required" }, { status: 400 });

    const buyer = await prisma.user.findUnique({
        where: { id: buyerId },
        select: { id: true, companyName: true, creditLimit: true, usedCredit: true, outstandingBalance: true, creditEnabled: true },
    });
    if (!buyer) return NextResponse.json({ error: "Buyer not found" }, { status: 404 });

    const transactions = await prisma.creditTransaction.findMany({
        where: { buyerId },
        orderBy: { createdAt: "desc" },
        take: 20,
    });

    return NextResponse.json({ buyer, transactions });
}

// PATCH /api/admin/credit — update credit limit
export async function PATCH(req: NextRequest) {
    const user = await getSessionUser();
    if (!user || user.role !== "admin")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { buyerId, creditLimit, creditEnabled } = await req.json();

    const buyer = await prisma.user.findUnique({ where: { id: buyerId } });
    if (!buyer) return NextResponse.json({ error: "Buyer not found" }, { status: 404 });

    const updatedLimit = sanitizeNumber(creditLimit, buyer.creditLimit);

    const updated = await prisma.user.update({
        where: { id: buyerId },
        data: {
            creditLimit: updatedLimit,
            creditEnabled: creditEnabled !== undefined ? Boolean(creditEnabled) : buyer.creditEnabled,
        },
    });

    await prisma.creditTransaction.create({
        data: {
            buyerId,
            type: "limit_update",
            amount: updatedLimit,
            description: `Credit limit updated by admin to ₹${updatedLimit.toLocaleString("en-IN")}`,
        },
    });

    return NextResponse.json({ user: updated });
}

// POST /api/admin/credit — record a manual credit/payment received
export async function POST(req: NextRequest) {
    const user = await getSessionUser();
    if (!user || user.role !== "admin")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { buyerId, amount, type, description } = await req.json();
    if (!["credit", "debit"].includes(type))
        return NextResponse.json({ error: "type must be 'credit' or 'debit'" }, { status: 400 });

    const amt = sanitizeNumber(amount);
    if (amt <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

    const buyer = await prisma.user.findUnique({ where: { id: buyerId } });
    if (!buyer) return NextResponse.json({ error: "Buyer not found" }, { status: 404 });

    if (type === "credit") {
        // Payment received — reduce usedCredit
        await prisma.user.update({
            where: { id: buyerId },
            data: { usedCredit: { decrement: amt } },
        });
    }

    const transaction = await prisma.creditTransaction.create({
        data: {
            buyerId,
            type,
            amount: amt,
            description: description || `Manual ${type} by admin`,
        },
    });

    return NextResponse.json({ transaction });
}
