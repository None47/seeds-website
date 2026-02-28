"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra & Nagar Haveli", "Daman & Diu",
    "Delhi", "Jammu & Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const steps = [
    { title: "Business Info", icon: "🏢", desc: "Company & tax details" },
    { title: "Location", icon: "📍", desc: "Address & region" },
    { title: "Documents", icon: "📄", desc: "Upload GST certificate" },
];

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        email: "", password: "", confirmPassword: "",
        companyName: "", gstNumber: "", panNumber: "",
        state: "", district: "", pincode: "", address: "",
        gstCertificate: "",
    });

    const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

    const validateStep1 = () => {
        if (!form.email || !form.password || !form.confirmPassword || !form.companyName || !form.gstNumber || !form.panNumber)
            return "All fields are required";
        if (form.password !== form.confirmPassword) return "Passwords do not match";
        if (form.password.length < 8) return "Password must be at least 8 characters";
        if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(form.gstNumber))
            return "Invalid GST number format (e.g. 29AABCU9603R1ZX)";
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber))
            return "Invalid PAN format (e.g. AABCU9603R)";
        return "";
    };

    const validateStep2 = () => {
        if (!form.state || !form.district || !form.pincode || !form.address)
            return "All location fields are required";
        if (!/^\d{6}$/.test(form.pincode)) return "Pincode must be 6 digits";
        return "";
    };

    const handleNext = () => {
        setError("");
        let err = "";
        if (step === 1) err = validateStep1();
        if (step === 2) err = validateStep2();
        if (err) { setError(err); return; }
        setStep(s => s + 1);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { setError("File size must be less than 5 MB"); return; }
        const reader = new FileReader();
        reader.onloadend = () => set("gstCertificate", reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (!form.gstCertificate) { setError("Please upload your GST certificate"); return; }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Registration failed");
            router.push("/pending-approval");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <main className={styles.registerPage}>
                <div className={styles.registerCard}>
                    <div className={styles.registerHeader}>
                        <div className={styles.logo}>🌱</div>
                        <h1 className={styles.title}>Become a Distributor</h1>
                        <p className={styles.subtitle}>Complete eKYC verification to start ordering</p>
                    </div>

                    {/* Step Indicators */}
                    <div className={styles.stepIndicators}>
                        {steps.map((s, i) => (
                            <div key={s.title} className={styles.stepIndicatorGroup}>
                                <div className={`${styles.stepCircle} ${step > i + 1 ? styles.stepDone : step === i + 1 ? styles.stepActive : ""}`}>
                                    {step > i + 1 ? "✓" : s.icon}
                                </div>
                                <div className={styles.stepLabel}>
                                    <div className={styles.stepNum}>Step {i + 1}</div>
                                    <div className={styles.stepTitle}>{s.title}</div>
                                </div>
                                {i < steps.length - 1 && <div className={`${styles.stepLine} ${step > i + 1 ? styles.stepLineDone : ""}`} />}
                            </div>
                        ))}
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}

                    {/* STEP 1: Business Info */}
                    {step === 1 && (
                        <div className={styles.stepContent}>
                            <h2 className={styles.stepHeading}>Business Information</h2>
                            <div className={styles.formGrid2}>
                                <div className="form-group" style={{ gridColumn: "span 2" }}>
                                    <label className="form-label">Company Name *</label>
                                    <input className="form-input" placeholder="ABC Seeds Pvt. Ltd." value={form.companyName} onChange={e => set("companyName", e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email Address *</label>
                                    <input className="form-input" type="email" placeholder="contact@company.com" value={form.email} onChange={e => set("email", e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">GST Number *</label>
                                    <input className="form-input" placeholder="29AABCU9603R1ZX" value={form.gstNumber} onChange={e => set("gstNumber", e.target.value.toUpperCase())} maxLength={15} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">PAN Number *</label>
                                    <input className="form-input" placeholder="AABCU9603R" value={form.panNumber} onChange={e => set("panNumber", e.target.value.toUpperCase())} maxLength={10} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Password *</label>
                                    <input className="form-input" type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => set("password", e.target.value)} />
                                </div>
                                <div className="form-group" style={{ gridColumn: "span 2" }}>
                                    <label className="form-label">Confirm Password *</label>
                                    <input className="form-input" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Location */}
                    {step === 2 && (
                        <div className={styles.stepContent}>
                            <h2 className={styles.stepHeading}>Business Location</h2>
                            <div className={styles.formGrid2}>
                                <div className="form-group">
                                    <label className="form-label">State *</label>
                                    <select className="form-select" value={form.state} onChange={e => set("state", e.target.value)}>
                                        <option value="">Select State</option>
                                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">District *</label>
                                    <input className="form-input" placeholder="e.g. Pune" value={form.district} onChange={e => set("district", e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Pincode *</label>
                                    <input className="form-input" placeholder="411001" value={form.pincode} onChange={e => set("pincode", e.target.value)} maxLength={6} />
                                </div>
                                <div className="form-group" style={{ gridColumn: "span 2" }}>
                                    <label className="form-label">Full Business Address *</label>
                                    <textarea className="form-textarea" placeholder="Shop / Office No., Street, Area, City, State" value={form.address} onChange={e => set("address", e.target.value)} rows={3} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Documents */}
                    {step === 3 && (
                        <div className={styles.stepContent}>
                            <h2 className={styles.stepHeading}>Upload Documents</h2>
                            <div className={styles.uploadArea}>
                                <div className={styles.uploadIcon}>📄</div>
                                <div className={styles.uploadTitle}>GST Registration Certificate</div>
                                <div className={styles.uploadDesc}>Upload PDF or image (max 5 MB)</div>
                                <label className={styles.uploadBtn}>
                                    {form.gstCertificate ? "✅ File Uploaded — Change File" : "Choose File"}
                                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} style={{ display: "none" }} />
                                </label>
                                {form.gstCertificate && (
                                    <div className={styles.uploadSuccess}>✓ Your GST certificate has been attached</div>
                                )}
                            </div>
                            <div className={styles.reviewSummary}>
                                <h3 className={styles.reviewTitle}>Review Your Details</h3>
                                <div className={styles.reviewGrid}>
                                    <div><span>Company</span><strong>{form.companyName}</strong></div>
                                    <div><span>GST</span><strong>{form.gstNumber}</strong></div>
                                    <div><span>PAN</span><strong>{form.panNumber}</strong></div>
                                    <div><span>State</span><strong>{form.state}</strong></div>
                                    <div><span>District</span><strong>{form.district}</strong></div>
                                    <div><span>Pincode</span><strong>{form.pincode}</strong></div>
                                </div>
                            </div>
                            <div className={styles.kycNote}>
                                ⏱️ Your KYC will be reviewed within 24–48 hours. You will receive an email once approved.
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className={styles.stepNav}>
                        {step > 1 && (
                            <button className="btn btn-ghost" onClick={() => { setError(""); setStep(s => s - 1); }}>
                                ← Back
                            </button>
                        )}
                        {step < 3 ? (
                            <button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={handleNext}>
                                Continue →
                            </button>
                        ) : (
                            <button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={handleSubmit} disabled={loading}>
                                {loading ? <span className="spinner"></span> : "Submit Application 🚀"}
                            </button>
                        )}
                    </div>

                    <p className={styles.loginLink}>
                        Already registered? <Link href="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>Login here</Link>
                    </p>
                </div>
            </main>
            <Footer />
        </>
    );
}
