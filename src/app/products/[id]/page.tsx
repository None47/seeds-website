"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

interface TierPrice { minQty: number; maxQty?: number; pricePerUnit: number; }

interface Product {
    id: string; cropName: string; varietyName: string; imageUrl?: string;
    germinationPct: number; purityPct: number; lotNumber: string;
    dateOfTesting: string; yieldPerAcre: string; suitableSeason: string;
    suitableRegions: string; hsnCode: string; gstRate: number; moq: number;
    stockQuantity: number; category: string; description?: string;
    tierPricing: string;
}

const CATEGORY_ICONS: Record<string, string> = {
    Wheat: "🌾", Rice: "🍚", Vegetable: "🥦", Hybrid: "🌽", Cotton: "☁️", Pulses: "🫘",
};

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(0);
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetch(`/api/products/${id}`).then(r => r.json()).then(d => {
            setProduct(d);
            if (d.moq) setQty(d.moq);
            setLoading(false);
        });
    }, [id]);

    if (loading) return <><Navbar /><div style={{ textAlign: "center", padding: "8rem", fontSize: "2rem" }}>⏳ Loading...</div><Footer /></>;
    if (!product) return <><Navbar /><div style={{ textAlign: "center", padding: "8rem" }}>Product not found</div><Footer /></>;

    const tiers: TierPrice[] = (() => { try { return JSON.parse(product.tierPricing); } catch { return []; } })();
    const activePrice = [...tiers].reverse().find(t => qty >= t.minQty)?.pricePerUnit || tiers[0]?.pricePerUnit || 0;
    const subtotal = activePrice * qty;
    const gstAmt = subtotal * product.gstRate / 100;
    const total = subtotal + gstAmt;

    const handleOrder = async () => {
        const user = typeof window !== "undefined" ? localStorage.getItem("user_session") : null;
        if (!user) { router.push("/login"); return; }
        const parsed = JSON.parse(user);
        if (parsed.kycStatus !== "approved") { setError("Your KYC is not approved yet. Please wait for admin approval."); return; }
        if (qty < product.moq) { setError(`Minimum order quantity is ${product.moq} kg.`); return; }
        setPlacing(true); setError(""); setSuccess("");
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: [{ productId: product.id, quantity: qty, pricePerUnit: activePrice }] }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Order failed");
            setSuccess(`✅ Order placed successfully! Order ID: ${data.order.orderNumber}`);
        } catch (e: unknown) { setError(e instanceof Error ? e.message : "Order failed"); }
        finally { setPlacing(false); }
    };

    return (
        <>
            <Navbar />
            <main>
                <section className={styles.pageHeader}>
                    <div className="container">
                        <div className={styles.breadcrumb}>
                            <a href="/products">Products</a> → <span>{product.cropName}</span>
                        </div>
                    </div>
                </section>

                <section className="py-section">
                    <div className="container">
                        <div className={styles.productLayout}>
                            {/* LEFT: Image & Overview */}
                            <div>
                                <div className={styles.productImg}>
                                    {product.imageUrl
                                        ? <img src={product.imageUrl} alt={product.varietyName} />
                                        : <div className={styles.imgPlaceholder}>{CATEGORY_ICONS[product.category] || "🌱"}</div>
                                    }
                                </div>
                                <div className={styles.overviewCard}>
                                    <div className={styles.overviewRow}><span>Crop</span><strong>{product.cropName}</strong></div>
                                    <div className={styles.overviewRow}><span>Category</span><span className="badge badge-primary">{product.category}</span></div>
                                    <div className={styles.overviewRow}><span>HSN Code</span><strong>{product.hsnCode}</strong></div>
                                    <div className={styles.overviewRow}><span>GST Rate</span><strong>{product.gstRate}%</strong></div>
                                    <div className={styles.overviewRow}><span>Stock</span><strong style={{ color: product.stockQuantity < 100 ? "var(--danger)" : "var(--success)" }}>{product.stockQuantity} kg</strong></div>
                                </div>
                            </div>

                            {/* RIGHT: Details */}
                            <div>
                                <div className={styles.productHeader}>
                                    <span className="badge badge-success">{product.suitableSeason}</span>
                                    <h1 className={styles.productTitle}>{product.varietyName}</h1>
                                    <p className={styles.productSubtitle}>{product.cropName} · {product.suitableRegions}</p>
                                    {product.description && <p className={styles.productDesc}>{product.description}</p>}
                                </div>

                                {/* Technical Specs */}
                                <div className={styles.specsCard}>
                                    <h3 className={styles.cardTitle}>🔬 Technical Specifications</h3>
                                    <div className={styles.specsGrid}>
                                        <div className={styles.specItem}><span className={styles.specLabel}>Germination %</span><span className={styles.specValue}>{product.germinationPct}%</span></div>
                                        <div className={styles.specItem}><span className={styles.specLabel}>Purity %</span><span className={styles.specValue}>{product.purityPct}%</span></div>
                                        <div className={styles.specItem}><span className={styles.specLabel}>Lot Number</span><span className={styles.specValue}>{product.lotNumber}</span></div>
                                        <div className={styles.specItem}><span className={styles.specLabel}>Date of Testing</span><span className={styles.specValue}>{product.dateOfTesting}</span></div>
                                        <div className={styles.specItem}><span className={styles.specLabel}>Yield / Acre</span><span className={styles.specValue}>{product.yieldPerAcre}</span></div>
                                        <div className={styles.specItem}><span className={styles.specLabel}>Suitable Season</span><span className={styles.specValue}>{product.suitableSeason}</span></div>
                                    </div>
                                </div>

                                {/* Bulk Pricing Table */}
                                {tiers.length > 0 && (
                                    <div className={styles.pricingCard}>
                                        <h3 className={styles.cardTitle}>💰 Bulk Pricing Tiers</h3>
                                        <div className="table-wrapper">
                                            <table>
                                                <thead>
                                                    <tr><th>Quantity (kg)</th><th>Price / kg</th><th>Savings</th></tr>
                                                </thead>
                                                <tbody>
                                                    {tiers.map((t, i) => (
                                                        <tr key={i} className={qty >= t.minQty && (i === tiers.length - 1 || qty < tiers[i + 1]?.minQty) ? styles.activeTier : ""}>
                                                            <td>{t.minQty}{t.maxQty ? `–${t.maxQty}` : "+"} kg</td>
                                                            <td><strong>₹{t.pricePerUnit}</strong></td>
                                                            <td>{i > 0 ? <span className="badge badge-success">Save ₹{(tiers[0].pricePerUnit - t.pricePerUnit).toFixed(0)}/kg</span> : <span className="badge badge-primary">Base Price</span>}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className={styles.moqNote}>⚠️ Minimum Order Quantity: <strong>{product.moq} kg</strong></p>
                                    </div>
                                )}

                                {/* Order Section */}
                                <div className={styles.orderCard}>
                                    <h3 className={styles.cardTitle}>📦 Place Bulk Order</h3>
                                    {error && <div className="alert alert-danger mb-2">{error}</div>}
                                    {success && <div className="alert alert-success mb-2">{success}</div>}
                                    <div className={styles.qtyRow}>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label className="form-label">Quantity (kg)</label>
                                            <div className={styles.qtyInput}>
                                                <button onClick={() => setQty(q => Math.max(product.moq, q - 50))}>−</button>
                                                <input type="number" className="form-input" value={qty} min={product.moq} onChange={e => setQty(Number(e.target.value))} />
                                                <button onClick={() => setQty(q => q + 50)}>+</button>
                                            </div>
                                            <div className="form-error">Min. order: {product.moq} kg</div>
                                        </div>
                                    </div>

                                    {activePrice > 0 && (
                                        <div className={styles.orderSummary}>
                                            <div className={styles.summaryRow}><span>Subtotal ({qty} kg × ₹{activePrice})</span><strong>₹{subtotal.toFixed(2)}</strong></div>
                                            <div className={styles.summaryRow}><span>GST ({product.gstRate}%)</span><strong>₹{gstAmt.toFixed(2)}</strong></div>
                                            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}><span>Grand Total</span><strong>₹{total.toFixed(2)}</strong></div>
                                        </div>
                                    )}

                                    <button className={`btn btn-primary btn-lg w-full`} onClick={handleOrder} disabled={placing || !activePrice}>
                                        {placing ? <span className="spinner"></span> : "🌾 Place Bulk Order"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Mobile Sticky Order Button */}
            <div className={styles.stickyOrder}>
                <div className={styles.stickyPrice}>₹{activePrice > 0 ? `${activePrice}/kg` : "—"}</div>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleOrder} disabled={placing}>
                    {placing ? "Placing..." : "Place Bulk Order"}
                </button>
            </div>

            <Footer />
        </>
    );
}
