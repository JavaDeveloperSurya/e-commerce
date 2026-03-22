const orderStatusMail = (
  email,
  customerName,
  orderId,
  orderStatus
) => {
  const companyName = process.env.NAME;
  const orderUrl = `${process.env.CLIENT_URL}/orders/${orderId}`;

  let subject = "";
  let text = "";
  let html = "";

  // ================= CREATED =================
  if (orderStatus === "created") {
    subject = `🛒 Order Created - ${orderId}`;

    text = `
Dear ${customerName},

Your order has been successfully created.

Order ID: ${orderId}

Please proceed with the payment to confirm your order.

- ${companyName} Team
`;

    html = `
    <div style="font-family: Arial; background:#f5f6fa; padding:30px;">
      <div style="max-width:520px; margin:auto; background:#fff; padding:25px; border-radius:10px;">
        <h2 style="text-align:center;">🛒 Order Created</h2>
        <p>Dear <strong>${customerName}</strong>,</p>
        <p>Your order has been successfully created.</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <a href="${orderUrl}" style="display:block; text-align:center; background:#3498db; color:#fff; padding:10px; border-radius:5px; text-decoration:none;">View Order</a>
      </div>
    </div>`;
  }

  // ================= PENDING PAYMENT =================
  if (orderStatus === "pending_payment") {
    subject = `⏳ Payment Pending - Order ${orderId}`;

    text = `
Dear ${customerName},

Your payment is currently being processed.

Order ID: ${orderId}

Please wait while we confirm your payment.

- ${companyName} Team
`;

    html = `
    <div style="font-family: Arial; background:#f5f6fa; padding:30px;">
      <div style="max-width:520px; margin:auto; background:#fff; padding:25px; border-radius:10px;">
        <h2 style="text-align:center;">⏳ Payment Pending</h2>
        <p>Your payment is under verification.</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
      </div>
    </div>`;
  }

  // ================= PAYMENT FAILED =================
  if (orderStatus === "payment_failed") {
    subject = `❌ Payment Failed - Order ${orderId}`;

    text = `
Dear ${customerName},

Unfortunately, your payment has failed.

Order ID: ${orderId}

Please try again to confirm your order.

- ${companyName} Team
`;

    html = `
    <div style="font-family: Arial; background:#f5f6fa; padding:30px;">
      <div style="max-width:520px; margin:auto; background:#fff; padding:25px; border-radius:10px;">
        <h2 style="text-align:center; color:#e74c3c;">❌ Payment Failed</h2>
        <p>Your payment could not be processed.</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <a href="${orderUrl}" style="display:block; text-align:center; background:#e74c3c; color:#fff; padding:10px; border-radius:5px; text-decoration:none;">Retry Payment</a>
      </div>
    </div>`;
  }

  // ================= PAID =================
  if (orderStatus === "paid") {
    subject = `✅ Payment Successful - Order ${orderId}`;

    text = `
Dear ${customerName},

Your payment was successful and your order is confirmed.

Order ID: ${orderId}

We will notify you once the order is shipped.

- ${companyName} Team
`;

    html = `
    <div style="font-family: Arial; background:#f5f6fa; padding:30px;">
      <div style="max-width:520px; margin:auto; background:#fff; padding:25px; border-radius:10px;">
        <h2 style="text-align:center; color:#27ae60;">✅ Payment Successful</h2>
        <p>Your order is confirmed.</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
      </div>
    </div>`;
  }

  // ================= SHIPPED =================
  if (orderStatus === "shipped") {
    subject = `📦 Order Shipped - ${orderId}`;

    text = `
Dear ${customerName},

Your order has been shipped.

Order ID: ${orderId}

It will be delivered soon.

- ${companyName} Team
`;

    html = `
    <div style="font-family: Arial; background:#f5f6fa; padding:30px;">
      <div style="max-width:520px; margin:auto; background:#fff; padding:25px; border-radius:10px;">
        <h2 style="text-align:center;">📦 Order Shipped</h2>
        <p>Your order is on the way.</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
      </div>
    </div>`;
  }

  // ================= OUT FOR DELIVERY =================
  if (orderStatus === "out_for_delivery") {
    subject = `🚚 Out for Delivery - Order ${orderId}`;

    text = `
Dear ${customerName},

Your order is out for delivery and will reach you soon.

Order ID: ${orderId}

- ${companyName} Team
`;

    html = `
    <div style="font-family: Arial; background:#f5f6fa; padding:30px;">
      <div style="max-width:520px; margin:auto; background:#fff; padding:25px; border-radius:10px;">
        <h2 style="text-align:center;">🚚 Out for Delivery</h2>
        <p>Your order will be delivered today.</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
      </div>
    </div>`;
  }

  // ================= DELIVERED =================
  if (orderStatus === "delivered") {
    subject = `📦 Delivered - Order ${orderId}`;

    text = `
Dear ${customerName},

Your order has been delivered successfully.

Order ID: ${orderId}

Thank you for shopping with us!

- ${companyName} Team
`;

    html = `
    <div style="font-family: Arial; background:#f5f6fa; padding:30px;">
      <div style="max-width:520px; margin:auto; background:#fff; padding:25px; border-radius:10px;">
        <h2 style="text-align:center; color:#27ae60;">📦 Delivered</h2>
        <p>Your order has been delivered.</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
      </div>
    </div>`;
  }

  // ================= CANCELLED =================
  if (orderStatus === "cancelled") {
    subject = `❌ Order Cancelled - ${orderId}`;

    text = `
Dear ${customerName},

Your order has been cancelled.

Order ID: ${orderId}

If you have already paid, the refund will be processed soon.

- ${companyName} Team
`;

    html = `
    <div style="font-family: Arial; background:#f5f6fa; padding:30px;">
      <div style="max-width:520px; margin:auto; background:#fff; padding:25px; border-radius:10px;">
        <h2 style="text-align:center; color:#e74c3c;">❌ Order Cancelled</h2>
        <p>Your order has been cancelled.</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
      </div>
    </div>`;
  }

  return {
    to: email,
    subject,
    text,
    html
  };
};

module.exports = orderStatusMail;