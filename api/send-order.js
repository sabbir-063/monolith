import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const BCC_EMAIL = 'sabbir.musfique01@gmail.com';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateOrderId() {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `MNL-${year}-${rand}`;
}

function formatMoney(amount, lang) {
  return Number(amount).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US');
}

// ─── Brick HTML block (works in all email clients) ────────────────────────────

function buildBrickBlock(color, engrave) {
  const hasEngrave = engrave && engrave.trim();
  return `
    <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:32px;">
      <tr>
        <td align="center">
          <table cellpadding="0" cellspacing="0" style="
            background-color:${color};
            border-radius:10px;
            width:300px;
            box-shadow:0 12px 40px rgba(0,0,0,0.55);
          ">
            <tr>
              <td style="padding:26px 36px 20px;">
                <!-- Frog indentation mark -->
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="
                      background-color:rgba(0,0,0,0.22);
                      border-radius:3px;
                      height:10px;
                    "></td>
                  </tr>
                </table>
              </td>
            </tr>
            ${hasEngrave ? `
            <tr>
              <td align="center" style="padding:0 36px 26px;">
                <p style="
                  margin:0;
                  font-family:Georgia,'Times New Roman',serif;
                  font-size:14px;
                  letter-spacing:5px;
                  text-transform:uppercase;
                  color:rgba(236,228,214,0.82);
                  font-style:italic;
                ">${engrave.trim()}</p>
              </td>
            </tr>` : `
            <tr><td style="padding-bottom:26px;"></td></tr>`}
          </table>
        </td>
      </tr>
    </table>
  `;
}

// ─── Email HTML template ──────────────────────────────────────────────────────

function buildEmailHTML({ name, finishName, finishColor, quantity, engrave, subtotal, engraveCost, total, orderId, lang }) {
  const isBn = lang === 'bn';
  const hasEngrave = engrave && engrave.trim();
  const brickBlock = buildBrickBlock(finishColor, engrave);

  const L = isBn ? {
    greeting:     `অর্ডার নিশ্চিত হয়েছে, ${name}।`,
    subtitle:     'আপনার মনোলিথ প্রস্তুত হচ্ছে।',
    orderIdLabel: 'অর্ডার আইডি',
    summaryTitle: 'অর্ডার সারসংক্ষেপ',
    finishLabel:  'ফিনিশ',
    qtyLabel:     'পরিমাণ',
    engraveLabel: 'খোদাই',
    subtotalLbl:  'সাবটোটাল',
    engravingLbl: 'খোদাই',
    totalLabel:   'মোট',
    qtyUnit:      ' টি',
    shippingNote: 'কাঠের বিশেষ বক্সে পাঠানো হবে। কোনো জোড়াতালির প্রয়োজন নেই। কখনো না।',
    footer:       '© MMXXVI মনোলিথ — লাক্সারির একটি বিদ্রূপাত্মক রূপ, ১০০০° সে. তাপমাত্রায় দগ্ধ।',
    brand1:       'মনো',
    brand2:       'লিথ',
  } : {
    greeting:     `Order confirmed, ${name}.`,
    subtitle:     'Your MONOLITH is being prepared.',
    orderIdLabel: 'Order ID',
    summaryTitle: 'Order Summary',
    finishLabel:  'Finish',
    qtyLabel:     'Quantity',
    engraveLabel: 'Engraving',
    subtotalLbl:  'Subtotal',
    engravingLbl: 'Engraving',
    totalLabel:   'Total',
    qtyUnit:      quantity === 1 ? ' unit' : ' units',
    shippingNote: 'Ships in a custom timber crate. No assembly. Ever.',
    footer:       '© MMXXVI MONOLITH — A satire of luxury, fired at 1000°C.',
    brand1:       'MONO',
    brand2:       'LITH',
  };

  const qtyDisplay = isBn
    ? Number(quantity).toLocaleString('bn-BD')
    : quantity;

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${L.greeting}</title>
</head>
<body style="margin:0;padding:0;background-color:#1c0f0a;font-family:'Helvetica Neue',Arial,sans-serif;color:#ece4d6;">

  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#1c0f0a">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- ── HEADER ── -->
          <tr>
            <td style="
              background-color:#150b08;
              border-radius:12px 12px 0 0;
              padding:26px 40px;
              border-bottom:1px solid rgba(236,228,214,0.10);
              text-align:center;
            ">
              <p style="
                margin:0;
                font-family:Georgia,serif;
                font-size:20px;
                font-weight:bold;
                letter-spacing:8px;
                color:#ece4d6;
                text-transform:uppercase;
              ">
                <span style="color:#e2562a;">${L.brand1}</span>${L.brand2}
              </p>
            </td>
          </tr>

          <!-- ── BRICK VISUAL + GREETING ── -->
          <tr>
            <td style="background-color:#241410;padding:40px 40px 32px;text-align:center;">
              ${brickBlock}

              <h1 style="
                margin:0 0 10px;
                font-family:Georgia,serif;
                font-size:24px;
                font-weight:bold;
                color:#ece4d6;
                letter-spacing:-0.3px;
              ">${L.greeting}</h1>

              <p style="
                margin:0 0 24px;
                font-size:15px;
                color:#b9ad9b;
              ">${L.subtitle}</p>

              <!-- Order ID badge -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="
                    background-color:rgba(226,86,42,0.14);
                    border:1px solid rgba(226,86,42,0.40);
                    border-radius:6px;
                    padding:9px 22px;
                  ">
                    <p style="
                      margin:0;
                      font-family:'Courier New',Courier,monospace;
                      font-size:12px;
                      letter-spacing:3px;
                      color:#e2562a;
                      text-transform:uppercase;
                    ">${L.orderIdLabel}: ${orderId}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── ORDER SUMMARY ── -->
          <tr>
            <td style="
              background-color:#1c0f0a;
              padding:32px 40px;
              border-top:1px solid rgba(236,228,214,0.08);
            ">
              <p style="
                margin:0 0 20px;
                font-family:'Courier New',Courier,monospace;
                font-size:11px;
                letter-spacing:4px;
                text-transform:uppercase;
                color:#e2562a;
              ">${L.summaryTitle}</p>

              <table width="100%" cellpadding="0" cellspacing="0">

                <!-- Finish -->
                <tr>
                  <td style="padding:11px 0;border-bottom:1px solid rgba(236,228,214,0.08);color:#b9ad9b;font-size:14px;">${L.finishLabel}</td>
                  <td style="padding:11px 0;border-bottom:1px solid rgba(236,228,214,0.08);text-align:right;color:#ece4d6;font-size:14px;">${finishName}</td>
                </tr>

                <!-- Quantity -->
                <tr>
                  <td style="padding:11px 0;border-bottom:1px solid rgba(236,228,214,0.08);color:#b9ad9b;font-size:14px;">${L.qtyLabel}</td>
                  <td style="padding:11px 0;border-bottom:1px solid rgba(236,228,214,0.08);text-align:right;color:#ece4d6;font-size:14px;">${qtyDisplay}${L.qtyUnit}</td>
                </tr>

                ${hasEngrave ? `
                <!-- Engraving text -->
                <tr>
                  <td style="padding:11px 0;border-bottom:1px solid rgba(236,228,214,0.08);color:#b9ad9b;font-size:14px;">${L.engraveLabel}</td>
                  <td style="padding:11px 0;border-bottom:1px solid rgba(236,228,214,0.08);text-align:right;color:#ece4d6;font-size:14px;font-style:italic;">&ldquo;${engrave.trim()}&rdquo;</td>
                </tr>` : ''}

                <!-- Subtotal -->
                <tr>
                  <td style="padding:11px 0;border-bottom:1px solid rgba(236,228,214,0.08);color:#b9ad9b;font-size:14px;">${L.subtotalLbl}</td>
                  <td style="padding:11px 0;border-bottom:1px solid rgba(236,228,214,0.08);text-align:right;color:#ece4d6;font-size:14px;">&#2547; ${formatMoney(subtotal, lang)}</td>
                </tr>

                ${hasEngrave ? `
                <!-- Engraving cost -->
                <tr>
                  <td style="padding:11px 0;border-bottom:1px solid rgba(236,228,214,0.08);color:#b9ad9b;font-size:14px;">${L.engravingLbl}</td>
                  <td style="padding:11px 0;border-bottom:1px solid rgba(236,228,214,0.08);text-align:right;color:#ece4d6;font-size:14px;">&#2547; ${formatMoney(engraveCost, lang)}</td>
                </tr>` : ''}

                <!-- Total -->
                <tr>
                  <td style="padding:18px 0 0;color:#ece4d6;font-size:16px;font-weight:bold;">${L.totalLabel}</td>
                  <td style="padding:18px 0 0;text-align:right;color:#e2562a;font-size:24px;font-weight:bold;font-family:Georgia,serif;">&#2547; ${formatMoney(total, lang)}</td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- ── SHIPPING NOTE ── -->
          <tr>
            <td style="
              background-color:#150b08;
              border-top:1px solid rgba(236,228,214,0.08);
              padding:20px 40px;
              text-align:center;
            ">
              <p style="
                margin:0;
                font-family:'Courier New',Courier,monospace;
                font-size:11px;
                letter-spacing:2px;
                color:#b9ad9b;
                text-transform:uppercase;
              ">${L.shippingNote}</p>
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="
              background-color:#150b08;
              border-radius:0 0 12px 12px;
              border-top:1px solid rgba(236,228,214,0.05);
              padding:18px 40px;
              text-align:center;
            ">
              <p style="
                margin:0;
                font-size:11px;
                color:rgba(185,173,155,0.45);
                letter-spacing:0.5px;
              ">${L.footer}</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // Allow only POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const {
      name,
      email,
      finishName,
      finishColor,
      quantity,
      engrave,
      subtotal,
      engraveCost,
      total,
      lang,
    } = req.body;

    // ── Server-side validation ──────────────────────────────────────────────
    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({ error: 'Invalid name' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      return res.status(400).json({ error: 'Invalid email' });
    }
    if (!finishName || !quantity || Number(quantity) < 1 || Number(quantity) > 99) {
      return res.status(400).json({ error: 'Invalid order data' });
    }

    const orderId = generateOrderId();
    const resolvedLang = lang === 'bn' ? 'bn' : 'en';

    const html = buildEmailHTML({
      name:       String(name).trim(),
      finishName,
      finishColor: finishColor || '#9b2d20',
      quantity:   Number(quantity),
      engrave:    engrave || '',
      subtotal:   Number(subtotal),
      engraveCost: Number(engraveCost),
      total:      Number(total),
      orderId,
      lang:       resolvedLang,
    });

    const subject = resolvedLang === 'bn'
      ? `মনোলিথ অর্ডার নিশ্চিত — ${orderId}`
      : `MONOLITH Order Confirmed — ${orderId}`;

    const { error } = await resend.emails.send({
      from:    'MONOLITH <onboarding@resend.dev>',
      to:      [String(email).trim()],
      bcc:     [BCC_EMAIL],
      subject,
      html,
    });

    if (error) {
      console.error('[send-order] Resend error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ orderId });
  } catch (err) {
    console.error('[send-order] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
