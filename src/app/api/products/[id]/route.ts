import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getSessionUser();
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await req.json();
    const product = await prisma.product.update({ where: { id }, data: body });
    return NextResponse.json(product);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getSessionUser();
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    await prisma.product.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ message: "Product removed" });
}
