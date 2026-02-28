import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(_req: NextRequest) {
    const user = await getSessionUser();
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
        totalRevenue,
        monthRevenue,
        lastMonthRevenue,
        totalOrders,
        pendingOrders,
        pendingKyc,
        totalProducts,
        lowStockProducts,
        totalUsers,
        approvedDistributors,
        ordersByState,
        recentOrders,
        recentKyc,
    ] = await Promise.all([
        // All-time revenue from non-pending orders
        prisma.order.aggregate({ _sum: { grandTotal: true }, where: { status: { not: "pending" } } }),
        // This month's revenue
        prisma.order.aggregate({
            _sum: { grandTotal: true },
            where: { status: { not: "pending" }, createdAt: { gte: startOfMonth } },
        }),
        // Last month's revenue (for trend)
        prisma.order.aggregate({
            _sum: { grandTotal: true },
            where: { status: { not: "pending" }, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
        }),
        prisma.order.count(),
        prisma.order.count({ where: { status: "pending" } }),
        prisma.user.count({ where: { role: "buyer", kycStatus: "pending" } }),
        prisma.product.count({ where: { isActive: true } }),
        prisma.product.count({ where: { isActive: true, stockQuantity: { lt: 100 } } }),
        // All registered buyers
        prisma.user.count({ where: { role: "buyer" } }),
        // KYC-approved distributors
        prisma.user.count({ where: { role: "buyer", kycStatus: "approved" } }),
        // State-wise breakdown
        prisma.order.groupBy({
            by: ["buyerState"],
            _count: { id: true },
            _sum: { grandTotal: true },
            orderBy: { _count: { id: "desc" } },
            take: 8,
        }),
        // Recent 5 orders with buyer info
        prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
                buyer: { select: { companyName: true, email: true } },
                items: { take: 1, include: { product: { select: { varietyName: true } } } },
            },
        }),
        // Recent 5 KYC status changes
        prisma.user.findMany({
            where: { role: "buyer", kycStatus: { not: "pending" } },
            take: 5,
            orderBy: { updatedAt: "desc" },
            select: {
                id: true, companyName: true, email: true, state: true,
                kycStatus: true, kycApprovedAt: true, updatedAt: true,
            },
        }),
    ]);

    const thisMonthRevenue = monthRevenue._sum.grandTotal || 0;
    const prevMonthRevenue = lastMonthRevenue._sum.grandTotal || 0;
    const revenueGrowth = prevMonthRevenue > 0
        ? Math.round(((thisMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
        : 0;

    return NextResponse.json({
        totalRevenue: totalRevenue._sum.grandTotal || 0,
        thisMonthRevenue,
        revenueGrowth,
        totalOrders,
        pendingOrders,
        pendingKyc,
        totalProducts,
        lowStockProducts,
        totalUsers,
        approvedDistributors,
        ordersByState,
        recentOrders,
        recentKyc,
    });
}
