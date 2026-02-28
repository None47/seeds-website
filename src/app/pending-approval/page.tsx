import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import styles from "./page.module.css";

export default function PendingApprovalPage() {
    return (
        <>
            <Navbar />
            <main className={styles.page}>
                <div className={styles.card}>
                    <div className={styles.icon}>⏳</div>
                    <h1 className={styles.title}>Application Under Review</h1>
                    <p className={styles.desc}>
                        Thank you for registering with SeedsCo India! Your eKYC application has been submitted and is currently being reviewed by our team.
                    </p>
                    <div className={styles.timeline}>
                        <div className={styles.timelineItem}>
                            <div className={`${styles.dot} ${styles.dotDone}`}>✓</div>
                            <div>
                                <div className={styles.timelineTitle}>Application Submitted</div>
                                <div className={styles.timelineDesc}>Your documents have been received</div>
                            </div>
                        </div>
                        <div className={styles.timelineLine}></div>
                        <div className={styles.timelineItem}>
                            <div className={`${styles.dot} ${styles.dotActive}`}>🔍</div>
                            <div>
                                <div className={styles.timelineTitle}>KYC Verification</div>
                                <div className={styles.timelineDesc}>Our team is reviewing your GST & PAN details</div>
                            </div>
                        </div>
                        <div className={styles.timelineLine}></div>
                        <div className={styles.timelineItem}>
                            <div className={styles.dot}>📦</div>
                            <div>
                                <div className={styles.timelineTitle}>Account Activated</div>
                                <div className={styles.timelineDesc}>Start placing bulk orders</div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.info}>
                        <p>⏱️ <strong>Expected review time:</strong> 24–48 business hours</p>
                        <p>📧 You will receive an email notification upon approval</p>
                        <p>📞 For urgent queries: <strong>+91 98765 43210</strong></p>
                    </div>
                    <Link href="/" className="btn btn-outline">← Back to Home</Link>
                </div>
            </main>
            <Footer />
        </>
    );
}
