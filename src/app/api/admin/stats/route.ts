import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(_req: NextRequest) {
    const user = await getSessionUser();
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const [totalRevenue, totalOrders, pendingOrders, pendingKyc, totalProducts, lowStockProducts, ordersByState] = await Promise.all([
        prisma.order.aggregate({ _sum: { grandTotal: true }, where: { status: { not: "pending" } } }),
        prisma.order.count(),
        prisma.order.count({ where: { status: "pending" } }),
        prisma.user.count({ where: { role: "buyer", kycStatus: "pending" } }),
        prisma.product.count({ where: { isActive: true } }),
        prisma.product.count({ where: { isActive: true, stockQuantity: { lt: 100 } } }),
        prisma.order.groupBy({
            by: ["buyerState"],
            _count: { id: true },
            _sum: { grandTotal: true },
            orderBy: { _count: { id: "desc" } },
            take: 10,
        }),
    ]);

    return NextResponse.json({
        totalRevenue: totalRevenue._sum.grandTotal || 0,
        totalOrders,
        pendingOrders,
        pendingKyc,
        totalProducts,
        lowStockProducts,
        ordersByState,
    });
}
