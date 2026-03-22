const productApprovalStatusMail = (
  email,
  sellerName,
  productName,
  approvalStatus,
  rejectionReason
) => {
  const companyName = process.env.NAME;
  const isApproved = approvalStatus === "approved";

  const subject = isApproved
    ? `🎉 Your product is now live on ${companyName}!`
    : `⚠️ Your product submission update on ${companyName}`;

  const text = isApproved
    ? `
Dear ${sellerName},

Congratulations! 🎉

Your product "${productName}" has been successfully approved and is now live on ${companyName}.

Customers can now view and purchase your product.

Keep managing your inventory and track your sales from your dashboard.

- ${companyName} Team
`
    : `
Dear ${sellerName},

We regret to inform you that your product "${productName}" has not been approved.

Reason:
${rejectionReason || "The product did not meet our platform guidelines."}

You can update the product details and resubmit for approval.

If you have any questions, please contact our support team.

- ${companyName} Team
`;

  const html = isApproved
    ? `
    <div style="font-family: Arial, sans-serif; background:#f5f6fa; padding:30px;">
      <div style="max-width:520px; margin:auto; background:#ffffff; border-radius:10px; padding:25px; border:1px solid #e6e6e6;">
        
        <h2 style="text-align:center; color:#27ae60;">🎉 Product Approved</h2>

        <p style="font-size:16px; color:#333;">
          Dear <strong>${sellerName}</strong>,
        </p>

        <p style="font-size:15px; color:#333;">
          Great news! Your product <strong>"${productName}"</strong> has been approved and is now live on ${companyName}.
        </p>

        <div style="background:#eafaf1; padding:15px; border-radius:8px; margin:20px 0;">
          <p style="margin:0; font-size:15px; color:#2c3e50;">
            🚀 What you can do now:
          </p>
          <ul style="margin-top:10px; padding-left:20px; color:#555; font-size:14px;">
            <li>Start receiving orders</li>
            <li>Manage product inventory</li>
            <li>Track sales and performance</li>
          </ul>
        </div>

        <p style="font-size:14px; color:#555;">
          We wish you great success selling on ${companyName}!
        </p>

        <p style="font-size:15px; color:#333; margin-top:20px;">
          Best regards,<br>
          <strong>${companyName} Team</strong>
        </p>

      </div>
    </div>
    `
    : `
    <div style="font-family: Arial, sans-serif; background:#f5f6fa; padding:30px;">
      <div style="max-width:520px; margin:auto; background:#ffffff; border-radius:10px; padding:25px; border:1px solid #e6e6e6;">
        
        <h2 style="text-align:center; color:#e74c3c;">⚠️ Product Not Approved</h2>

        <p style="font-size:16px; color:#333;">
          Dear <strong>${sellerName}</strong>,
        </p>

        <p style="font-size:15px; color:#333;">
          Your product <strong>"${productName}"</strong> was not approved.
        </p>

        <div style="background:#fdecea; padding:15px; border-radius:8px; margin:20px 0;">
          <p style="margin:0; font-size:15px; color:#2c3e50;">
            📌 Reason:
          </p>
          <p style="margin-top:10px; color:#555; font-size:14px;">
            ${rejectionReason || "The product did not meet our platform guidelines."}
          </p>
        </div>

        <div style="background:#f1f2f6; padding:15px; border-radius:8px; margin:20px 0;">
          <p style="margin:0; font-size:15px; color:#2c3e50;">
            🔄 What you can do:
          </p>
          <ul style="margin-top:10px; padding-left:20px; color:#555; font-size:14px;">
            <li>Update product details</li>
            <li>Fix issues mentioned above</li>
            <li>Resubmit for approval</li>
          </ul>
        </div>

        <p style="font-size:14px; color:#555;">
          Need help? Contact our support team anytime.
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

module.exports = productApprovalStatusMail;