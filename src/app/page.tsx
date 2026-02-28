"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AiChat from "@/components/AiChat";
import styles from "./page.module.css";

interface Product {
    id: string; cropName: string; varietyName: string; category: string;
    germinationPct: number; moq: number; gstRate: number; tierPricing: string;
    suitableSeason: string; yieldPerAcre: string;
}

const CATEGORY_ICONS: Record<string, string> = {
    Wheat: "🌾", Rice: "🍚", Vegetable: "🥦", Hybrid: "🌽", Cotton: "☁️", Pulses: "🫘",
};

const CATEGORIES = [
    { icon: "🌾", name: "Wheat", desc: "High-yield Rabi varieties for north India" },
    { icon: "🍚", name: "Rice", desc: "Basmati & paddy for delta regions" },
    { icon: "🥦", name: "Vegetable", desc: "F1 hybrids for year-round growing" },
    { icon: "🌽", name: "Hybrid", desc: "Disease-resistant, max-yield hybrids" },
    { icon: "☁️", name: "Cotton", desc: "BT cotton for Vidarbha & Gujarat" },
    { icon: "🫘", name: "Pulses", desc: "Gram, tur, moong for dryland farming" },
];

const WHY_US = [
    {
        icon: "🔬",
        title: "Lab-Certified Every Batch",
        desc: "Every lot is tested at ICAR-approved labs before dispatch. Germination %, purity %, and lot number on every invoice.",
    },
    {
        icon: "🌍",
        title: "Region-Matched Varieties",
        desc: "We stock seeds proven for your specific state, season, and soil type — not generic varieties shipped everywhere.",
    },
    {
        icon: "📊",
        title: "Transparent Bulk Pricing",
        desc: "Tiered pricing with no hidden charges. GST is calculated server-side and shown clearly before every order.",
    },
    {
        icon: "🤝",
        title: "eKYC Verified Network",
        desc: "Only GST-registered distributors and retailers get access. Every partner is verified, every transaction audited.",
    },
    {
        icon: "🧾",
        title: "Auto GST Invoice",
        desc: "Tax invoice generated automatically on order approval — CGST/SGST for intra-state, IGST for inter-state.",
    },
    {
        icon: "📦",
        title: "Full Order Tracking",
        desc: "Real-time order status from pending through delivery. Tracking ID and carrier info on every shipment.",
    },
];

const TRUST_STATS = [
    { value: "500+", label: "Verified Distributors" },
    { value: "28", label: "States Covered" },
    { value: "94%", label: "Min. Germination Rate" },
    { value: "8", label: "Crop Categories" },
];

const CERTS = [
    { label: "ICAR Certified", desc: "Seeds tested at ICAR-approved labs" },
    { label: "Seed Act Compliant", desc: "Compliant with The Seeds Act, 1966" },
    { label: "GST Registered", desc: "GSTIN: 29AABCU9603R1ZX" },
    { label: "Quality Assured", desc: "ISO-standard lab testing" },
];

const TESTIMONIAL_COLS = [
    {
        quote: "SeedsCo wheat varieties gave us 22% higher yield compared to local suppliers. The germination guarantee is real.",
        name: "Rajiv Agarwal",
        title: "Agro Distributor, Ludhiana, Punjab",
        initials: "RA",
    },
    {
        quote: "eKYC was smooth, invoicing is GST-perfect, and every order is traceable. This is how B2B seed business should work.",
        name: "Sunita Patil",
        title: "Seed Retailer, Nagpur, Maharashtra",
        initials: "SP",
    },
    {
        quote: "Their AI Advisor helped me choose the right Rabi varieties for Vidarbha. Our returns improved significantly.",
        name: "Mahesh Kaur",
        title: "Regional Distributor, Amravati",
        initials: "MK",
    },
];

export default function HomePage() {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        fetch("/api/products")
            .then(r => r.json())
            .then(d => { setFeaturedProducts(Array.isArray(d) ? d.slice(0, 6) : []); setLoaded(true); });
    }, []);

    const basePrice = (tier: string) => {
        try { const t = JSON.parse(tier); return t[0]?.pricePerUnit ?? null; }
        catch { return null; }
    };

    return (
        <>
            <Navbar />

            {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
            <section className={styles.hero}>
                <div className="container">
                    <div className={styles.heroLayout}>
                        {/* Copy */}
                        <div className={styles.heroCopy}>
                            <div className={styles.heroPill}>
                                <span className={styles.heroDot} />
                                Serving 500+ distributors across 28 states
                            </div>

                            <h1 className={styles.heroH1}>
                                Premium Seeds.<br />
                                <span className={styles.heroAccent}>Guaranteed Germination.</span><br />
                                Bulk B2B Pricing.
                            </h1>

                            <p className={styles.heroSub}>
                                SeedsCo India is the B2B platform for verified distributors and retailers.
                                Get access to lab-certified hybrid seed varieties, GST-compliant invoicing,
                                and tier-based bulk pricing — all in one place.
                            </p>

                            <div className={styles.heroBullets}>
                                {["94%+ germination rate — lab-tested every batch", "Transparent bulk pricing with automatic GST invoice", "ICAR-certified varieties for every region and season"].map(b => (
                                    <div key={b} className={styles.heroBullet}>
                                        <span className={styles.heroCheck}>✓</span> {b}
                                    </div>
                                ))}
                            </div>

                            <div className={styles.heroCtas}>
                                <Link href="/register" className="btn btn-primary btn-xl">Register as Distributor</Link>
                                <Link href="/products" className={`btn btn-outline btn-xl`}>Explore Products</Link>
                            </div>

                            <p className={styles.heroNote}>
                                Verification takes 24–48 hours. Free to register.
                            </p>
                        </div>

                        {/* Visual card */}
                        <div className={styles.heroRight}>
                            <div className={styles.heroCard}>
                                <div className={styles.heroCardTop}>
                                    <span className={styles.heroCardEmoji}>🌾</span>
                                    <div>
                                        <div className={styles.heroCardLabel}>Current Season</div>
                                        <div className={styles.heroCardVal}>Rabi 2024–25</div>
                                    </div>
                                </div>
                                <div className={styles.heroCardDivider} />
                                <div className={styles.heroCardStats}>
                                    {TRUST_STATS.map(s => (
                                        <div key={s.label} className={styles.heroStat}>
                                            <div className={styles.heroStatVal}>{s.value}</div>
                                            <div className={styles.heroStatLabel}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className={styles.heroCardDivider} />
                                <div className={styles.heroCardBadges}>
                                    <span className="badge badge-green">✓ ICAR Certified</span>
                                    <span className="badge badge-olive">✓ GST Compliant</span>
                                    <span className="badge badge-green">✓ Lab Tested</span>
                                </div>
                            </div>

                            <div className={styles.heroFloatCards}>
                                <div className={styles.heroFloat}>
                                    <span>🧾</span>
                                    <div>
                                        <div className={styles.hfTitle}>Auto GST Invoice</div>
                                        <div className={styles.hfSub}>On every order approval</div>
                                    </div>
                                </div>
                                <div className={`${styles.heroFloat} ${styles.heroFloatRight}`}>
                                    <span>🔒</span>
                                    <div>
                                        <div className={styles.hfTitle}>eKYC Verified</div>
                                        <div className={styles.hfSub}>B2B-only access</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
          TRUST BAR
      ══════════════════════════════════════════════════════ */}
            <section className={styles.trustBar}>
                <div className="container">
                    <div className={styles.trustGrid}>
                        {TRUST_STATS.map(s => (
                            <div key={s.label} className={styles.trustItem}>
                                <div className={styles.trustVal}>{s.value}</div>
                                <div className={styles.trustLabel}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
          WHY CHOOSE US
      ══════════════════════════════════════════════════════ */}
            <section className="section">
                <div className="container">
                    <div className={styles.sectionHead}>
                        <p className="label">WHY SEEDSCO INDIA</p>
                        <h2 className="heading-lg">Built for Serious B2B Distributors</h2>
                        <p className={styles.sectionSub}>
                            We're not a general agriculture marketplace. We are a single-seller, verified partner platform —
                            designed for GST-registered distributors who need trust, traceability, and scale.
                        </p>
                    </div>
                    <div className={styles.whyGrid}>
                        {WHY_US.map(w => (
                            <div key={w.title} className={styles.whyCard}>
                                <div className={styles.whyIcon}>{w.icon}</div>
                                <h3 className={styles.whyTitle}>{w.title}</h3>
                                <p className={styles.whyDesc}>{w.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
          CATEGORIES
      ══════════════════════════════════════════════════════ */}
            <section className={`section ${styles.catSection}`}>
                <div className="container">
                    <div className={styles.sectionHead}>
                        <p className="label">SEED CATALOGUE</p>
                        <h2 className="heading-lg">Browse by Crop Category</h2>
                    </div>
                    <div className={styles.catGrid}>
                        {CATEGORIES.map(c => (
                            <Link key={c.name} href={`/products?category=${c.name}`} className={styles.catCard}>
                                <div className={styles.catIcon}>{c.icon}</div>
                                <div className={styles.catName}>{c.name}</div>
                                <div className={styles.catDesc}>{c.desc}</div>
                                <div className={styles.catArrow}>→</div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
          FEATURED PRODUCTS
      ══════════════════════════════════════════════════════ */}
            <section className={`section ${styles.productSection}`}>
                <div className="container">
                    <div className={`${styles.sectionHead} ${styles.sectionHeadRow}`}>
                        <div>
                            <p className="label">FEATURED VARIETIES</p>
                            <h2 className="heading-lg">Top-Selling Seeds This Season</h2>
                        </div>
                        <Link href="/products" className="btn btn-outline">View Full Catalogue →</Link>
                    </div>
                    <div className={styles.productGrid}>
                        {!loaded
                            ? Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className={styles.productSkel}>
                                    <div className={`skeleton ${styles.skelImg}`} />
                                    <div className={styles.skelBody}>
                                        <div className="skeleton mt-2" style={{ height: 10, width: "40%", borderRadius: 4 }} />
                                        <div className="skeleton mt-2" style={{ height: 18, width: "75%", borderRadius: 4 }} />
                                        <div className="skeleton mt-1" style={{ height: 12, width: "50%", borderRadius: 4 }} />
                                    </div>
                                </div>
                            ))
                            : featuredProducts.map(p => {
                                const price = basePrice(p.tierPricing);
                                return (
                                    <Link key={p.id} href={`/products/${p.id}`} className={styles.productCard}>
                                        <div className={styles.productImg}>
                                            <div className={styles.productEmoji}>{CATEGORY_ICONS[p.category] || "🌱"}</div>
                                            <span className={`badge badge-olive ${styles.seasonTag}`}>{p.suitableSeason}</span>
                                        </div>
                                        <div className={styles.productBody}>
                                            <p className={styles.productCat}>{p.category}</p>
                                            <h3 className={styles.productName}>{p.varietyName}</h3>
                                            <p className={styles.productCrop}>{p.cropName}</p>
                                            <div className={styles.productMetrics}>
                                                <div className={styles.metric}><span className={styles.mLabel}>Germination</span><span className={styles.mVal}>{p.germinationPct}%</span></div>
                                                <div className={styles.metric}><span className={styles.mLabel}>Yield/Acre</span><span className={styles.mVal}>{p.yieldPerAcre.split("–")[0]}+</span></div>
                                                <div className={styles.metric}><span className={styles.mLabel}>MOQ</span><span className={styles.mVal}>{p.moq} kg</span></div>
                                            </div>
                                            <div className={styles.productFooter}>
                                                {price ? <div className={styles.price}>from ₹{price}<span>/kg</span></div>
                                                    : <div className={styles.price}>Login for pricing</div>}
                                                <span className={styles.viewCta}>View details →</span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })
                        }
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
          CERTIFICATIONS
      ══════════════════════════════════════════════════════ */}
            <section className={`section ${styles.certSection}`}>
                <div className="container">
                    <div className={styles.certLayout}>
                        <div className={styles.certCopy}>
                            <p className="label">QUALITY ASSURANCE</p>
                            <h2 className="heading-lg">Every Seed. Every Batch. Certified.</h2>
                            <p className={styles.certDesc}>
                                We don't sell seeds we haven't tested. Every lot goes through an independent
                                germination and purity test before it enters our inventory. Lot numbers are
                                printed on every invoice for full traceability.
                            </p>
                            <div className={styles.certList}>
                                {CERTS.map(c => (
                                    <div key={c.label} className={styles.certItem}>
                                        <div className={styles.certTick}>✓</div>
                                        <div>
                                            <div className={styles.certLabel}>{c.label}</div>
                                            <div className={styles.certSub}>{c.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.certVisual}>
                            <div className={styles.certCard}>
                                <div className={styles.certCardLabel}>Sample Lab Test Report</div>
                                <div className={styles.certCardRows}>
                                    {[["Variety", "RH-749 Wheat"], ["Lot Number", "WHT-2024-001"], ["Germination", "94%"], ["Physical Purity", "99%"], ["Moisture", "9.2%"], ["Test Date", "Nov 2024"], ["Status", "✓ APPROVED"]].map(([k, v]) => (
                                        <div key={k} className={styles.certRow}>
                                            <span className={styles.certRowLabel}>{k}</span>
                                            <span className={styles.certRowVal} style={k === "Status" ? { color: "var(--primary)", fontWeight: 700 } : {}}>{v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════ */}
            <section className="section">
                <div className="container">
                    <div className={styles.sectionHead}>
                        <p className="label">PARTNER STORIES</p>
                        <h2 className="heading-lg">Trusted by Distributors Nationwide</h2>
                    </div>
                    <div className={styles.tGrid}>
                        {TESTIMONIAL_COLS.map(t => (
                            <div key={t.name} className={styles.tCard}>
                                <div className={styles.tQuote}>&ldquo;{t.quote}&rdquo;</div>
                                <div className={styles.tAuthor}>
                                    <div className={styles.tAvatar}>{t.initials}</div>
                                    <div>
                                        <div className={styles.tName}>{t.name}</div>
                                        <div className={styles.tTitle}>{t.title}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════ */}
            <section className={`section ${styles.howSection}`}>
                <div className="container">
                    <div className={styles.sectionHead}>
                        <p className="label">HOW IT WORKS</p>
                        <h2 className="heading-lg">Start Ordering in 3 Steps</h2>
                    </div>
                    <div className={styles.stepsGrid}>
                        {[
                            { num: "01", title: "Register & KYC", desc: "Submit your GST number, PAN, and upload your GST certificate. Approval within 24–48 hours." },
                            { num: "02", title: "Browse & Order", desc: "Access bulk pricing tiers, place orders with live GST calculation, minimum order quantity enforced." },
                            { num: "03", title: "Track & Invoice", desc: "Track your order from approval to delivery. GST-compliant invoice generated automatically." },
                        ].map(s => (
                            <div key={s.num} className={styles.step}>
                                <div className={styles.stepNum}>{s.num}</div>
                                <h3 className={styles.stepTitle}>{s.title}</h3>
                                <p className={styles.stepDesc}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════════ */}
            <section className="section-sm">
                <div className="container">
                    <div className={styles.ctaBanner}>
                        <div>
                            <h2 className={styles.ctaTitle}>Ready to Grow Your Seed Business?</h2>
                            <p className={styles.ctaSub}>
                                Join 500+ verified distributors. Free registration. Approval in 24–48 hours.
                            </p>
                        </div>
                        <div className={styles.ctaButtons}>
                            <Link href="/register" className="btn btn-primary btn-lg">Register as Distributor</Link>
                            <Link href="/ai-recommend" className={`btn btn-outline btn-lg ${styles.ctaOutline}`}>Try AI Seed Advisor</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mobile sticky CTA */}
            <div className={styles.mobileCta}>
                <Link href="/register" className="btn btn-primary btn-full">Join as Distributor</Link>
            </div>

            <Footer />
            <AiChat />
        </>
    );
}
