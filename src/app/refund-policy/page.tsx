import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RefundPolicyPage() {
    return (
        <>
            <Navbar />
            <main style={{ background: "var(--surface-2)", minHeight: "100vh" }}>
                <div style={{ background: "linear-gradient(160deg,#0c3d1c,#1a7a3c)", padding: "3rem 0 2.5rem" }}>
                    <div className="container">
                        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2.5rem", fontWeight: 800, color: "white", marginBottom: "0.4rem" }}>Refund & Cancellation Policy</h1>
                        <p style={{ color: "rgba(255,255,255,0.6)" }}>Effective Date: January 1, 2026</p>
                    </div>
                </div>
                <div className="container">
                    <div style={{ background: "white", borderRadius: "var(--radius-xl)", border: "1.5px solid var(--border)", padding: "2.5rem", margin: "2.5rem 0 4rem", maxWidth: "860px" }}>
                        {[
                            { title: "Cancellation Policy", body: "• Orders in 'Pending' status can be cancelled within 2 hours by contacting support at orders@seedscoindia.com\n• Orders in 'Approved', 'Packed', or 'Shipped' status cannot be cancelled\n• Cancellation requests must quote the Order ID" },
                            { title: "Refund Eligibility", body: "Refunds are applicable ONLY in the following cases:\n• Wrong variety shipped (verified against invoice)\n• Germination rate falls below the guaranteed minimum in lab testing (seed sample must be submitted within 14 days of delivery)\n• Seeds delivered in damaged/tampered condition (photos must be shared within 48 hours of delivery)" },
                            { title: "Non-Refundable Situations", body: "• Crop failure due to weather, pest attack, improper irrigation, or wrong sowing practice\n• Returns initiated after 30 days of delivery\n• Seeds stored improperly after delivery (high humidity, direct sunlight, pests)\n• Partial usage of a seed lot" },
                            { title: "Refund Process", body: "1. Raise a complaint at support@seedscoindia.com with Order ID, lot number, and evidence\n2. Our QA team will review within 5–7 business days\n3. If approved, refund will be credited to original payment method within 10–15 business days\n4. Or, at buyer's option, replacement seeds of equal value may be dispatched" },
                            { title: "Contact for Refunds / Disputes", body: "SeedsCo India Pvt. Ltd.\n📧 support@seedscoindia.com\n📞 +91 98765 43210 (Mon–Sat, 9 AM – 6 PM IST)\n📍 123 Agriculture Hub, Pune, Maharashtra – 411001" },
                        ].map(s => (
                            <div key={s.title} style={{ marginBottom: "1.75rem" }}>
                                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", fontWeight: 700, color: "var(--primary)", marginBottom: "0.6rem", paddingBottom: "0.4rem", borderBottom: "1px solid var(--border)" }}>{s.title}</h2>
                                <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.75, whiteSpace: "pre-line" }}>{s.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
