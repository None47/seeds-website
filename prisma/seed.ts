import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding upgraded database...");

    // Admin
    const adminPass = await bcrypt.hash("admin123", 12);
    await prisma.user.upsert({
        where: { email: "admin@seedsco.com" },
        update: {},
        create: {
            email: "admin@seedsco.com", password: adminPass, role: "admin",
            companyName: "Tanindo Seeds Pvt Ltd", kycStatus: "approved",
        },
    });

    // Demo buyer 1 — Maharashtra (intra-state)
    const buyerPass = await bcrypt.hash("buyer123", 12);
    await prisma.user.upsert({
        where: { email: "buyer@test.com" },
        update: {},
        create: {
            email: "buyer@test.com", password: buyerPass, role: "buyer",
            companyName: "Demo Agro Distributors", phone: "9876543210",
            gstNumber: "27AABCU9603R1ZX", panNumber: "AABCU9603R",
            state: "Maharashtra", district: "Nagpur", pincode: "440001",
            address: "12 Agro Complex, Nagpur", kycStatus: "approved",
            creditLimit: 500000, usedCredit: 0, creditEnabled: true,
        },
    });

    // Demo buyer 2 — Punjab (inter-state IGST)
    await prisma.user.upsert({
        where: { email: "punjab@test.com" },
        update: {},
        create: {
            email: "punjab@test.com", password: await bcrypt.hash("buyer123", 12), role: "buyer",
            companyName: "Punjab Agro Traders", phone: "9812345678",
            gstNumber: "03AABCU9603R1ZX", panNumber: "AABCU9604R",
            state: "Punjab", district: "Ludhiana", pincode: "141001",
            address: "88 Grain Market, Ludhiana", kycStatus: "approved",
            creditLimit: 750000, usedCredit: 0, creditEnabled: false,
        },
    });

    // Products with upgraded schema
    const products = [
        {
            cropName: "Wheat", varietyName: "RH-749 Wheat", category: "Wheat",
            germinationPct: 94, purityPct: 99, lotNumber: "WHT-2024-001",
            batchId: "BATCH-WHT-2024-A01", manufacturingDate: "Sep 2024",
            expiryDate: "Aug 2025", dateOfTesting: "Nov 2024",
            yieldPerAcre: "20–25 quintals", suitableSeason: "Rabi",
            suitableRegions: "Punjab, Haryana, UP, Wheat Belt, North India",
            hsnCode: "1001", gstRate: 0, moq: 500, stockQuantity: 5000,
            description: "High-yielding wheat variety bred for the Indo-Gangetic plains. Resistant to yellow rust and lodging. Recommended for Rabi sowing in north India.",
            isFeatured: true,
            tierPricing: JSON.stringify([
                { minQty: 500, maxQty: 999, pricePerUnit: 85 },
                { minQty: 1000, maxQty: 4999, pricePerUnit: 80 },
                { minQty: 5000, pricePerUnit: 74 },
            ]),
        },
        {
            cropName: "Rice", varietyName: "Pusa Basmati 1121", category: "Rice",
            germinationPct: 96, purityPct: 99.5, lotNumber: "RICE-2024-003",
            batchId: "BATCH-RICE-2024-B03", manufacturingDate: "Aug 2024",
            expiryDate: "Jul 2025", dateOfTesting: "Oct 2024",
            yieldPerAcre: "18–22 quintals", suitableSeason: "Kharif",
            suitableRegions: "Punjab, Haryana, Delta Region, North India, Basmati Belt",
            hsnCode: "1006", gstRate: 0, moq: 200, stockQuantity: 3000,
            description: "Premium extra-long grain Basmati with exceptional aroma. 96% germination guaranteed. Export-quality standard.",
            isFeatured: true,
            tierPricing: JSON.stringify([
                { minQty: 200, maxQty: 499, pricePerUnit: 120 },
                { minQty: 500, maxQty: 1999, pricePerUnit: 110 },
                { minQty: 2000, pricePerUnit: 98 },
            ]),
        },
        {
            cropName: "Tomato", varietyName: "SVS-301 F1 Hybrid Tomato", category: "Vegetable",
            germinationPct: 93, purityPct: 98, lotNumber: "VEG-2024-012",
            batchId: "BATCH-VEG-2024-C12", manufacturingDate: "Jun 2024",
            expiryDate: "May 2025", dateOfTesting: "Sep 2024",
            yieldPerAcre: "25–35 tonnes", suitableSeason: "All season",
            suitableRegions: "All India, Maharashtra, Karnataka, Tamil Nadu",
            hsnCode: "1209", gstRate: 5, moq: 1, stockQuantity: 200,
            description: "Indeterminate F1 hybrid tomato. Deep red, firm fruits with 60-day shelf life. Suitable for ketchup and fresh market. Virus-resistant.",
            isFeatured: true,
            tierPricing: JSON.stringify([
                { minQty: 1, maxQty: 4, pricePerUnit: 18000 },
                { minQty: 5, maxQty: 19, pricePerUnit: 16500 },
                { minQty: 20, pricePerUnit: 15000 },
            ]),
        },
        {
            cropName: "Cotton", varietyName: "BT Bollgard II Cotton", category: "Cotton",
            germinationPct: 90, purityPct: 97, lotNumber: "CTN-2024-007",
            batchId: "BATCH-CTN-2024-D07", manufacturingDate: "Feb 2024",
            expiryDate: "Jan 2025", dateOfTesting: "Mar 2024",
            yieldPerAcre: "12–18 quintals", suitableSeason: "Kharif",
            suitableRegions: "Cotton Belt, Maharashtra, Gujarat, Telangana",
            hsnCode: "5201", gstRate: 5, moq: 300, stockQuantity: 1500,
            description: "Bollworm-resistant BT cotton with high fiber strength. Suitable for Vidarbha and Gujarat cotton belt. Proven performance over 5 seasons.",
            isFeatured: false,
            tierPricing: JSON.stringify([
                { minQty: 300, maxQty: 999, pricePerUnit: 750 },
                { minQty: 1000, maxQty: 2999, pricePerUnit: 700 },
                { minQty: 3000, pricePerUnit: 650 },
            ]),
        },
        {
            cropName: "Maize", varietyName: "DEKALB 9081 Hybrid Maize", category: "Hybrid",
            germinationPct: 95, purityPct: 98.5, lotNumber: "HYB-2024-019",
            batchId: "BATCH-HYB-2024-E19", manufacturingDate: "May 2024",
            expiryDate: "Apr 2025", dateOfTesting: "Aug 2024",
            yieldPerAcre: "28–35 quintals", suitableSeason: "Kharif",
            suitableRegions: "All India, Karnataka, Maharashtra, Bihar, North India",
            hsnCode: "1005", gstRate: 0, moq: 100, stockQuantity: 2000,
            description: "High-density hybrid maize with tolerance to waterlogging and drought stress. Widely adaptable with exceptional standability.",
            isFeatured: true,
            tierPricing: JSON.stringify([
                { minQty: 100, maxQty: 499, pricePerUnit: 280 },
                { minQty: 500, maxQty: 1999, pricePerUnit: 260 },
                { minQty: 2000, pricePerUnit: 240 },
            ]),
        },
        {
            cropName: "Chickpea (Gram)", varietyName: "JG-14 Chickpea", category: "Pulses",
            germinationPct: 92, purityPct: 99, lotNumber: "PLS-2024-005",
            batchId: "BATCH-PLS-2024-F05", manufacturingDate: "Jul 2024",
            expiryDate: "Jun 2025", dateOfTesting: "Oct 2024",
            yieldPerAcre: "8–12 quintals", suitableSeason: "Rabi",
            suitableRegions: "Central India, Madhya Pradesh, Rajasthan, Maharashtra",
            hsnCode: "0713", gstRate: 0, moq: 200, stockQuantity: 800,
            description: "High-yielding desi chickpea (gram) variety. Wilt-resistant with bold seeds. Popular in Madhya Pradesh and Rajasthan.",
            isFeatured: false,
            tierPricing: JSON.stringify([
                { minQty: 200, maxQty: 499, pricePerUnit: 95 },
                { minQty: 500, maxQty: 1999, pricePerUnit: 88 },
                { minQty: 2000, pricePerUnit: 80 },
            ]),
        },
        {
            cropName: "Brinjal", varietyName: "Arka Kiran F1 Brinjal", category: "Vegetable",
            germinationPct: 91, purityPct: 97, lotNumber: "VEG-2024-018",
            batchId: "BATCH-VEG-2024-G18", manufacturingDate: "Apr 2024",
            expiryDate: "Mar 2025", dateOfTesting: "Jul 2024",
            yieldPerAcre: "20–30 tonnes", suitableSeason: "Kharif",
            suitableRegions: "South India, Tamil Nadu, Karnataka, Andhra Pradesh",
            hsnCode: "1209", gstRate: 5, moq: 1, stockQuantity: 80,
            description: "Purple oval F1 hybrid brinjal with high yield potential. Suitable for fresh market and processing. Good shelf life.",
            isFeatured: false,
            tierPricing: JSON.stringify([
                { minQty: 1, maxQty: 9, pricePerUnit: 12000 },
                { minQty: 10, maxQty: 49, pricePerUnit: 11000 },
                { minQty: 50, pricePerUnit: 10000 },
            ]),
        },
        {
            cropName: "Soybean", varietyName: "JS 9305 Soybean", category: "Hybrid",
            germinationPct: 93, purityPct: 98, lotNumber: "HYB-2024-022",
            batchId: "BATCH-HYB-2024-H22", manufacturingDate: "Mar 2024",
            expiryDate: "Feb 2025", dateOfTesting: "Jun 2024",
            yieldPerAcre: "15–20 quintals", suitableSeason: "Kharif",
            suitableRegions: "Central India, Madhya Pradesh, Maharashtra, Rajasthan",
            hsnCode: "1201", gstRate: 0, moq: 500, stockQuantity: 3500,
            description: "High-protein soybean variety with resistance to pod shattering and broad adaptation across central India.",
            isFeatured: false,
            tierPricing: JSON.stringify([
                { minQty: 500, maxQty: 1999, pricePerUnit: 75 },
                { minQty: 2000, maxQty: 4999, pricePerUnit: 70 },
                { minQty: 5000, pricePerUnit: 65 },
            ]),
        },
    ];

    for (const p of products) {
        const exists = await prisma.product.findFirst({ where: { lotNumber: p.lotNumber } });
        if (!exists) await prisma.product.create({ data: p });
        else await prisma.product.update({ where: { id: exists.id }, data: p });
    }

    console.log("✅ Database seeded successfully!");
    console.log("🔐 Admin:  admin@seedsco.com / admin123");
    console.log("👤 Buyer:  buyer@test.com    / buyer123    (Maharashtra — intra-state GST)");
    console.log("👤 Buyer:  punjab@test.com   / buyer123    (Punjab — inter-state IGST)");
}

main().catch(console.error).finally(() => prisma.$disconnect());
