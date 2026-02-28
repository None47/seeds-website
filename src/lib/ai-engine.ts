// Rule-based AI Seed Recommendation Engine
// No LLM API - uses internal product database and agronomic rules

export interface RecommendationInput {
    state: string;
    soilType: string;
    season: string;
    budget: string; // "low" | "medium" | "high"
    cropInterest?: string;
}

export interface Product {
    id: string; cropName: string; varietyName: string; category: string;
    germinationPct: number; yieldPerAcre: string; suitableSeason: string;
    suitableRegions: string; tierPricing: string; moq: number;
}

export interface Recommendation {
    product: Product;
    score: number;
    reasons: string[];
    estimatedYield: string;
    suitabilityLevel: "Excellent" | "Good" | "Moderate";
}

const STATE_REGIONS: Record<string, string[]> = {
    "Punjab": ["North India", "Wheat Belt", "Indo-Gangetic Plain"],
    "Haryana": ["North India", "Wheat Belt", "Indo-Gangetic Plain"],
    "Uttar Pradesh": ["North India", "Indo-Gangetic Plain"],
    "Rajasthan": ["Western India", "Arid Zone"],
    "Maharashtra": ["Western India", "Deccan Plateau"],
    "Gujarat": ["Western India", "Cotton Belt"],
    "Madhya Pradesh": ["Central India", "Soybean Belt"],
    "Karnataka": ["South India", "Deccan Plateau"],
    "Tamil Nadu": ["South India", "Delta Region", "Coastal"],
    "Andhra Pradesh": ["South India", "Delta Region"],
    "Telangana": ["South India", "Deccan Plateau"],
    "West Bengal": ["East India", "Delta Region"],
    "Bihar": ["East India", "Indo-Gangetic Plain"],
    "Odisha": ["East India", "Coastal"],
    "Assam": ["North East India"],
};

const SOIL_CROP_MAP: Record<string, string[]> = {
    "alluvial": ["Wheat", "Rice", "Pulses", "Vegetable"],
    "black": ["Cotton", "Wheat", "Soybean", "Pulses"],
    "red": ["Pulses", "Cotton", "Vegetable", "Wheat"],
    "laterite": ["Rice", "Vegetable", "Pulses"],
    "sandy": ["Pulses", "Vegetable", "Cotton"],
    "loam": ["Wheat", "Rice", "Vegetable", "Hybrid", "Cotton", "Pulses"],
};

const SEASON_MAP: Record<string, string[]> = {
    "Rabi": ["Wheat", "Pulses"],
    "Kharif": ["Rice", "Cotton", "Vegetable", "Hybrid"],
    "Zaid": ["Vegetable"],
    "All season": ["Vegetable"],
};

const BUDGET_TIERS: Record<string, { minPrice: number; maxPrice: number }> = {
    low: { minPrice: 0, maxPrice: 100 },
    medium: { minPrice: 50, maxPrice: 500 },
    high: { minPrice: 200, maxPrice: 999999 },
};

export function getRecommendations(input: RecommendationInput, products: Product[]): Recommendation[] {
    const stateRegions = STATE_REGIONS[input.state] || [];
    const soilCrops = SOIL_CROP_MAP[input.soilType.toLowerCase()] || [];
    const seasonCrops = SEASON_MAP[input.season] || SEASON_MAP["Kharif"];
    const budgetRange = BUDGET_TIERS[input.budget] || BUDGET_TIERS.medium;

    const results: Recommendation[] = [];

    for (const product of products) {
        const reasons: string[] = [];
        let score = 0;

        // 1. Season match
        const productSeasons = product.suitableSeason.split(/[,/]/).map(s => s.trim());
        const seasonMatch = productSeasons.some(s => s === input.season || s === "All season");
        if (seasonMatch) { score += 30; reasons.push(`✅ Suitable for ${input.season} season`); }
        else { score -= 20; }

        // 2. Region match
        const productRegions = product.suitableRegions.toLowerCase();
        const regionMatch = stateRegions.some(r => productRegions.includes(r.toLowerCase())) ||
            productRegions.includes(input.state.toLowerCase());
        if (regionMatch) { score += 25; reasons.push(`✅ Recommended for ${input.state}`); }

        // 3. Soil match
        const cropMatchesSoil = soilCrops.includes(product.category);
        if (cropMatchesSoil) { score += 20; reasons.push(`✅ Suitable for ${input.soilType} soil`); }

        // 4. Budget match
        try {
            const tiers = JSON.parse(product.tierPricing);
            if (tiers.length > 0) {
                const basePrice = tiers[0].pricePerUnit;
                if (basePrice >= budgetRange.minPrice && basePrice <= budgetRange.maxPrice) {
                    score += 15; reasons.push(`✅ Fits your ${input.budget} budget`);
                }
            }
        } catch { }

        // 5. Germination bonus
        if (product.germinationPct >= 94) { score += 10; reasons.push(`✅ Excellent germination: ${product.germinationPct}%`); }
        else if (product.germinationPct >= 90) { score += 5; reasons.push(`✅ Good germination: ${product.germinationPct}%`); }

        // 6. Crop interest filter
        if (input.cropInterest && product.category.toLowerCase() === input.cropInterest.toLowerCase()) {
            score += 20; reasons.push(`✅ Matches your preferred crop`);
        }

        if (score > 20) {
            results.push({
                product,
                score,
                reasons: reasons.length > 0 ? reasons : ["📊 Based on regional data"],
                estimatedYield: product.yieldPerAcre || "Contact for details",
                suitabilityLevel: score >= 70 ? "Excellent" : score >= 45 ? "Good" : "Moderate",
            });
        }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, 5);
}

// Rule-based chat responses
export interface ChatContext { products: Product[]; }

export function getChatResponse(message: string, context: ChatContext): string {
    const msg = message.toLowerCase();

    // Greetings
    if (/^(hi|hello|hey|namaste|namaskar)/.test(msg))
        return "👋 Namaste! I am SeedsCo AI Assistant. I can help you with:\n• Seed recommendations for your region\n• Product specifications & germination rates\n• Pricing and MOQ information\n• Ordering process\n\nWhat would you like to know?";

    // Pricing questions
    if (/price|cost|rate|₹|rupee/.test(msg)) {
        const cats = ["wheat", "rice", "vegetable", "cotton", "pulse", "hybrid"];
        const found = cats.find(c => msg.includes(c));
        if (found) {
            const prods = context.products.filter(p => p.category.toLowerCase().includes(found));
            if (prods.length > 0) {
                const list = prods.slice(0, 3).map(p => {
                    try { const t = JSON.parse(p.tierPricing); return `• ${p.varietyName}: ₹${t[0]?.pricePerUnit || "—"}/kg (MOQ: ${p.moq} kg)`; }
                    catch { return `• ${p.varietyName}: Contact for pricing`; }
                }).join("\n");
                return `💰 Here are our ${found} seed prices:\n\n${list}\n\nPrices are per kg for minimum order. Bulk discounts available for larger quantities. Login to view full tier pricing.`;
            }
        }
        return "💰 Our pricing varies by variety and quantity. We offer bulk discount tiers — the more you order, the lower the price per kg. Please login to your distributor account to view the detailed bulk pricing table for each product.";
    }

    // Germination questions
    if (/germinat/.test(msg))
        return "✅ SeedsCo guarantees a minimum **92% germination rate** across all varieties. Premium varieties go up to 96-97%. Each lot is independently tested at ICAR-approved laboratories. Lot number and testing date are mentioned on every product page.";

    // MOQ questions
    if (/moq|minimum order|min order/.test(msg))
        return "📦 MOQ (Minimum Order Quantity) varies by product:\n• Seeds (kg-based): 100 kg – 1000 kg depending on variety\n• Vegetable seeds (gram-based): 500g – 5 kg\n• Cotton seeds (packet-based): 100 packets\n\nThe exact MOQ is clearly shown on each product page.";

    // Season questions
    if (/season|rabi|kharif|zaid/.test(msg)) {
        if (msg.includes("rabi")) return "🌾 **Rabi season** (Oct–March):\n• Wheat varieties: RH-749, HD-2967, WH-147\n• Mustard, Barley, Gram (Chickpea)\n• Best sown: October–November\n• Harvested: March–April";
        if (msg.includes("kharif")) return "🌾 **Kharif season** (June–Oct):\n• Rice, Cotton, Maize, Soybean\n• Vegetable hybrids: Tomato, Brinjal, Chilli\n• Best sown: June–July (after monsoon)\n• Harvested: September–October";
        return "🌾 We have seeds for all three seasons:\n• **Rabi** (Oct–March): Wheat, Gram, Mustard\n• **Kharif** (June–Oct): Rice, Cotton, Vegetables\n• **Zaid** (March–June): Summer vegetables\n\nUse our AI Seed Advisor to get season-specific recommendations for your state!";
    }

    // State / region
    if (/punjab|haryana|maharashtra|gujarat|rajasthan|up|bihar|karnataka|tamil/.test(msg)) {
        const stateMap: Record<string, string> = {
            punjab: "Punjab — Wheat (HD-3086, PBW-550), Basmati Rice, Sarson (Mustard)",
            haryana: "Haryana — Wheat (WH-542, WH-711), Paddy, Cotton",
            maharashtra: "Maharashtra — Cotton (BT varieties), Soybean, Tur (Pigeon pea), Vegetable hybrids",
            gujarat: "Gujarat — BT Cotton, Castor, Groundnut, Wheat",
            rajasthan: "Rajasthan — Wheat, Bajra (Pearl millet), Pulses (Moong, Moth bean)",
            karnataka: "Karnataka — Ragi, Jowar, Cotton, Vegetable hybrids",
        };
        const match = Object.keys(stateMap).find(k => msg.includes(k));
        if (match) return `🌍 Top recommended crops for **${match.charAt(0).toUpperCase() + match.slice(1)}**:\n\n${stateMap[match]}\n\nUse our AI Advisor tool for personalized recommendations based on your soil type and budget!`;
    }

    // KYC / Registration
    if (/kyc|register|distributor|apply|sign up/.test(msg))
        return "📋 **How to become a SeedsCo distributor:**\n1. Click 'Register as Distributor' on the homepage\n2. Enter your company details, GST & PAN numbers\n3. Add your business address and state\n4. Upload your GST certificate\n5. Wait for KYC approval (24-48 hours)\n\nOnce approved, you can immediately start placing bulk orders!";

    // GST / Invoice
    if (/gst|invoice|tax|billing/.test(msg))
        return "🧾 **GST & Invoicing at SeedsCo:**\n• We are GST registered: GSTIN 29AABCU9603R1ZX\n• GST rates: 0% for most seeds, 5%/12% for processed varieties\n• Automatic tax invoice generated when your order is approved\n• CGST+SGST for same-state orders, IGST for inter-state\n• All invoices downloadable from your dashboard\n• Perfect for your business accounting and returns";

    // Default / fallback
    const productCount = context.products.length;
    return `🌱 I'm here to help! We currently have **${productCount}** active seed varieties across Wheat, Rice, Vegetables, Hybrid, Cotton, and Pulses.\n\nYou can ask me about:\n• "What seeds are good for Punjab in Rabi season?"\n• "What is the germination rate?"\n• "What are the prices for wheat seeds?"\n• "How do I register as a distributor?"\n\nOr use our **AI Seed Advisor** for personalized crop recommendations!`;
}
