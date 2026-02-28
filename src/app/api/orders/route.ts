import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { sanitize } from "@/lib/validate";
import { v4 as uuidv4 } from "uuid";
import { sendOrderApprovalEmail, sendInvoiceEmail } from "@/lib/mailer";

// ─── GET: List orders ─────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const where = user.role === "admin" ? {} : { buyerId: user.userId };
    const orders = await prisma.order.findMany({
        where,
        include: {
            buyer: { select: { companyName: true, email: true, state: true, gstNumber: true } },
            items: { include: { product: { select: { varietyName: true, cropName: true } } } },
            invoice: { select: { id: true, invoiceNumber: true, emailSent: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
}

// ─── POST: Create order — all prices fetched server-side ─────────────────────
export async function POST(req: NextRequest) {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const buyer = await prisma.user.findUnique({ where: { id: user.userId } });
    if (!buyer) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (buyer.kycStatus !== "approved")
        return NextResponse.json({ error: "KYC not approved. Contact admin." }, { status: 403 });

    const body = await req.json();
    const items: { productId: string; quantity: number }[] = body.items || [];
    const notes = sanitize(body.notes || "");

    if (!items.length) return NextResponse.json({ error: "No items in order" }, { status: 400 });

    let totalAmount = 0;
    let gstAmount = 0;
    const orderItems = [];

    for (const item of items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId, isActive: true } });
        if (!product) return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 404 });

        if (item.quantity < product.moq)
            return NextResponse.json({ error: `MOQ for ${product.varietyName} is ${product.moq} kg` }, { status: 400 });

        if (item.quantity > product.stockQuantity)
            return NextResponse.json({ error: `Insufficient stock for ${product.varietyName}. Available: ${product.stockQuantity} kg` }, { status: 400 });

        // ✅ Server-side price lookup — NEVER trust client-submitted prices
        let serverPrice = 0;
        try {
            const tiers: { minQty: number; maxQty?: number; pricePerUnit: number }[] = JSON.parse(product.tierPricing);
            // Find best applicable tier
            const applicable = [...tiers]
                .filter(t => item.quantity >= t.minQty)
                .sort((a, b) => b.minQty - a.minQty);
            serverPrice = applicable[0]?.pricePerUnit ?? tiers[0]?.pricePerUnit ?? 0;
        } catch {
            return NextResponse.json({ error: `Invalid pricing configuration for ${product.varietyName}` }, { status: 500 });
        }

        if (serverPrice <= 0)
            return NextResponse.json({ error: `No valid price for ${product.varietyName}` }, { status: 400 });

        const subtotal = serverPrice * item.quantity;
        const itemGst = subtotal * product.gstRate / 100;
        totalAmount += subtotal;
        gstAmount += itemGst;

        orderItems.push({
            productId: product.id,
            quantity: item.quantity,
            pricePerUnit: serverPrice,   // locked server-side
            gstRate: product.gstRate,
            hsnCode: product.hsnCode,
            subtotal,
        });
    }

    const grandTotal = totalAmount + gstAmount;

    // ─ Credit limit enforcement ───────────────────────────────────────────────
    if (buyer.creditEnabled) {
        const available = buyer.creditLimit - buyer.usedCredit;
        if (grandTotal > available)
            return NextResponse.json({
                error: `Order total (₹${grandTotal.toFixed(2)}) exceeds available credit (₹${available.toFixed(2)}). Contact admin.`,
            }, { status: 400 });
    }

    const orderNumber = `SC-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}`;

    const order = await prisma.order.create({
        data: {
            orderNumber,
            buyerId: user.userId,
            status: "pending",
            totalAmount,
            gstAmount,
            grandTotal,
            buyerState: buyer.state || "",
            notes,
            items: { create: orderItems },
        },
        include: { items: { include: { product: true } } },
    });

    return NextResponse.json({ order }, { status: 201 });
}
