const sellerProductDeletionMail = (
  email,
  sellerName,
  productName
) => {
  const companyName = process.env.NAME;

  const subject = `🗑️ Your product has been deleted from ${companyName}`;

  const text = `
Dear ${sellerName},

This is to confirm that your product "${productName}" has been successfully deleted from ${companyName}.

The product is no longer visible to customers and cannot receive new orders.

If this action was unintentional, you can re-add the product anytime from your seller dashboard.

Thank you for managing your store with us.

- ${companyName} Team
`;

  const html = `
    <div style="font-family: Arial, sans-serif; background:#f5f6fa; padding:30px;">
      <div style="max-width:520px; margin:auto; background:#ffffff; border-radius:10px; padding:25px; border:1px solid #e6e6e6;">
        
        <h2 style="text-align:center; color:#2c3e50;">🗑️ Product Deleted</h2>

        <p style="font-size:16px; color:#333;">
          Dear <strong>${sellerName}</strong>,
        </p>

        <p style="font-size:15px; color:#333;">
          Your product <strong>"${productName}"</strong> has been successfully deleted from ${companyName}.
        </p>

        <div style="background:#f1f2f6; padding:15px; border-radius:8px; margin:20px 0;">
          <p style="margin:0; font-size:15px; color:#2c3e50;">
            📌 What this means:
          </p>
          <ul style="margin-top:10px; padding-left:20px; color:#555; font-size:14px;">
            <li>The product is no longer visible to customers</li>
            <li>It will not receive new orders</li>
            <li>You can re-add it anytime if needed</li>
          </ul>
        </div>

        <p style="font-size:14px; color:#555;">
          If this deletion was not intended, you can easily add the product again from your dashboard.
        </p>

        <p style="font-size:15px; color:#333; margin-top:20px;">
          Best regards,<br>
          <strong>${companyName} Team</strong>
        </p>

      </div>
    </div>
  `;

  return {
    to: email,
    subject,
    text,
    html,
  };
};

module.exports = sellerProductDeletionMail;