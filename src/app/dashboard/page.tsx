"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

interface Order {
    id: string; orderNumber: string; status: string; grandTotal: number;
    gstAmount: number; totalAmount: number; createdAt: string;
    buyerState: string; trackingId?: string; shippingCarrier?: string; emailSent: boolean;
    items: { product: { varietyName: string; cropName: string }; quantity: number; pricePerUnit: number; subtotal: number }[];
    invoice?: { id: string; invoiceNumber: string };
}

interface UserSession {
    companyName?: string; email: string; role: string; kycStatus?: string;
    creditLimit?: number; usedCredit?: number; creditEnabled?: boolean;
}

const STATUS_STEPS = ["pending", "approved", "packed", "shipped", "delivered"];
const STATUS_LABEL: Record<string, string> = {
    pending: "Pending Review", approved: "Approved", packed: "Packed",
    shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled",
};

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<UserSession | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        const s = localStorage.getItem("user_session");
        if (!s) { router.push("/login"); return; }
        const u = JSON.parse(s);
        if (u.role === "admin") { router.push("/admin"); return; }
        setUser(u);
        fetch("/api/orders").then(r => r.json()).then(d => {
            setOrders(Array.isArray(d) ? d : []);
            setLoading(false);
        });
    }, [router]);

    const fmt = (v: number) => `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
    const fmtD = (s: string) => new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

    const totalSpent = orders.filter(o => o.status === "delivered").reduce((s, o) => s + o.grandTotal, 0);
    const activeOrders = orders.filter(o => !["delivered", "cancelled"].includes(o.status)).length;
    const deliveredOrders = orders.filter(o => o.status === "delivered").length;

    const creditAvail = user?.creditEnabled
        ? (user.creditLimit || 0) - (user.usedCredit || 0)
        : null;

    if (loading) return (
        <><Navbar />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", flexDirection: "column", gap: 12 }}>
                <div className="spinner spinner-dark" style={{ width: 32, height: 32 }} />
                <p style={{ color: "var(--text-muted)" }}>Loading your dashboard…</p>
            </div>
        </>
    );

    return (
        <>
            <Navbar />
            <main className={styles.main}>
                <div className="container">

                    {/* KYC Alert */}
                    {user?.kycStatus === "pending" && (
                        <div className="alert alert-warning mt-6">
                            ⏳ Your KYC is under review. You'll be notified once approved (usually within 24–48 hours).
                        </div>
                    )}
                    {user?.kycStatus === "rejected" && (
                        <div className="alert alert-danger mt-6">
                            ❌ Your KYC was rejected. Please contact <a href="mailto:b2b@seedscoindia.com">b2b@seedscoindia.com</a> with your documents.
                        </div>
                    )}

                    {/* Header */}
                    <div className={styles.header}>
                        <div>
                            <p className="label">Distributor Dashboard</p>
                            <h1 className={styles.title}>{user?.companyName || user?.email}</h1>
                        </div>
                        <a href="/products" className="btn btn-primary">Browse Catalogue →</a>
                    </div>

                    {/* Stats */}
                    <div className={styles.statsGrid}>
                        {[
                            { label: "Total Orders", value: orders.length, icon: "◎" },
                            { label: "Active Orders", value: activeOrders, icon: "⊙" },
                            { label: "Delivered", value: deliveredOrders, icon: "✓" },
                            { label: "Total Spent", value: fmt(totalSpent), icon: "₹" },
                        ].map(s => (
                            <div key={s.label} className={styles.statCard}>
                                <div className={styles.statIcon}>{s.icon}</div>
                                <div className={styles.statVal}>{s.value}</div>
                                <div className={styles.statLabel}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Credit Widget */}
                    {user?.creditEnabled && creditAvail !== null && (
                        <div className={styles.creditCard}>
                            <div className={styles.creditTitle}>💳 Credit Balance</div>
                            <div className={styles.creditRow}>
                                <div className={styles.creditStat}><div className={styles.creditVal}>{fmt(user.creditLimit || 0)}</div><div className="caption">Limit</div></div>
                                <div className={styles.creditStat}><div className={styles.creditVal} style={{ color: "var(--danger)" }}>{fmt(user.usedCredit || 0)}</div><div className="caption">Used</div></div>
                                <div className={styles.creditStat}><div className={styles.creditVal} style={{ color: "var(--primary)" }}>{fmt(creditAvail)}</div><div className="caption">Available</div></div>
                            </div>
                            <div className={styles.creditBar}>
                                <div className={styles.creditFill} style={{ width: `${Math.min(100, ((user.usedCredit || 0) / (user.creditLimit || 1)) * 100)}%` }} />
                            </div>
                        </div>
                    )}

                    {/* Orders */}
                    <div className={styles.ordersSection}>
                        <div className={styles.sectionTitle}>Order History</div>
                        {orders.length === 0 ? (
                            <div className={styles.empty}>
                                <div className={styles.emptyIcon}>📦</div>
                                <div className={styles.emptyTitle}>No orders yet</div>
                                <a href="/products" className="btn btn-primary mt-4">Browse Products</a>
                            </div>
                        ) : (
                            <div className={styles.orderList}>
                                {orders.map(o => {
                                    const stepIdx = STATUS_STEPS.indexOf(o.status);
                                    const isExpanded = expanded === o.id;
                                    return (
                                        <div key={o.id} className={styles.orderCard}>
                                            <div className={styles.orderHead} onClick={() => setExpanded(isExpanded ? null : o.id)}>
                                                <div>
                                                    <div className={styles.orderNum}>{o.orderNumber}</div>
                                                    <div className="caption">{fmtD(o.createdAt)}</div>
                                                </div>
                                                <div className={styles.orderMeta}>
                                                    <span className={`badge ${o.status === "delivered" ? "badge-green" : o.status === "cancelled" ? "badge-red" : o.status === "shipped" ? "badge-blue" : "badge-yellow"}`}>
                                                        {STATUS_LABEL[o.status]}
                                                    </span>
                                                    <strong className={styles.orderTotal}>{fmt(o.grandTotal)}</strong>
                                                    <span className={styles.orderChevron}>{isExpanded ? "▲" : "▼"}</span>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className={styles.orderBody}>
                                                    {/* Progress */}
                                                    {!["cancelled"].includes(o.status) && (
                                                        <div className={styles.progress}>
                                                            {STATUS_STEPS.map((s, i) => (
                                                                <div key={s} className={`${styles.progressStep} ${i <= stepIdx ? styles.progressStepDone : ""}`}>
                                                                    <div className={styles.progressDot} />
                                                                    <div className={styles.progressLabel}>{STATUS_LABEL[s]}</div>
                                                                    {i < STATUS_STEPS.length - 1 && <div className={styles.progressLine} />}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Tracking */}
                                                    {o.trackingId && (
                                                        <div className={styles.trackingBox}>
                                                            <span>🚚 Tracking: <strong>{o.trackingId}</strong></span>
                                                            {o.shippingCarrier && <span className="caption"> via {o.shippingCarrier}</span>}
                                                        </div>
                                                    )}

                                                    {/* Items */}
                                                    <div className={styles.itemsTable}>
                                                        <table>
                                                            <thead><tr><th>Product</th><th>Qty (kg)</th><th>Rate / kg</th><th>Subtotal</th></tr></thead>
                                                            <tbody>
                                                                {o.items.map((item, i) => (
                                                                    <tr key={i}>
                                                                        <td>{item.product.varietyName}</td>
                                                                        <td>{item.quantity}</td>
                                                                        <td>₹{item.pricePerUnit.toLocaleString("en-IN")}</td>
                                                                        <td>₹{item.subtotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    <div className={styles.orderTotals}>
                                                        <div className={styles.totalRow}><span>Subtotal</span><span>{fmt(o.totalAmount)}</span></div>
                                                        <div className={styles.totalRow}><span>GST</span><span>{fmt(o.gstAmount)}</span></div>
                                                        <div className={`${styles.totalRow} ${styles.totalRowFinal}`}><span>Grand Total</span><span>{fmt(o.grandTotal)}</span></div>
                                                    </div>

                                                    {o.invoice && (
                                                        <a href={`/api/invoices/${o.invoice.id}`} target="_blank" className="btn btn-ghost btn-sm" style={{ marginTop: 8, display: "inline-flex" }}>
                                                            🧾 View Tax Invoice ↗
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
