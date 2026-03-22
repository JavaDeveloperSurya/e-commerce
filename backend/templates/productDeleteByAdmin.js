const productDeletionMail = (
  email,
  sellerName,
  productName,
  deletionReason = ""
) => {
  const companyName = process.env.NAME;

  const subject = `⚠️ Your product has been removed from ${companyName}`;

  const text = `
Dear ${sellerName},

We would like to inform you that your product "${productName}" has been removed from ${companyName}.

Reason:
${deletionReason || "The product violated our platform policies or guidelines."}

What you can do next:
- Review the reason for removal carefully.
- Update your product details to meet our guidelines.
- You may re-upload the product after making the necessary corrections.

If you believe this action was taken in error, please contact our support team.

- ${companyName} Team
`;

  const html = `
    <div style="font-family: Arial, sans-serif; background:#f5f6fa; padding:30px;">
      <div style="max-width:520px; margin:auto; background:#ffffff; border-radius:10px; padding:25px; border:1px solid #e6e6e6;">
        
        <h2 style="text-align:center; color:#e74c3c;">⚠️ Product Removed</h2>

        <p style="font-size:16px; color:#333;">
          Dear <strong>${sellerName}</strong>,
        </p>

        <p style="font-size:15px; color:#333;">
          Your product <strong>"${productName}"</strong> has been removed from ${companyName}.
        </p>

        <div style="background:#fdecea; padding:15px; border-radius:8px; margin:20px 0;">
          <p style="margin:0; font-size:15px; color:#2c3e50;">
            📌 Reason:
          </p>
          <p style="margin-top:10px; color:#555; font-size:14px;">
            ${deletionReason || "The product violated our platform policies or guidelines."}
          </p>
        </div>

        <div style="background:#f1f2f6; padding:15px; border-radius:8px; margin:20px 0;">
          <p style="margin:0; font-size:15px; color:#2c3e50;">
            🔄 What you can do:
          </p>
          <ul style="margin-top:10px; padding-left:20px; color:#555; font-size:14px;">
            <li>Review and correct product details</li>
            <li>Ensure compliance with platform policies</li>
            <li>Re-submit the product for approval</li>
          </ul>
        </div>

        <p style="font-size:14px; color:#555;">
          If you think this was a mistake, please contact our support team.
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

module.exports = productDeletionMail;