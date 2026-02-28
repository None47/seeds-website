import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// Server-side GST invoice PDF generation using jspdf
// (jspdf is loaded dynamically to avoid SSR issues)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
            order: { include: { items: { include: { product: true } } } },
            buyer: true,
        },
    });

    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    // Verify buyer can only access their own invoices
    if (user.role !== "admin" && invoice.buyerId !== user.userId)
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Build invoice HTML for PDF
    const sellerName = process.env.NEXT_PUBLIC_SELLER_NAME || "Tanindo Seeds Pvt Ltd";
    const sellerAddress = process.env.NEXT_PUBLIC_SELLER_ADDRESS || "Trustful partner for Growth · b2b@tanindoseeds.com";

    const invoiceDateStr = new Date(invoice.invoiceDate).toLocaleDateString("en-IN", {
        year: "numeric", month: "long", day: "numeric",
    });

    const itemsRows = invoice.order.items.map((item: typeof invoice.order.items[number], i: number) => `
    <tr>
      <td>${i + 1}</td>
      <td>${item.product.varietyName}<br><small>${item.product.cropName}</small></td>
      <td>${item.hsnCode}</td>
      <td>${item.quantity} kg</td>
      <td>₹${item.pricePerUnit.toFixed(2)}</td>
      <td>${item.gstRate}%</td>
      <td>₹${item.subtotal.toFixed(2)}</td>
    </tr>
  `).join("");

    const taxRows = invoice.igst > 0
        ? `<tr><td colspan="6" style="text-align:right"><strong>IGST (Inter-State)</strong></td><td>₹${invoice.igst.toFixed(2)}</td></tr>`
        : `
      <tr><td colspan="6" style="text-align:right"><strong>CGST</strong></td><td>₹${invoice.cgst.toFixed(2)}</td></tr>
      <tr><td colspan="6" style="text-align:right"><strong>SGST</strong></td><td>₹${invoice.sgst.toFixed(2)}</td></tr>
    `;

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Invoice ${invoice.invoiceNumber}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #1a2e1a; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 3px solid #1a7a3c; padding-bottom: 16px; }
  .logo { font-size: 22px; font-weight: 900; color: #1a7a3c; }
  .logo span { color: #e8a020; }
  .invoice-title { font-size: 24px; font-weight: 700; color: #1a7a3c; text-align: right; }
  .invoice-meta { text-align: right; font-size: 11px; color: #555; }
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
  .party-box { border: 1px solid #d0dcc8; border-radius: 8px; padding: 12px; background: #f4f7f2; }
  .party-box h4 { font-size: 11px; text-transform: uppercase; color: #4a6340; margin-bottom: 8px; letter-spacing: 0.05em; }
  .party-box p { margin-bottom: 2px; font-size: 11px; }
  .party-box strong { font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { background: #1a7a3c; color: white; padding: 8px 10px; text-align: left; font-size: 11px; }
  td { padding: 8px 10px; border-bottom: 1px solid #e0e8d8; font-size: 11px; }
  tr:nth-child(even) td { background: #f4f7f2; }
  .totals td { border-bottom: 1px solid #d0dcc8; }
  .grand-total td { background: #1a7a3c !important; color: white; font-size: 14px; font-weight: 700; }
  .pos { margin-bottom: 16px; font-size: 11px; border: 1px solid #d0dcc8; border-radius: 6px; padding: 8px 12px; background: #fffbe8; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #d0dcc8; font-size: 10px; color: #7a9270; text-align: center; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; }
  .badge-green { background: #d1e7dd; color: #0a3622; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">🌱 Tanindo Seeds <span>Pvt Ltd</span></div>
      <p style="font-size:11px;color:#555;margin-top:4px">${sellerName}</p>
      <p style="font-size:11px;color:#555">${sellerAddress}</p>
      <p style="font-size:11px;color:#555">GSTIN: ${invoice.sellerGstin}</p>
    </div>
    <div>
      <div class="invoice-title">TAX INVOICE</div>
      <div class="invoice-meta">
        <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
        <p><strong>Date:</strong> ${invoiceDateStr}</p>
        <p><strong>Order #:</strong> ${invoice.order.orderNumber}</p>
        <p style="margin-top:6px"><span class="badge badge-green">GST COMPLIANT</span></p>
      </div>
    </div>
  </div>

  <div class="parties">
    <div class="party-box">
      <h4>Billed To (Buyer)</h4>
      <strong>${invoice.buyer.companyName || "—"}</strong>
      <p>${invoice.buyer.address || "—"}</p>
      <p>${invoice.buyer.district}, ${invoice.buyer.state} - ${invoice.buyer.pincode}</p>
      <p style="margin-top:6px"><strong>GSTIN:</strong> ${invoice.buyerGstin}</p>
      <p><strong>PAN:</strong> ${invoice.buyer.panNumber || "—"}</p>
    </div>
    <div class="party-box">
      <h4>Place of Supply</h4>
      <p><strong>${invoice.placeOfSupply}</strong></p>
      <p style="margin-top:8px;font-size:10px;color:#7a9270">
        ${invoice.igst > 0 ? "Inter-State Supply — IGST applicable" : "Intra-State Supply — CGST + SGST applicable"}
      </p>
    </div>
  </div>

  <table>
    <thead>
      <tr><th>#</th><th>Description</th><th>HSN</th><th>Qty</th><th>Rate</th><th>GST%</th><th>Amount</th></tr>
    </thead>
    <tbody>${itemsRows}</tbody>
    <tfoot class="totals">
      <tr><td colspan="6" style="text-align:right"><strong>Subtotal</strong></td><td>₹${invoice.subtotal.toFixed(2)}</td></tr>
      ${taxRows}
      <tr class="grand-total"><td colspan="6" style="text-align:right; background:#1a7a3c; color:white">Grand Total</td><td style="background:#1a7a3c;color:white">₹${invoice.grandTotal.toFixed(2)}</td></tr>
    </tfoot>
  </table>

  <div class="pos">
    📍 <strong>Place of Supply:</strong> ${invoice.placeOfSupply} &nbsp;|&nbsp;
    <strong>Seller GSTIN:</strong> ${invoice.sellerGstin} &nbsp;|&nbsp;
    <strong>Buyer GSTIN:</strong> ${invoice.buyerGstin}
  </div>

  <div class="footer">
    <p>This is a computer-generated invoice and does not require a physical signature.</p>
    <p style="margin-top:4px">${sellerName} · ${sellerAddress}</p>
    <p style="margin-top:4px">Trustful partner for Growth · For queries: b2b@tanindoseeds.com · +91 98765 43210</p>
  </div>
</body>
</html>`;

    // Return the invoice HTML — the browser will display/print it
    // For server-side PDF, we return the HTML with a print-ready content type.
    // In production, integrate Puppeteer/chromium for binary PDF generation.
    return new NextResponse(html, {
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Content-Disposition": `inline; filename="Invoice-${invoice.invoiceNumber}.html"`,
        },
    });
}
