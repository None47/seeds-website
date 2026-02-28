import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AiChat from "@/components/AiChat";
import styles from "./page.module.css";

export default function PrivacyPolicyPage() {
    return (
        <>
            <Navbar />
            <main className={styles.legalPage}>
                <div className={styles.hero}>
                    <div className="container">
                        <h1 className={styles.title}>Privacy Policy</h1>
                        <p className={styles.effective}>Effective Date: January 1, 2026</p>
                    </div>
                </div>
                <div className="container">
                    <div className={styles.content}>
                        <section><h2>1. Information We Collect</h2>
                            <p>We collect the following information when you register as a distributor on SeedsCo India:</p>
                            <ul>
                                <li><strong>Business Information:</strong> Company name, GST number, PAN number</li>
                                <li><strong>Location Data:</strong> State, district, pincode, business address</li>
                                <li><strong>Contact Information:</strong> Email address</li>
                                <li><strong>Documents:</strong> GST registration certificate (for KYC verification)</li>
                                <li><strong>Transaction Data:</strong> Order history, invoice records</li>
                            </ul>
                        </section>
                        <section><h2>2. How We Use Your Information</h2>
                            <ul>
                                <li>To verify your business identity (eKYC process)</li>
                                <li>To process bulk seed orders and generate GST-compliant invoices</li>
                                <li>To send order status notifications via email</li>
                                <li>To provide region-specific product recommendations</li>
                                <li>To comply with Indian tax and regulatory requirements</li>
                            </ul>
                        </section>
                        <section><h2>3. Data Security</h2>
                            <p>Your data is stored securely on our servers located in India. We use industry-standard encryption for all sensitive data including GST certificates and financial information. Passwords are hashed using bcrypt and never stored in plaintext.</p>
                        </section>
                        <section><h2>4. Data Sharing</h2>
                            <p>We do not sell, trade, or share your personal data with third parties except:</p>
                            <ul>
                                <li>As required by Indian law or government authorities</li>
                                <li>With logistics partners for order fulfillment (limited to delivery address only)</li>
                            </ul>
                        </section>
                        <section><h2>5. Your Rights</h2>
                            <p>Under applicable Indian data protection laws, you have the right to access, correct, or request deletion of your personal data. Contact us at <strong>privacy@seedscoindia.com</strong> for such requests.</p>
                        </section>
                        <section><h2>6. Contact</h2>
                            <p>SeedsCo India Pvt. Ltd. · 123 Agriculture Hub, Pune, Maharashtra – 411001 · privacy@seedscoindia.com</p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
            <AiChat />
        </>
    );
}
