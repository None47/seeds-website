"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForbiddenPage() {
    const router = useRouter();

    return (
        <div style={{
            minHeight: "100vh",
            background: "var(--surface-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font)",
            padding: "2rem",
        }}>
            <div style={{
                background: "var(--cream)",
                border: "1.5px solid var(--border)",
                borderRadius: "var(--radius-xl)",
                boxShadow: "var(--shadow-xl)",
                padding: "3rem 2.5rem",
                maxWidth: 480,
                width: "100%",
                textAlign: "center",
            }}>
                <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🚫</div>
                <div style={{
                    display: "inline-block",
                    background: "rgba(220, 38, 38, 0.08)",
                    color: "var(--danger)",
                    borderRadius: "999px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    padding: "0.3rem 1rem",
                    textTransform: "uppercase",
                    marginBottom: "1.25rem",
                }}>403 — Access Denied</div>

                <h1 style={{
                    fontSize: "1.75rem",
                    fontWeight: 800,
                    color: "var(--text)",
                    letterSpacing: "-0.025em",
                    marginBottom: "0.75rem",
                }}>Admin Access Required</h1>

                <p style={{
                    color: "var(--text-muted)",
                    fontSize: "0.95rem",
                    lineHeight: 1.7,
                    marginBottom: "2rem",
                }}>
                    You don&apos;t have permission to view this page.
                    This area is restricted to <strong>verified administrators</strong> only.
                </p>

                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
                    <button
                        onClick={() => router.back()}
                        className="btn btn-ghost"
                    >
                        ← Go Back
                    </button>
                    <Link href="/dashboard" className="btn btn-outline">
                        My Dashboard
                    </Link>
                    <Link href="/" className="btn btn-primary">
                        Home
                    </Link>
                </div>

                <p style={{
                    marginTop: "2rem",
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                }}>
                    If you believe this is a mistake, contact{" "}
                    <a href="mailto:b2b@tanindoseeds.com" style={{ color: "var(--primary)" }}>
                        b2b@tanindoseeds.com
                    </a>
                </p>
            </div>
        </div>
    );
}
