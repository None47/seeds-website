"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import styles from "./page.module.css";
import AiChat from "@/components/AiChat";

const INDIAN_STATES = [
    "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const SOIL_TYPES = ["Alluvial", "Black", "Red", "Laterite", "Sandy", "Loam"];
const SEASONS = ["Rabi", "Kharif", "Zaid", "All season"];

interface Recommendation {
    product: { id: string; cropName: string; varietyName: string; category: string; germinationPct: number; yieldPerAcre: string; moq: number; tierPricing: string };
    score: number; reasons: string[]; estimatedYield: string; suitabilityLevel: string;
}

const LEVEL_COLORS: Record<string, string> = { Excellent: "success", Good: "primary", Moderate: "warning" };

export default function AIRecommendPage() {
    const [form, setForm] = useState({ state: "", soilType: "Alluvial", season: "Kharif", budget: "medium", cropInterest: "" });
    const [results, setResults] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

    const handleSearch = async () => {
        if (!form.state) { alert("Please select your state"); return; }
        setLoading(true); setSearched(true);
        const res = await fetch("/api/ai/recommend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        setLoading(false);
    };

    const getBasePrice = (tierPricing: string) => {
        try { const t = JSON.parse(tierPricing); return t[0]?.pricePerUnit ? `₹${t[0].pricePerUnit}/kg` : "—"; }
        catch { return "Contact"; }
    };

    return (
        <>
            <Navbar />
            <main>
                {/* Hero */}
                <section className={styles.hero}>
                    <div className="container">
                        <div className={styles.heroContent}>
                            <div className={styles.heroBadge}>🤖 AI-Powered</div>
                            <h1 className={styles.heroTitle}>AI Seed Advisor</h1>
                            <p className={styles.heroSubtitle}>
                                Get personalized seed recommendations based on your state, soil type, season, and budget — powered by our agronomic rule engine.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="py-section">
                    <div className="container">
                        <div className={styles.layout}>
                            {/* Form Panel */}
                            <div className={styles.formPanel}>
                                <h2 className={styles.panelTitle}>🌾 Enter Your Details</h2>
                                <div className={styles.formFields}>
                                    <div className="form-group">
                                        <label className="form-label">State *</label>
                                        <select className="form-select" value={form.state} onChange={e => set("state", e.target.value)}>
                                            <option value="">Select your state</option>
                                            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Soil Type</label>
                                        <select className="form-select" value={form.soilType} onChange={e => set("soilType", e.target.value)}>
                                            {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Season</label>
                                        <select className="form-select" value={form.season} onChange={e => set("season", e.target.value)}>
                                            {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Budget Range</label>
                                        <select className="form-select" value={form.budget} onChange={e => set("budget", e.target.value)}>
                                            <option value="low">Low (up to ₹100/kg)</option>
                                            <option value="medium">Medium (₹50–₹500/kg)</option>
                                            <option value="high">High (Premium varieties)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Preferred Crop (optional)</label>
                                        <select className="form-select" value={form.cropInterest} onChange={e => set("cropInterest", e.target.value)}>
                                            <option value="">Any crop</option>
                                            {["Wheat", "Rice", "Vegetable", "Hybrid", "Cotton", "Pulses"].map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <button className="btn btn-primary w-full" onClick={handleSearch} disabled={loading} style={{ marginTop: "0.5rem" }}>
                                        {loading ? <><span className="spinner" style={{ width: 16, height: 16 }}></span> Analyzing...</> : "🔍 Get AI Recommendations"}
                                    </button>
                                </div>

                                <div className={styles.tipBox}>
                                    <strong>💡 Pro Tip:</strong> Select the correct season for your sowing schedule. Rabi = Oct–March, Kharif = June–Oct.
                                </div>
                            </div>

                            {/* Results Panel */}
                            <div className={styles.resultsPanel}>
                                {!searched ? (
                                    <div className={styles.emptyState}>
                                        <div className={styles.emptyIcon}>🌱</div>
                                        <h3>Ready to Advise You</h3>
                                        <p>Fill in your farming details on the left and click &#34;Get AI Recommendations&#34; to see personalized seed suggestions from our catalogue.</p>
                                    </div>
                                ) : loading ? (
                                    <div className={styles.emptyState}>
                                        <div style={{ fontSize: "3rem", animation: "spin 1s linear infinite" }}>🔄</div>
                                        <p>Analyzing your profile against our seed database...</p>
                                    </div>
                                ) : results.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <div className={styles.emptyIcon}>📭</div>
                                        <h3>No Matches Found</h3>
                                        <p>No products currently match your criteria. Try adjusting your filters or <Link href="/products">browse all products</Link>.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className={styles.resultsHeader}>
                                            <h2 className={styles.resultsTitle}>✨ {results.length} Recommendations for {form.state}</h2>
                                            <p className={styles.resultsMeta}>{form.season} season · {form.soilType} soil · {form.budget} budget</p>
                                        </div>
                                        <div className={styles.resultsList}>
                                            {results.map((rec, i) => (
                                                <div key={rec.product.id} className={styles.recCard}>
                                                    <div className={styles.recHeader}>
                                                        <div className={styles.recRank}>#{i + 1}</div>
                                                        <div className={styles.recInfo}>
                                                            <h3 className={styles.recName}>{rec.product.varietyName}</h3>
                                                            <p className={styles.recCrop}>{rec.product.cropName} · {rec.product.category}</p>
                                                        </div>
                                                        <span className={`badge badge-${LEVEL_COLORS[rec.suitabilityLevel] || "primary"}`}>{rec.suitabilityLevel}</span>
                                                    </div>
                                                    <div className={styles.recStats}>
                                                        <div className={styles.recStat}><span>Germination</span><strong>{rec.product.germinationPct}%</strong></div>
                                                        <div className={styles.recStat}><span>Yield/Acre</span><strong>{rec.estimatedYield}</strong></div>
                                                        <div className={styles.recStat}><span>Base Price</span><strong>{getBasePrice(rec.product.tierPricing)}</strong></div>
                                                        <div className={styles.recStat}><span>MOQ</span><strong>{rec.product.moq} kg</strong></div>
                                                    </div>
                                                    <div className={styles.recReasons}>
                                                        {rec.reasons.map((r, j) => <div key={j} className={styles.reason}>{r}</div>)}
                                                    </div>
                                                    <Link href={`/products/${rec.product.id}`} className="btn btn-primary btn-sm">View & Order →</Link>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
            <AiChat />
        </>
    );
}
