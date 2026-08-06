/**
 * QPay (qpay.mn) integration.
 *
 * Real mode: set QPAY_CLIENT_ID, QPAY_CLIENT_SECRET and QPAY_INVOICE_CODE
 * in backend/.env (values come from your QPay merchant dashboard) and every
 * call below talks to the real QPay REST API.
 *
 * Demo mode: if those env vars are not set, this module simulates QPay —
 * it generates a fake invoice/QR payload and lets an order be marked "paid"
 * through a demo-only endpoint, so the full checkout → pay → confirm flow
 * can be built and tested end to end without merchant credentials.
 * Swap in real credentials later; no other code needs to change.
 */
const fetch = require("node-fetch");
const { nanoid } = require("nanoid");

const QPAY_BASE_URL = process.env.QPAY_BASE_URL || "https://merchant-sandbox.qpay.mn";
const CLIENT_ID = process.env.QPAY_CLIENT_ID || "";
const CLIENT_SECRET = process.env.QPAY_CLIENT_SECRET || "";
const INVOICE_CODE = process.env.QPAY_INVOICE_CODE || "";
const CALLBACK_URL = process.env.QPAY_CALLBACK_URL || "";

const DEMO_MODE = !CLIENT_ID || !CLIENT_SECRET || !INVOICE_CODE;

let cachedToken = null; // { access_token, expiresAt }

async function getToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.access_token;
  }
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${QPAY_BASE_URL}/v2/auth/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}` },
  });
  if (!res.ok) throw new Error(`QPay auth failed: ${res.status}`);
  const data = await res.json();
  cachedToken = {
    access_token: data.access_token,
    // refresh a little early
    expiresAt: Date.now() + (data.expires_in - 30) * 1000,
  };
  return cachedToken.access_token;
}

/**
 * Creates an invoice for an order.
 * Returns a shape that's the same whether real or demo:
 * { invoiceId, qrText, qrImage, urls, demo }
 */
async function createInvoice(order) {
  if (DEMO_MODE) {
    const invoiceId = "DEMO-" + nanoid(10).toUpperCase();
    return {
      invoiceId,
      qrText: `qpay-demo://invoice/${invoiceId}?amount=${order.total}`,
      qrImage: null, // frontend renders a placeholder QR in demo mode
      urls: [],
      demo: true,
    };
  }

  const token = await getToken();
  const res = await fetch(`${QPAY_BASE_URL}/v2/invoice`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      invoice_code: INVOICE_CODE,
      sender_invoice_no: order.id,
      invoice_receiver_code: "terminal",
      invoice_description: `Захиалга #${order.id}`,
      amount: order.total,
      callback_url: CALLBACK_URL,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`QPay invoice creation failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  return {
    invoiceId: data.invoice_id,
    qrText: data.qr_text,
    qrImage: data.qr_image, // base64 PNG
    urls: data.urls || [],
    demo: false,
  };
}

/**
 * Checks whether an invoice has been paid.
 * Returns { paid: boolean, raw }
 */
async function checkPayment(invoiceId) {
  if (DEMO_MODE) {
    // In demo mode, "payment" only happens when the demo endpoint is called
    // explicitly (see routes/payments.js) — checkPayment here always reports
    // whatever the order's stored paymentStatus already says, so this
    // function is only meaningful wired through the order record itself.
    return { paid: false, raw: { demo: true } };
  }

  const token = await getToken();
  const res = await fetch(`${QPAY_BASE_URL}/v2/payment/check`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      object_type: "INVOICE",
      object_id: invoiceId,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`QPay payment check failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  const paid = (data.count || 0) > 0 || (data.rows && data.rows.length > 0);
  return { paid, raw: data };
}

module.exports = { DEMO_MODE, createInvoice, checkPayment };
