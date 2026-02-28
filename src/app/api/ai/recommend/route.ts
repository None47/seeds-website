import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRecommendations, RecommendationInput } from "@/lib/ai-engine";

export async function POST(req: NextRequest) {
    const input: RecommendationInput = await req.json();
    const products = await prisma.product.findMany({ where: { isActive: true } });
    const recs = getRecommendations(input, products);
    return NextResponse.json(recs);
}
