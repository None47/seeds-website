"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Stats {
    totalRevenue: number; totalOrders: number; pendingOrders: number;
    pendingKyc: number; totalProducts: number; lowStockProducts: number;
    ordersByState: { buyerState: string; _count: { id: number }; _sum: { grandTotal: number } }[];
}

interface Buyer {
    id: string; email: string; companyName: string; gstNumber: string; panNumber: string;
    state: string; district: string; pincode: string; phone: string; kycStatus: string;
    kycRejectionReason?: string; createdAt: string;
    creditLimit: number; usedCredit: number; creditEnabled: boolean;
}

interface Order {
    id: string; orderNumber: string; status: string; grandTotal: number; createdAt: string;
    buyerState: string; trackingId?: string; shippingCarrier?: string; shippingDetails?: string; emailSent: boolean;
    buyer: { companyName: string; email: string };
    items: { product: { varietyName: string; cropName: string }; quantity: number; subtotal: number }[];
    invoice?: { id: string; invoiceNumber: string };
}

interface Product {
    id: string; cropName: string; varietyName: string; category: string;
    stockQuantity: number; moq: number; isActive: boolean; batchId?: string;
    manufacturingDate?: string; expiryDate?: string; lotNumber: string;
}

type Tab = "overview" | "kyc" | "orders" | "products" | "inventory" | "credit" | "batches";

const STATUS_BADGE: Record<string, string> = {
    pending: "badge-yellow", approved: "badge-green", packed: "badge-blue",
    shipped: "badge-blue", delivered: "badge-green", cancelled: "badge-red", rejected: "badge-red",
};

const TABS: { key: Tab; icon: string; label: string; countKey?: keyof Stats }[] = [
    { key: "overview", icon: "◈", label: "Overview" },
    { key: "kyc", icon: "✦", label: "KYC", countKey: "pendingKyc" },
    { key: "orders", icon: "◎", label: "Orders", countKey: "pendingOrders" },
    { key: "products", icon: "◈", label: "Products" },
    { key: "inventory", icon: "⊟", label: "Inventory", countKey: "lowStockProducts" },
    { key: "batches", icon: "⊞", label: "Batches" },
    { key: "credit", icon: "◈", label: "Credit" },
];

export default function AdminDashboard() {
    const router = useRouter();
    const [tab, setTab] = useState<Tab>("overview");
    const [stats, setStats] = useState<Stats | null>(null);
    const [buyers, setBuyers] = useState<Buyer[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ msg: string; type?: "success" | "error" } | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [trackingModal, setTrackingModal] = useState<Order | null>(null);
    const [creditModal, setCreditModal] = useState<Buyer | null>(null);
    const [kycFilter, setKycFilter] = useState("all");

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const loadAll = useCallback(async () => {
        setLoading(true);
        const [s, b, o, p] = await Promise.all([
            fetch("/api/admin/stats").then(r => r.json()),
            fetch("/api/admin/buyers").then(r => r.json()),
            fetch("/api/orders").then(r => r.json()),
            fetch("/api/products").then(r => r.json()),
        ]);
        setStats(s);
        setBuyers(Array.isArray(b) ? b : []);
        setOrders(Array.isArray(o) ? o : []);
        setProducts(Array.isArray(p) ? p : []);
        setLoading(false);
    }, []);

    useEffect(() => {
        const s = localStorage.getItem("user_session");
        if (!s) { router.push("/login"); return; }
        const u = JSON.parse(s);
        if (u.role !== "admin") { router.push("/dashboard"); return; }
        loadAll();
    }, [loadAll, router]);

    const updateKyc = async (buyerId: string, kycStatus: string, reason?: string) => {
        const r = await fetch("/api/admin/buyers", {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ buyerId, kycStatus, kycRejectionReason: reason }),
        });
        if (r.ok) { showToast(`KYC ${kycStatus}`); setBuyers(prev => prev.map(b => b.id === buyerId ? { ...b, kycStatus } : b)); }
        else showToast("Failed to update KYC", "error");
    };

    const updateOrder = async (orderId: string, data: Record<string, string>) => {
        const r = await fetch(`/api/orders/${orderId}`, {
            method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
        });
        if (r.ok) { showToast("Order updated"); setTrackingModal(null); loadAll(); }
        else showToast("Update failed", "error");
    };

    const fmt = (v: number) => `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
    const fmtD = (s: string) => new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

    const filteredBuyers = buyers.filter(b => kycFilter === "all" || b.kycStatus === kycFilter);

    if (loading) return (
        <div className={styles.loading}>
            <div className={`spinner ${styles.spin}`} />
            <p>Loading dashboard…</p>
        </div>
    );

    return (
        <div className={styles.layout}>
            {/* ── Sidebar ─────────────────────────────────────────── */}
            <aside className={styles.sidebar}>
                <div className={styles.sbHeader}>
                    <Link href="/" className={styles.sbLogo}><span>🌱</span> SeedsCo</Link>
                </div>
                <nav className={styles.sbNav}>
                    {TABS.map(t => {
                        const count = t.countKey && stats ? (stats[t.countKey] as number) : null;
                        return (
                            <button key={t.key} className={`${styles.sbItem} ${tab === t.key ? styles.sbItemActive : ""}`} onClick={() => setTab(t.key)}>
                                <span className={styles.sbIcon}>{t.icon}</span>
                                <span>{t.label}</span>
                                {count !== null && count > 0 && <span className={styles.sbBadge}>{count}</span>}
                            </button>
                        );
                    })}
                </nav>
                <div className={styles.sbFooter}>
                    <button className={styles.sbItem} onClick={async () => {
                        await fetch("/api/auth/logout", { method: "POST" });
                        localStorage.removeItem("user_session");
                        router.push("/");
                    }}>
                        <span className={styles.sbIcon}>→</span> Sign out
                    </button>
                </div>
            </aside>

            {/* ── Main ────────────────────────────────────────────── */}
            <div className={styles.main}>
                {/* Toast */}
                {toast && (
                    <div className={`${styles.toast} ${toast.type === "error" ? styles.toastError : ""}`}>
                        {toast.msg}
                    </div>
                )}

                {/* ── OVERVIEW ──────────────────────────────────────── */}
                {tab === "overview" && stats && (
                    <div className={styles.page}>
                        <div className={styles.pageHeader}>
                            <h1 className={styles.pageTitle}>Overview</h1>
                            <div className="caption">{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
                        </div>

                        <div className={styles.statGrid}>
                            {[
                                { label: "Total Revenue", value: fmt(stats.totalRevenue), icon: "₹", sub: "From approved orders" },
                                { label: "Total Orders", value: stats.totalOrders, icon: "◎", sub: `${stats.pendingOrders} pending` },
                                { label: "KYC Pending", value: stats.pendingKyc, icon: "✦", sub: "Awaiting review" },
                                { label: "Active Products", value: stats.totalProducts, icon: "◈", sub: `${stats.lowStockProducts} low stock` },
                            ].map(s => (
                                <div key={s.label} className={styles.statCard}>
                                    <div className={styles.statIcon}>{s.icon}</div>
                                    <div className={styles.statVal}>{s.value}</div>
                                    <div className={styles.statLabel}>{s.label}</div>
                                    <div className={styles.statSub}>{s.sub}</div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.sectionTitle}>State Analytics</div>
                        <div className={styles.tableWrap}>
                            <table>
                                <thead><tr><th>State</th><th>Orders</th><th>Revenue</th></tr></thead>
                                <tbody>
                                    {stats.ordersByState.map(s => (
                                        <tr key={s.buyerState}>
                                            <td><strong>{s.buyerState || "—"}</strong></td>
                                            <td>{s._count.id}</td>
                                            <td>{fmt(s._sum.grandTotal || 0)}</td>
                                        </tr>
                                    ))}
                                    {!stats.ordersByState.length && <tr><td colSpan={3} className={styles.empty}>No orders yet</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── KYC ───────────────────────────────────────────── */}
                {tab === "kyc" && (
                    <div className={styles.page}>
                        <div className={styles.pageHeader}>
                            <h1 className={styles.pageTitle}>KYC Approvals</h1>
                            <div className={styles.filterRow}>
                                {["all", "pending", "approved", "rejected"].map(f => (
                                    <button key={f} className={`${styles.filterBtn} ${kycFilter === f ? styles.filterBtnActive : ""}`} onClick={() => setKycFilter(f)}>
                                        {f.charAt(0).toUpperCase() + f.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className={styles.kycGrid}>
                            {filteredBuyers.map(b => (
                                <div key={b.id} className={styles.kycCard}>
                                    <div className={styles.kycCardHeader}>
                                        <div>
                                            <div className={styles.kycName}>{b.companyName}</div>
                                            <div className={styles.kycEmail}>{b.email}</div>
                                        </div>
                                        <span className={`badge ${STATUS_BADGE[b.kycStatus] || "badge-gray"}`}>{b.kycStatus}</span>
                                    </div>
                                    <div className={styles.kycFields}>
                                        {[["GST", b.gstNumber], ["PAN", b.panNumber], ["State", b.state], ["District", b.district], ["Phone", b.phone], ["Applied", fmtD(b.createdAt)]].map(([l, v]) => (
                                            <div key={l as string} className={styles.kycField}>
                                                <span className={styles.kycFieldLabel}>{l}</span>
                                                <span className={styles.kycFieldValue}>{v || "—"}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {b.kycStatus === "pending" && (
                                        <div className={styles.kycActions}>
                                            <button className="btn btn-primary btn-sm" onClick={() => updateKyc(b.id, "approved")}>Approve</button>
                                            <button className="btn btn-ghost btn-sm" style={{ color: "var(--danger)" }} onClick={() => {
                                                const r = prompt("Rejection reason (shown to buyer):");
                                                if (r !== null) updateKyc(b.id, "rejected", r);
                                            }}>Reject</button>
                                        </div>
                                    )}
                                    {b.kycStatus === "rejected" && b.kycRejectionReason && (
                                        <div style={{ fontSize: "0.8125rem", color: "var(--danger)", marginTop: "8px" }}>Reason: {b.kycRejectionReason}</div>
                                    )}
                                </div>
                            ))}
                            {!filteredBuyers.length && <div className={styles.empty} style={{ padding: "3rem" }}>No buyers with this status</div>}
                        </div>
                    </div>
                )}

                {/* ── ORDERS ────────────────────────────────────────── */}
                {tab === "orders" && (
                    <div className={styles.page}>
                        <div className={styles.pageHeader}>
                            <h1 className={styles.pageTitle}>Orders</h1>
                        </div>
                        <div className={styles.tableWrap}>
                            <table>
                                <thead><tr><th>Order #</th><th>Buyer</th><th>State</th><th>Total</th><th>Status</th><th>Invoice</th><th>Date</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {orders.map(o => (
                                        <tr key={o.id}>
                                            <td><span className={styles.mono}>{o.orderNumber}</span></td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{o.buyer.companyName}</div>
                                                <div className="caption">{o.buyer.email}</div>
                                            </td>
                                            <td>{o.buyerState}</td>
                                            <td><strong>{fmt(o.grandTotal)}</strong></td>
                                            <td>
                                                <select
                                                    className={styles.statusSelect}
                                                    value={o.status}
                                                    onChange={e => {
                                                        if (e.target.value === "shipped" || o.status === "pending")
                                                            setTrackingModal({ ...o, status: e.target.value } as Order);
                                                        else updateOrder(o.id, { status: e.target.value });
                                                    }}
                                                >
                                                    {["pending", "approved", "packed", "shipped", "delivered", "cancelled"].map(s => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                {o.invoice
                                                    ? <a href={`/api/invoices/${o.invoice.id}`} target="_blank" className="btn btn-ghost btn-sm">PDF ↗</a>
                                                    : <span className="caption">—</span>}
                                            </td>
                                            <td className="caption">{fmtD(o.createdAt)}</td>
                                            <td>
                                                <button className="btn btn-ghost btn-sm" onClick={() => setTrackingModal(o)}>
                                                    {o.trackingId ? "✏️ Track" : "+ Track"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {!orders.length && <tr><td colSpan={8} className={styles.empty}>No orders</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── PRODUCTS ──────────────────────────────────────── */}
                {tab === "products" && (
                    <div className={styles.page}>
                        <div className={styles.pageHeader}>
                            <h1 className={styles.pageTitle}>Products</h1>
                            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Add Product</button>
                        </div>
                        <div className={styles.tableWrap}>
                            <table>
                                <thead><tr><th>Variety</th><th>Category</th><th>Stock</th><th>MOQ</th><th>Lot #</th><th>Status</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p.id}>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{p.varietyName}</div>
                                                <div className="caption">{p.cropName}</div>
                                            </td>
                                            <td><span className="badge badge-olive">{p.category}</span></td>
                                            <td>
                                                <span style={{ color: p.stockQuantity < 100 ? "var(--danger)" : "var(--success)", fontWeight: 600 }}>
                                                    {p.stockQuantity} kg {p.stockQuantity < 100 && "⚠️"}
                                                </span>
                                            </td>
                                            <td>{p.moq} kg</td>
                                            <td><span className={styles.mono}>{p.lotNumber}</span></td>
                                            <td><span className={`badge ${p.isActive ? "badge-green" : "badge-red"}`}>{p.isActive ? "Active" : "Inactive"}</span></td>
                                            <td>
                                                <button className="btn btn-ghost btn-sm" style={{ color: "var(--danger)" }} onClick={async () => {
                                                    if (!confirm("Deactivate product?")) return;
                                                    await fetch(`/api/products/${p.id}`, { method: "DELETE" });
                                                    showToast("Product deactivated");
                                                    loadAll();
                                                }}>Remove</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── INVENTORY ─────────────────────────────────────── */}
                {tab === "inventory" && (
                    <div className={styles.page}>
                        <div className={styles.pageHeader}>
                            <h1 className={styles.pageTitle}>Inventory</h1>
                            {stats && stats.lowStockProducts > 0 && (
                                <div className="badge badge-yellow">⚠️ {stats.lowStockProducts} low stock</div>
                            )}
                        </div>
                        <div className={styles.invGrid}>
                            {products.map(p => (
                                <div key={p.id} className={`${styles.invCard} ${p.stockQuantity < 100 ? styles.invCardLow : ""}`}>
                                    <div className={styles.invTop}>
                                        <div>
                                            <div className={styles.invName}>{p.varietyName}</div>
                                            <div className="caption">{p.cropName} · {p.category}</div>
                                        </div>
                                        {p.stockQuantity < 100 && <span className="badge badge-red">Low Stock</span>}
                                    </div>
                                    <div className={styles.invBar}>
                                        <div className={styles.invFill} style={{ width: `${Math.min(100, p.stockQuantity / 10)}%`, background: p.stockQuantity < 100 ? "var(--danger)" : "var(--primary)" }} />
                                    </div>
                                    <div className={styles.invBottom}>
                                        <span><strong>{p.stockQuantity}</strong> kg</span>
                                        <button className="btn btn-ghost btn-sm" onClick={async () => {
                                            const qty = prompt(`Update stock for ${p.varietyName} (current: ${p.stockQuantity} kg):`);
                                            if (!qty) return;
                                            await fetch(`/api/products/${p.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stockQuantity: parseInt(qty) }) });
                                            showToast("Stock updated");
                                            loadAll();
                                        }}>Update</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── BATCHES ───────────────────────────────────────── */}
                {tab === "batches" && (
                    <div className={styles.page}>
                        <div className={styles.pageHeader}>
                            <h1 className={styles.pageTitle}>Batch Tracking</h1>
                        </div>
                        <div className={styles.tableWrap}>
                            <table>
                                <thead><tr><th>Variety</th><th>Lot #</th><th>Batch ID</th><th>Mfg Date</th><th>Expiry</th><th>Stock</th></tr></thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p.id}>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{p.varietyName}</div>
                                                <span className="badge badge-olive" style={{ marginTop: 4 }}>{p.category}</span>
                                            </td>
                                            <td><span className={styles.mono}>{p.lotNumber}</span></td>
                                            <td><span className={styles.mono}>{p.batchId || "—"}</span></td>
                                            <td className="caption">{p.manufacturingDate || "—"}</td>
                                            <td className="caption" style={{ color: p.expiryDate ? "var(--warning)" : undefined }}>{p.expiryDate || "—"}</td>
                                            <td><strong>{p.stockQuantity}</strong> kg</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── CREDIT ────────────────────────────────────────── */}
                {tab === "credit" && (
                    <div className={styles.page}>
                        <div className={styles.pageHeader}>
                            <h1 className={styles.pageTitle}>Credit Management</h1>
                        </div>
                        <div className={styles.tableWrap}>
                            <table>
                                <thead><tr><th>Buyer</th><th>State</th><th>Credit Limit</th><th>Used</th><th>Available</th><th>Credit Active</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {buyers.filter(b => b.kycStatus === "approved").map(b => {
                                        const avail = b.creditLimit - b.usedCredit;
                                        return (
                                            <tr key={b.id}>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{b.companyName}</div>
                                                    <div className="caption">{b.email}</div>
                                                </td>
                                                <td>{b.state}</td>
                                                <td>{fmt(b.creditLimit)}</td>
                                                <td style={{ color: b.usedCredit > b.creditLimit * 0.8 ? "var(--danger)" : undefined }}>{fmt(b.usedCredit)}</td>
                                                <td style={{ color: avail < 0 ? "var(--danger)" : "var(--success)", fontWeight: 600 }}>{fmt(avail)}</td>
                                                <td>
                                                    <span className={`badge ${b.creditEnabled ? "badge-green" : "badge-gray"}`}>
                                                        {b.creditEnabled ? "Active" : "Off"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="btn btn-ghost btn-sm" onClick={() => setCreditModal(b)}>Manage</button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Tracking Modal ────────────────────────────────── */}
            {trackingModal && <TrackingModal order={trackingModal} onClose={() => setTrackingModal(null)} onSave={(data) => updateOrder(trackingModal.id, data)} />}

            {/* ── Credit Modal ──────────────────────────────────── */}
            {creditModal && <CreditModal buyer={creditModal} onClose={() => { setCreditModal(null); loadAll(); }} showToast={showToast} />}

            {/* ── Add Product Modal ─────────────────────────────── */}
            {showModal && <ProductModal onClose={() => { setShowModal(false); loadAll(); }} showToast={showToast} />}
        </div>
    );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function TrackingModal({ order, onClose, onSave }: { order: Order; onClose: () => void; onSave: (d: Record<string, string>) => void }) {
    const [status, setStatus] = useState(order.status);
    const [trackingId, setTrackingId] = useState(order.trackingId || "");
    const [carrier, setCarrier] = useState(order.shippingCarrier || "");
    const [details, setDetails] = useState(order.shippingDetails || "");

    return (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div className={styles.modal}>
                <div className={styles.modalHead}><h2>Update Order: {order.orderNumber}</h2><button onClick={onClose}>✕</button></div>
                <div className={styles.modalBody}>
                    <div className="form-group"><label className="form-label">Status</label>
                        <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                            {["pending", "approved", "packed", "shipped", "delivered", "cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="form-group"><label className="form-label">Tracking ID</label>
                        <input className="form-input" value={trackingId} onChange={e => setTrackingId(e.target.value)} placeholder="e.g. DELHIVERY123456" />
                    </div>
                    <div className="form-group"><label className="form-label">Shipping Carrier</label>
                        <input className="form-input" value={carrier} onChange={e => setCarrier(e.target.value)} placeholder="e.g. Delhivery, Blue Dart" />
                    </div>
                    <div className="form-group"><label className="form-label">Shipping Notes</label>
                        <textarea className="form-textarea" value={details} onChange={e => setDetails(e.target.value)} rows={2} />
                    </div>
                </div>
                <div className={styles.modalFoot}>
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={() => onSave({ status, trackingId, shippingCarrier: carrier, shippingDetails: details })}>
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

function CreditModal({ buyer, onClose, showToast }: { buyer: Buyer; onClose: () => void; showToast: (m: string, t?: "success" | "error") => void }) {
    const [limit, setLimit] = useState(buyer.creditLimit);
    const [enabled, setEnabled] = useState(buyer.creditEnabled);
    const [payAmt, setPayAmt] = useState("");
    const [loading, setLoading] = useState(false);

    const saveLimit = async () => {
        setLoading(true);
        const r = await fetch("/api/admin/credit", {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ buyerId: buyer.id, creditLimit: limit, creditEnabled: enabled }),
        });
        setLoading(false);
        if (r.ok) { showToast("Credit updated"); onClose(); }
        else showToast("Failed", "error");
    };

    const recordPayment = async () => {
        if (!payAmt || isNaN(Number(payAmt))) return;
        setLoading(true);
        const r = await fetch("/api/admin/credit", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ buyerId: buyer.id, amount: Number(payAmt), type: "credit", description: "Payment received" }),
        });
        setLoading(false);
        if (r.ok) { showToast("Payment recorded"); setPayAmt(""); onClose(); }
        else showToast("Failed", "error");
    };

    return (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div className={styles.modal}>
                <div className={styles.modalHead}><h2>Credit: {buyer.companyName}</h2><button onClick={onClose}>✕</button></div>
                <div className={styles.modalBody}>
                    <div className={styles.creditSummary}>
                        {[["Limit", `₹${buyer.creditLimit.toLocaleString("en-IN")}`], ["Used", `₹${buyer.usedCredit.toLocaleString("en-IN")}`], ["Available", `₹${(buyer.creditLimit - buyer.usedCredit).toLocaleString("en-IN")}`]].map(([l, v]) => (
                            <div key={l} className={styles.creditStat}><div className={styles.creditStatVal}>{v}</div><div className="caption">{l}</div></div>
                        ))}
                    </div>
                    <div className="form-group">
                        <label className="form-label">Credit Limit (₹)</label>
                        <input className="form-input" type="number" value={limit} onChange={e => setLimit(Number(e.target.value))} />
                    </div>
                    <div className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                        <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} id="creditEnable" />
                        <label htmlFor="creditEnable" className="form-label" style={{ margin: 0 }}>Enable Credit for this buyer</label>
                    </div>
                    <div className="divider" />
                    <div className="form-group">
                        <label className="form-label">Record Payment Received (₹)</label>
                        <div className="flex gap-2">
                            <input className="form-input flex-1" type="number" value={payAmt} onChange={e => setPayAmt(e.target.value)} placeholder="Amount" />
                            <button className="btn btn-secondary" onClick={recordPayment} disabled={loading}>Record</button>
                        </div>
                    </div>
                </div>
                <div className={styles.modalFoot}>
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={saveLimit} disabled={loading}>
                        {loading ? <span className="spinner" /> : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ProductModal({ onClose, showToast }: { onClose: () => void; showToast: (m: string, t?: "success" | "error") => void }) {
    const [form, setForm] = useState({
        cropName: "", varietyName: "", category: "Wheat", germinationPct: 92, purityPct: 98,
        lotNumber: "", batchId: "", manufacturingDate: "", expiryDate: "",
        dateOfTesting: "", yieldPerAcre: "", suitableSeason: "Rabi", suitableRegions: "",
        hsnCode: "1001", gstRate: 0, moq: 100, stockQuantity: 1000, description: "",
        tierPricing: '[{"minQty":100,"maxQty":499,"pricePerUnit":85},{"minQty":500,"pricePerUnit":75}]',
    });
    const [loading, setLoading] = useState(false);
    const set = (k: string, v: string | number) => setForm(prev => ({ ...prev, [k]: v }));

    const save = async () => {
        setLoading(true);
        const r = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        setLoading(false);
        if (r.ok) { showToast("Product added"); onClose(); }
        else { const d = await r.json(); showToast(d.error || "Failed", "error"); }
    };

    return (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div className={styles.modal} style={{ maxWidth: 680 }}>
                <div className={styles.modalHead}><h2>Add Product</h2><button onClick={onClose}>✕</button></div>
                <div className={styles.modalBody}>
                    <div className={styles.modalGrid}>
                        <div className="form-group"><label className="form-label">Crop Name</label><input className="form-input" value={form.cropName} onChange={e => set("cropName", e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Variety Name</label><input className="form-input" value={form.varietyName} onChange={e => set("varietyName", e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Category</label>
                            <select className="form-select" value={form.category} onChange={e => set("category", e.target.value)}>
                                {["Wheat", "Rice", "Vegetable", "Hybrid", "Cotton", "Pulses"].map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group"><label className="form-label">Season</label>
                            <select className="form-select" value={form.suitableSeason} onChange={e => set("suitableSeason", e.target.value)}>
                                {["Rabi", "Kharif", "Zaid", "All season"].map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="form-group"><label className="form-label">Lot Number</label><input className="form-input" value={form.lotNumber} onChange={e => set("lotNumber", e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Batch ID</label><input className="form-input" value={form.batchId} onChange={e => set("batchId", e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Manufacturing Date</label><input className="form-input" value={form.manufacturingDate} onChange={e => set("manufacturingDate", e.target.value)} placeholder="e.g. Oct 2024" /></div>
                        <div className="form-group"><label className="form-label">Expiry Date</label><input className="form-input" value={form.expiryDate} onChange={e => set("expiryDate", e.target.value)} placeholder="e.g. Sep 2025" /></div>
                        <div className="form-group"><label className="form-label">Germination %</label><input className="form-input" type="number" value={form.germinationPct} onChange={e => set("germinationPct", Number(e.target.value))} /></div>
                        <div className="form-group"><label className="form-label">Purity %</label><input className="form-input" type="number" value={form.purityPct} onChange={e => set("purityPct", Number(e.target.value))} /></div>
                        <div className="form-group"><label className="form-label">GST Rate %</label><input className="form-input" type="number" value={form.gstRate} onChange={e => set("gstRate", Number(e.target.value))} /></div>
                        <div className="form-group"><label className="form-label">MOQ (kg)</label><input className="form-input" type="number" value={form.moq} onChange={e => set("moq", Number(e.target.value))} /></div>
                        <div className="form-group"><label className="form-label">Stock (kg)</label><input className="form-input" type="number" value={form.stockQuantity} onChange={e => set("stockQuantity", Number(e.target.value))} /></div>
                        <div className="form-group"><label className="form-label">HSN Code</label><input className="form-input" value={form.hsnCode} onChange={e => set("hsnCode", e.target.value)} /></div>
                        <div className="form-group" style={{ gridColumn: "span 2" }}><label className="form-label">Suitable Regions</label><input className="form-input" value={form.suitableRegions} onChange={e => set("suitableRegions", e.target.value)} placeholder="Punjab, Haryana, North India" /></div>
                        <div className="form-group" style={{ gridColumn: "span 2" }}><label className="form-label">Tier Pricing (JSON Array)</label><textarea className="form-textarea" rows={2} value={form.tierPricing} onChange={e => set("tierPricing", e.target.value)} /></div>
                        <div className="form-group" style={{ gridColumn: "span 2" }}><label className="form-label">Description</label><textarea className="form-textarea" rows={2} value={form.description} onChange={e => set("description", e.target.value)} /></div>
                    </div>
                </div>
                <div className={styles.modalFoot}>
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={save} disabled={loading}>{loading ? <span className="spinner" /> : "Add Product"}</button>
                </div>
            </div>
        </div>
    );
}
