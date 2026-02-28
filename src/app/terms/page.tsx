import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
    return (
        <>
            <Navbar />
            <main style={{ background: "var(--surface-2)", minHeight: "100vh" }}>
                <div style={{ background: "linear-gradient(160deg,#0c3d1c,#1a7a3c)", padding: "3rem 0 2.5rem" }}>
                    <div className="container">
                        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2.5rem", fontWeight: 800, color: "white", marginBottom: "0.4rem" }}>Terms & Conditions</h1>
                        <p style={{ color: "rgba(255,255,255,0.6)" }}>Effective Date: January 1, 2026</p>
                    </div>
                </div>
                <div className="container">
                    <div style={{ background: "white", borderRadius: "var(--radius-xl)", border: "1.5px solid var(--border)", padding: "2.5rem", margin: "2.5rem 0 4rem", maxWidth: "860px" }}>
                        {[
                            { title: "1. Platform Use", body: "SeedsCo India is a B2B platform exclusively for verified business entities (distributors, retailers). You must be a registered, GST-compliant business in India to use this platform. Personal/retail purchases are not permitted." },
                            { title: "2. eKYC Verification", body: "All buyers must complete our eKYC process including GST number, PAN, and document upload. SeedsCo reserves the right to approve or reject any KYC application without assigning reasons. False information will result in permanent account ban and may be reported to authorities." },
                            { title: "3. Orders & MOQ", body: "All orders are subject to Minimum Order Quantity (MOQ) as specified on each product page. Orders below MOQ will be automatically rejected. Prices are subject to change without notice; the price at time of order confirmation is binding." },
                            { title: "4. GST & Pricing", body: "All prices are exclusive of GST unless stated otherwise. GST is calculated automatically based on your state vs seller state (CGST+SGST for intra-state; IGST for inter-state supply). Buyers are responsible for ensuring their GSTIN is accurate for ITC claims." },
                            { title: "5. Cancellation", body: "Orders may be cancelled within 2 hours of placement if status is still 'Pending'. Once approved/packed, cancellation is not possible. Refer to our Refund & Cancellation Policy for full details." },
                            { title: "6. Liability", body: "SeedsCo ensures all seeds meet stated germination and purity specifications. However, agricultural outcomes depend on soil, weather, and farming practices beyond our control. Our liability is limited to the invoice value of the concerned lot." },
                            { title: "7. Governing Law", body: "These terms are governed by Indian law. Disputes shall be subject to the exclusive jurisdiction of courts in Pune, Maharashtra, India." },
                        ].map(s => (
                            <div key={s.title} style={{ marginBottom: "1.75rem" }}>
                                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", fontWeight: 700, color: "var(--primary)", marginBottom: "0.6rem", paddingBottom: "0.4rem", borderBottom: "1px solid var(--border)" }}>{s.title}</h2>
                                <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.75 }}>{s.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
