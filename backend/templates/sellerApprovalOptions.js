const sellerApprovalStatusMail = (email,name,shopName,approvalStatus)=>{
    const companyName = process.env.NAME;
    const isApproved = approvalStatus === "verified";

  const subject = isApproved
    ? `🎉 Your ${companyName} Seller Account is verified!`
    : `⚠️ Your ${companyName} Seller Application Update`;

  const text = isApproved
    ? `
Dear ${name},

Congratulations! 🎉

Your seller account for "${shopName}" has been successfully verified.

You can now log in and start adding and managing your products on ${companyName}.

Welcome to our seller community!

- ${companyName} Team
`
    : `
Dear ${name},

We regret to inform you that your seller application for "${shopName}" has not been approved at this time.

This may be due to incomplete or invalid information provided during registration.

You may review your details and reapply.

If you have any questions, please contact our support team.

- ${companyName} Team
`;

  const html = isApproved
    ? `
    <div style="font-family: Arial, sans-serif; background:#f5f6fa; padding:30px;">
      <div style="max-width:520px; margin:auto; background:#ffffff; border-radius:10px; padding:25px; border:1px solid #e6e6e6;">
        
        <h2 style="text-align:center; color:#27ae60;">🎉 Seller Verified</h2>

        <p style="font-size:16px; color:#333;">
          Dear <strong>${name}</strong>,
        </p>

        <p style="font-size:15px; color:#333;">
          Congratulations! Your seller account for <strong>${shopName}</strong> has been successfully verified.
        </p>

        <div style="background:#eafaf1; padding:15px; border-radius:8px; margin:20px 0;">
          <p style="margin:0; font-size:15px; color:#2c3e50;">
            🚀 You can now:
          </p>
          <ul style="margin-top:10px; padding-left:20px; color:#555; font-size:14px;">
            <li>Add new products</li>
            <li>Manage your inventory</li>
            <li>Start selling to customers</li>
          </ul>
        </div>

        <p style="font-size:14px; color:#555;">
          Welcome to the ${companyName} seller community. We wish you great success!
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
        
        <h2 style="text-align:center; color:#e74c3c;">⚠️ Application Not Approved</h2>

        <p style="font-size:16px; color:#333;">
          Dear <strong>${name}</strong>,
        </p>

        <p style="font-size:15px; color:#333;">
          We regret to inform you that your seller application for <strong>${shopName}</strong> has not been approved at this time.
        </p>

        <div style="background:#fdecea; padding:15px; border-radius:8px; margin:20px 0;">
          <p style="margin:0; font-size:15px; color:#2c3e50;">
            📌 Possible reasons:
          </p>
          <ul style="margin-top:10px; padding-left:20px; color:#555; font-size:14px;">
            <li>Incomplete or incorrect details</li>
            <li>Verification documents not valid</li>
            <li>Policy compliance issues</li>
          </ul>
        </div>

        <p style="font-size:14px; color:#555;">
          You may review your details and reapply. For assistance, please contact our support team.
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
}

module.exports = sellerApprovalStatusMail;