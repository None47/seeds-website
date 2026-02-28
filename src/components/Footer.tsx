"use client";
import Link from "next/link";
import styles from "./Footer.module.css";

const CATEGORIES = [
    "Wheat Seeds", "Rice Seeds", "Vegetable Seeds",
    "Hybrid Seeds", "Cotton Seeds", "Pulse Seeds",
];

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.grid}>
                    {/* Brand */}
                    <div className={styles.brand}>
                        <div className={styles.logoWrap}>
                            <img
                                src="/logo.png"
                                alt="Tanindo Seeds Pvt Ltd"
                                className={styles.logoImg}
                                onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    (e.currentTarget.nextElementSibling as HTMLElement).style.display = "flex";
                                }}
                            />
                            <span className={styles.logoFallback}>
                                🌱 <span className={styles.logoText}>Tanindo Seeds <em>Pvt Ltd</em></span>
                            </span>
                        </div>
                        <p className={styles.tagline}>
                            Trustful partner for Growth.
                        </p>
                        <p className={styles.desc}>
                            India's premium B2B seed distribution platform. Connecting certified
                            hybrid seed varieties with GST-verified distributors and retailers nationwide.
                        </p>
                        <div className={styles.badges}>
                            <span className={styles.badge}>🏆 ICAR Certified</span>
                            <span className={styles.badge}>🔒 GST Compliant</span>
                            <span className={styles.badge}>🌾 Lab Tested</span>
                        </div>
                    </div>

                    {/* Catalogue */}
                    <div>
                        <div className={styles.colTitle}>Catalogue</div>
                        <div className={styles.colLinks}>
                            {CATEGORIES.map(c => (
                                <Link key={c} href="/products" className={styles.colLink}>{c}</Link>
                            ))}
                        </div>
                    </div>

                    {/* Platform */}
                    <div>
                        <div className={styles.colTitle}>Platform</div>
                        <div className={styles.colLinks}>
                            <Link href="/register" className={styles.colLink}>Register as Distributor</Link>
                            <Link href="/login" className={styles.colLink}>Partner Login</Link>
                            <Link href="/dashboard" className={styles.colLink}>My Orders</Link>
                            <Link href="/ai-recommend" className={styles.colLink}>AI Seed Advisor</Link>
                            <Link href="/pending-approval" className={styles.colLink}>KYC Status</Link>
                        </div>
                    </div>

                    {/* Legal & Contact */}
                    <div>
                        <div className={styles.colTitle}>Legal</div>
                        <div className={styles.colLinks}>
                            <Link href="/privacy-policy" className={styles.colLink}>Privacy Policy</Link>
                            <Link href="/terms" className={styles.colLink}>Terms & Conditions</Link>
                            <Link href="/refund-policy" className={styles.colLink}>Refund Policy</Link>
                        </div>
                        <div className={styles.colTitle} style={{ marginTop: "24px" }}>Contact</div>
                        <div className={styles.colLinks}>
                            <a href="mailto:b2b@tanindoseeds.com" className={styles.colLink}>b2b@tanindoseeds.com</a>
                            <a href="tel:+919876543210" className={styles.colLink}>+91 98765 43210</a>
                            <p className={styles.colLink} style={{ cursor: "default" }}>Mon–Sat · 9 AM – 6 PM IST</p>
                        </div>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p className={styles.copyright}>
                        © {new Date().getFullYear()} Tanindo Seeds Pvt Ltd · GSTIN: {process.env.NEXT_PUBLIC_SELLER_GSTIN || "29AABCU9603R1ZX"} · Trustful partner for Growth
                    </p>
                    <div className={styles.bottomLinks}>
                        <Link href="/privacy-policy">Privacy</Link>
                        <Link href="/terms">Terms</Link>
                        <Link href="/refund-policy">Refunds</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
