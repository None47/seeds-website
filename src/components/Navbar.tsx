"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import styles from "./Navbar.module.css";

interface UserSession {
    email: string; role: string; companyName?: string;
}

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<UserSession | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropOpen, setDropOpen] = useState(false);
    const dropRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const s = localStorage.getItem("user_session");
        if (s) setUser(JSON.parse(s));
    }, [pathname]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 12);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropRef.current && !dropRef.current.contains(e.target as Node))
                setDropOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const logout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        localStorage.removeItem("user_session");
        setUser(null);
        router.push("/");
    };

    const initials = user?.companyName?.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || "U";

    return (
        <header className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ""}`}>
            <div className="container">
                <div className={styles.inner}>
                    {/* Logo */}
                    <Link href="/" className={styles.logo}>
                        <img
                            src="/logo.png"
                            alt="Tanindo Seeds Pvt Ltd"
                            className={styles.logoImg}
                            onError={(e) => {
                                // Fallback to text if logo not found
                                e.currentTarget.style.display = "none";
                                (e.currentTarget.nextElementSibling as HTMLElement).style.display = "flex";
                            }}
                        />
                        <span className={styles.logoFallback}>
                            <span className={styles.logoEmoji}>🌱</span>
                            <span className={styles.logoTextWrap}>
                                <span className={styles.logoName}>Tanindo Seeds</span>
                                <span className={styles.logoSub}>Pvt Ltd</span>
                            </span>
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className={styles.nav}>
                        <Link href="/products" className={styles.navLink}>Catalogue</Link>
                        <Link href="/ai-recommend" className={styles.navLink}>AI Advisor</Link>
                        {user?.role === "admin" && (
                            <Link href="/admin" className={styles.navLink}>Dashboard</Link>
                        )}
                    </nav>

                    {/* Actions */}
                    <div className={styles.actions}>
                        {user ? (
                            <div className={styles.profile} ref={dropRef}>
                                <button
                                    className={styles.avatar}
                                    onClick={() => setDropOpen(p => !p)}
                                    aria-label="Profile menu"
                                >
                                    {initials}
                                </button>
                                {dropOpen && (
                                    <div className={styles.dropdown}>
                                        <div className={styles.dropHeader}>
                                            <div className={styles.dropName}>{user.companyName || user.email}</div>
                                            <div className={styles.dropRole}>{user.role === "admin" ? "Administrator" : "Distributor"}</div>
                                        </div>
                                        <div className={styles.dropDivider} />
                                        <Link href={user.role === "admin" ? "/admin" : "/dashboard"} className={styles.dropItem} onClick={() => setDropOpen(false)}>
                                            {user.role === "admin" ? "Admin Dashboard" : "My Orders"}
                                        </Link>
                                        {user.role !== "admin" && (
                                            <Link href="/products" className={styles.dropItem} onClick={() => setDropOpen(false)}>Browse Catalogue</Link>
                                        )}
                                        <div className={styles.dropDivider} />
                                        <button className={`${styles.dropItem} ${styles.dropLogout}`} onClick={logout}>
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className={styles.authLinks}>
                                <Link href="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                                <Link href="/register" className="btn btn-primary btn-sm">Register</Link>
                            </div>
                        )}

                        {/* Hamburger */}
                        <button
                            className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ""}`}
                            onClick={() => setMenuOpen(p => !p)}
                            aria-label="Toggle menu"
                        >
                            <span /><span /><span />
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {menuOpen && (
                    <div className={styles.mobileMenu}>
                        <Link href="/products" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Catalogue</Link>
                        <Link href="/ai-recommend" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>AI Seed Advisor</Link>
                        {user?.role === "admin" && (
                            <Link href="/admin" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>
                        )}
                        {user?.role === "buyer" && (
                            <Link href="/dashboard" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>My Orders</Link>
                        )}
                        <div className={styles.mobileDivider} />
                        {user ? (
                            <button className={styles.mobileLink} onClick={logout}>Sign Out</button>
                        ) : (
                            <>
                                <Link href="/login" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Sign In</Link>
                                <Link href="/register" className={`${styles.mobileLink} ${styles.mobileCta}`} onClick={() => setMenuOpen(false)}>Register as Distributor</Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
