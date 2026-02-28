"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AiChat from "@/components/AiChat";
import styles from "./page.module.css";

interface Product {
    id: string; cropName: string; varietyName: string; category: string;
    germinationPct: number; purityPct: number; moq: number; gstRate: number;
    tierPricing: string; suitableSeason: string; yieldPerAcre: string;
    suitableRegions: string; stockQuantity: number; description?: string;
    isFeatured: boolean;
}

const CATEGORIES = ["All", "Wheat", "Rice", "Vegetable", "Hybrid", "Cotton", "Pulses"];
const CATEGORY_ICONS: Record<string, string> = { Wheat: "🌾", Rice: "🍚", Vegetable: "🥦", Hybrid: "🌽", Cotton: "☁️", Pulses: "🫘" };

export default function ProductsPage() {
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState(searchParams.get("category") || "All");
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [searchInput, setSearchInput] = useState(search);

    useEffect(() => {
        setLoading(true);
        const p = new URLSearchParams();
        if (category !== "All") p.set("category", category);
        if (search) p.set("search", search);
        fetch(`/api/products?${p}`).then(r => r.json()).then(d => {
            setProducts(Array.isArray(d) ? d : []);
            setLoading(false);
        });
    }, [category, search]);

    const getBasePrice = (tier: string) => {
        try { const t = JSON.parse(tier); return t[0]?.pricePerUnit ?? null; }
        catch { return null; }
    };

    return (
        <>
            <Navbar />
            <main className={styles.main}>
                {/* Hero band */}
                <div className={styles.heroBand}>
                    <div className="container">
                        <div className={styles.heroContent}>
                            <div>
                                <p className="label" style={{ color: "rgba(255,255,255,0.5)" }}>B2B CATALOGUE</p>
                                <h1 className={styles.heroTitle}>Seed Catalogue</h1>
                            </div>
                            <div className={styles.searchWrap}>
                                <input
                                    className={styles.searchInput}
                                    value={searchInput}
                                    onChange={e => setSearchInput(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && setSearch(searchInput)}
                                    placeholder="Search varieties… (press Enter)"
                                />
                                <button className={styles.searchBtn} onClick={() => setSearch(searchInput)}>Search</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container">
                    {/* Categories */}
                    <div className={styles.catRow}>
                        {CATEGORIES.map(c => (
                            <button
                                key={c}
                                className={`${styles.catBtn} ${category === c ? styles.catBtnActive : ""}`}
                                onClick={() => { setCategory(c); setSearch(""); setSearchInput(""); }}
                            >
                                {CATEGORY_ICONS[c] && <span>{CATEGORY_ICONS[c]}</span>} {c}
                            </button>
                        ))}
                    </div>

                    {/* Count */}
                    <div className={styles.countRow}>
                        <span className="caption">{loading ? "Loading…" : `${products.length} varieties${category !== "All" ? ` in ${category}` : ""}${search ? ` matching "${search}"` : ""}`}</span>
                        {(category !== "All" || search) && (
                            <button className="btn btn-ghost btn-sm" onClick={() => { setCategory("All"); setSearch(""); setSearchInput(""); }}>Clear filters</button>
                        )}
                    </div>

                    {/* Grid */}
                    {loading ? (
                        <div className={styles.grid}>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className={styles.productCard}>
                                    <div className={`skeleton ${styles.cardImg}`} style={{ background: "var(--surface-muted)" }} />
                                    <div className={styles.cardBody}>
                                        <div className="skeleton mt-2" style={{ height: 10, width: "35%", borderRadius: 4 }} />
                                        <div className="skeleton mt-2" style={{ height: 18, width: "70%", borderRadius: 4 }} />
                                        <div className="skeleton mt-1" style={{ height: 14, width: "50%", borderRadius: 4 }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className={styles.empty}>
                            <div style={{ fontSize: "3rem" }}>🔍</div>
                            <p>No products found. <button className="btn btn-ghost btn-sm" onClick={() => { setCategory("All"); setSearch(""); setSearchInput(""); }}>Reset filters</button></p>
                        </div>
                    ) : (
                        <div className={styles.grid}>
                            {products.map(p => (
                                <Link key={p.id} href={`/products/${p.id}`} className={styles.productCard}>
                                    <div className={styles.cardImg}>
                                        <div className={styles.cardEmoji}>{CATEGORY_ICONS[p.category] || "🌱"}</div>
                                        <span className={`badge badge-olive ${styles.seasonBadge}`}>{p.suitableSeason}</span>
                                        {p.isFeatured && <span className={`badge badge-yellow ${styles.featuredBadge}`}>Featured</span>}
                                    </div>
                                    <div className={styles.cardBody}>
                                        <div className={styles.cardCat}>{p.category}</div>
                                        <div className={styles.cardName}>{p.varietyName}</div>
                                        <div className={styles.cardCrop}>{p.cropName}</div>
                                        <div className={styles.cardSpecs}>
                                            <div className={styles.spec}><span className={styles.specL}>Germ</span><span className={styles.specV}>{p.germinationPct}%</span></div>
                                            <div className={styles.spec}><span className={styles.specL}>MOQ</span><span className={styles.specV}>{p.moq} kg</span></div>
                                            <div className={styles.spec}><span className={styles.specL}>Stock</span><span className={styles.specV} style={{ color: p.stockQuantity < 100 ? "var(--danger)" : "inherit" }}>{p.stockQuantity} kg</span></div>
                                        </div>
                                        <div className={styles.cardFooter}>
                                            {getBasePrice(p.tierPricing) !== null ? (
                                                <div className={styles.price}>from ₹{getBasePrice(p.tierPricing)}<span>/kg</span></div>
                                            ) : <div className={styles.price}>Login for pricing</div>}
                                            <span className={styles.viewLink}>View →</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
            <AiChat />
        </>
    );
}
