import nodemailer from "nodemailer";

// ─── Transport Setup ──────────────────────────────────────────────────────────
function createTransport() {
  const isDev = process.env.NODE_ENV === "development";

  if (isDev || !process.env.EMAIL_PASS || process.env.EMAIL_PASS === "your-smtp-password-here") {
    // Dev: log emails to console instead of sending
    return nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

async function sendMail(to: string, subject: string, html: string) {
  const transport = createTransport();
  const from = process.env.EMAIL_FROM || "Tanindo Seeds Pvt Ltd <noreply@tanindoseeds.com>";

  const info = await transport.sendMail({ from, to, subject, html });

  if (process.env.NODE_ENV === "development") {
    console.log(`📧 [DEV] Email would be sent to: ${to}\nSubject: ${subject}`);
  }

  return info;
}

// ─── Templates ────────────────────────────────────────────────────────────────
const baseTemplate = (body: string) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; background: #F8F7F4; margin: 0; padding: 0; }
  .wrapper { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
  .header { background: #1B4332; padding: 24px 32px; }
  .header-title { color: #ffffff; font-size: 20px; font-weight: 700; margin: 0; }
  .header-sub { color: rgba(255,255,255,0.6); font-size: 13px; margin: 4px 0 0; }
  .content { padding: 32px; }
  .body-text { font-size: 15px; color: #3c3c3e; line-height: 1.7; }
  .detail-box { background: #F8F7F4; border-radius: 8px; padding: 20px; margin: 20px 0; }
  .detail-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; }
  .detail-label { color: #6e6e73; }
  .detail-value { color: #1c1c1e; font-weight: 600; }
  .btn { display: inline-block; padding: 12px 24px; background: #1B4332; color: white; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; margin: 20px 0; }
  .footer { padding: 24px 32px; border-top: 1px solid #E5E5E0; font-size: 12px; color: #8e8e93; }
</style>
</head>
<body>
  <div style="padding: 40px 20px; background: #F8F7F4;">
    <div class="wrapper">
      <div class="header">
        <p class="header-title">🌱 Tanindo Seeds Pvt Ltd</p>
        <p class="header-sub">Trustful partner for Growth</p>
      </div>
      <div class="content">${body}</div>
      <div class="footer">
        Tanindo Seeds Pvt Ltd · Trustful partner for Growth<br>
        b2b@tanindoseeds.com · +91 98765 43210<br>
        This is an automated notification. Do not reply to this email.
      </div>
    </div>
  </div>
</body>
</html>`;

// ─── Email Functions ──────────────────────────────────────────────────────────

export async function sendKycApprovalEmail(to: string, companyName: string) {
  const html = baseTemplate(`
    <p class="body-text">Dear <strong>${companyName}</strong>,</p>
    <p class="body-text">
      Congratulations! Your eKYC verification has been successfully reviewed and approved.
      You can now log in to the Tanindo Seeds Pvt Ltd platform and start placing bulk seed orders.
    </p>
    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/login" class="btn">Login to Your Account →</a>
    <p class="body-text" style="font-size:13px; color:#6e6e73;">
      If you have any questions, contact us at b2b@tanindoseeds.com or call +91 98765 43210.
    </p>
  `);
  return sendMail(to, "Your KYC has been approved — Tanindo Seeds Pvt Ltd", html);
}

export async function sendKycRejectionEmail(to: string, companyName: string, reason?: string) {
  const html = baseTemplate(`
    <p class="body-text">Dear <strong>${companyName}</strong>,</p>
    <p class="body-text">
      We regret to inform you that your eKYC application could not be approved at this time.
    </p>
    ${reason ? `<div class="detail-box"><p style="margin:0;font-size:14px;color:#6e6e73"><strong>Reason:</strong> ${reason}</p></div>` : ""}
    <p class="body-text">Please contact our support team and we will help you resolve the issue.</p>
    <a href="mailto:support@tanindoseeds.com" class="btn">Contact Support →</a>
  `);
  return sendMail(to, "KYC Application Update — Tanindo Seeds Pvt Ltd", html);
}

export async function sendOrderApprovalEmail(
  to: string, companyName: string, orderNumber: string, grandTotal: number
) {
  const html = baseTemplate(`
    <p class="body-text">Dear <strong>${companyName}</strong>,</p>
    <p class="body-text">Great news! Your order has been approved and is now being processed.</p>
    <div class="detail-box">
      <div class="detail-row"><span class="detail-label">Order Number</span><span class="detail-value">${orderNumber}</span></div>
      <div class="detail-row"><span class="detail-label">Total Amount</span><span class="detail-value">₹${grandTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span></div>
    </div>
    <p class="body-text">Your invoice has been generated and is available in your dashboard.</p>
    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" class="btn">View Order & Invoice →</a>
  `);
  return sendMail(to, `Order Approved: ${orderNumber} — Tanindo Seeds Pvt Ltd`, html);
}

export async function sendInvoiceEmail(
  to: string, companyName: string, orderNumber: string, invoiceNumber: string, invoiceId: string
) {
  const html = baseTemplate(`
    <p class="body-text">Dear <strong>${companyName}</strong>,</p>
    <p class="body-text">Your GST-compliant tax invoice is ready for download.</p>
    <div class="detail-box">
      <div class="detail-row"><span class="detail-label">Invoice Number</span><span class="detail-value">${invoiceNumber}</span></div>
      <div class="detail-row"><span class="detail-label">For Order</span><span class="detail-value">${orderNumber}</span></div>
    </div>
    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/api/invoices/${invoiceId}" class="btn">View Tax Invoice →</a>
    <p class="body-text" style="font-size:13px;color:#6e6e73;">
      This invoice is GST-compliant and can be used for ITC (Input Tax Credit) claims.
    </p>
  `);
  return sendMail(to, `Tax Invoice: ${invoiceNumber} — Tanindo Seeds Pvt Ltd`, html);
}
