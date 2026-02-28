import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getChatResponse, Product } from "@/lib/ai-engine";

export async function POST(req: NextRequest) {
    const { message } = await req.json();
    const products: Product[] = await prisma.product.findMany({ where: { isActive: true } });
    const response = getChatResponse(message, { products });
    return NextResponse.json({ response });
}
