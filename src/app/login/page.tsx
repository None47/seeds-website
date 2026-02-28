"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Login failed");
            localStorage.setItem("user_session", JSON.stringify(data.user));
            if (data.user.role === "admin") router.push("/admin");
            else if (data.user.kycStatus !== "approved") router.push("/pending-approval");
            else router.push("/dashboard");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <main className={styles.authPage}>
                <div className={styles.authCard}>
                    <div className={styles.authHeader}>
                        <div className={styles.authLogo}>🌱</div>
                        <h1 className={styles.authTitle}>Partner Login</h1>
                        <p className={styles.authSubtitle}>Sign in to your SeedsCo distributor account</p>
                    </div>
                    {error && <div className="alert alert-danger mb-2">{error}</div>}
                    <form onSubmit={handleSubmit} className={styles.authForm}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="your@company.com"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                            {loading ? <span className="spinner"></span> : "Sign In to Portal"}
                        </button>
                    </form>
                    <p className={styles.authFooter}>
                        New distributor?{" "}
                        <Link href="/register" className={styles.authLink}>Register here</Link>
                    </p>
                    <div className={styles.demoHint}>
                        <p>Demo credentials:</p>
                        <p>Admin: admin@seedsco.com / admin123</p>
                        <p>Buyer: buyer@test.com / buyer123</p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
