import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { sanitize } from "@/lib/validate";
import { v4 as uuidv4 } from "uuid";
import { sendOrderApprovalEmail, sendInvoiceEmail } from "@/lib/mailer";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getSessionUser();
    if (!user || user.role !== "admin")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { status, trackingId, shippingCarrier, shippingDetails } = body;

    const VALID_STATUSES = ["pending", "approved", "packed", "shipped", "delivered", "cancelled"];
    if (!VALID_STATUSES.includes(status))
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });

    const existingOrder = await prisma.order.findUnique({
        where: { id },
        include: { buyer: true, items: { include: { product: true } }, invoice: true },
    });
    if (!existingOrder) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const updateData: Record<string, unknown> = {
        status,
        ...(trackingId && { trackingId: sanitize(trackingId) }),
        ...(shippingCarrier && { shippingCarrier: sanitize(shippingCarrier) }),
        ...(shippingDetails && { shippingDetails: sanitize(shippingDetails) }),
        ...(status === "shipped" && { shippedAt: new Date() }),
        ...(status === "delivered" && { deliveredAt: new Date() }),
    };

    const order = await prisma.order.update({
        where: { id },
        data: updateData,
        include: { buyer: true, items: { include: { product: true } }, invoice: true },
    });

    // ─── Auto-generate invoice on first approval ──────────────────────────────
    if (status === "approved" && !existingOrder.invoice) {
        const sellerGstin = process.env.NEXT_PUBLIC_SELLER_GSTIN || "29AABCU9603R1ZX";
        const sellerState = process.env.NEXT_PUBLIC_SELLER_STATE || "Maharashtra";
        const buyerState = order.buyerState;
        const isInterState = buyerState.trim().toLowerCase() !== sellerState.trim().toLowerCase();

        const igst = isInterState ? order.gstAmount : 0;
        const cgst = isInterState ? 0 : order.gstAmount / 2;
        const sgst = isInterState ? 0 : order.gstAmount / 2;

        const invoiceNumber = `INV-${new Date().getFullYear()}-${uuidv4().slice(0, 8).toUpperCase()}`;

        const invoice = await prisma.invoice.create({
            data: {
                invoiceNumber,
                orderId: order.id,
                buyerId: order.buyerId,
                sellerGstin,
                buyerGstin: order.buyer.gstNumber || "",
                placeOfSupply: buyerState,
                subtotal: order.totalAmount,
                cgst,
                sgst,
                igst,
                totalTax: order.gstAmount,
                grandTotal: order.grandTotal,
            },
        });

        // ─── Deduct from buyer credit if enabled ─────────────────────────────────
        if (order.buyer.creditEnabled) {
            await prisma.user.update({
                where: { id: order.buyerId },
                data: { usedCredit: { increment: order.grandTotal } },
            });
            await prisma.creditTransaction.create({
                data: {
                    buyerId: order.buyerId,
                    type: "debit",
                    amount: order.grandTotal,
                    description: `Order approved: ${order.orderNumber}`,
                    orderId: order.id,
                },
            });
        }

        // ─── Send approval + invoice emails ──────────────────────────────────────
        try {
            await sendOrderApprovalEmail(
                order.buyer.email,
                order.buyer.companyName || order.buyer.email,
                order.orderNumber,
                order.grandTotal,
            );
            await sendInvoiceEmail(
                order.buyer.email,
                order.buyer.companyName || order.buyer.email,
                order.orderNumber,
                invoice.invoiceNumber,
                invoice.id,
            );
            await prisma.order.update({ where: { id }, data: { emailSent: true } });
            await prisma.invoice.update({ where: { id: invoice.id }, data: { emailSent: true } });
        } catch (e) {
            console.error("Email send failed:", e);
        }
    }

    return NextResponse.json({ order });
}
