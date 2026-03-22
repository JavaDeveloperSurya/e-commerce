const productApprovalPendingMail = (sellerEmail, sellerName, productName) => {
  const companyName = process.env.NAME;

  return {
    to: sellerEmail,
    subject: `${companyName} Product Submitted (Approval Pending)`,

    text: `
Dear ${sellerName},

Your product "${productName}" has been successfully submitted on ${companyName}.

It is currently under review by our admin team.

What happens next?
- Our admin team will verify your product details.
- Once approved, your product will be published on the platform.
- You will receive a confirmation email after approval.

Note:
Please ensure your product details (price, description, images) are accurate to avoid rejection.

If you did not submit this product, please contact support immediately.

- ${companyName} Team
`,

    html: `
    <div style="font-family: Arial, sans-serif; background:#f5f6fa; padding:30px;">
  
      <div style="max-width:520px; margin:auto; background:#ffffff; border-radius:10px; padding:25px; border:1px solid #e6e6e6;">
        
        <h2 style="text-align:center; color:#2c3e50;">Product Submitted Successfully</h2>

        <p style="font-size:16px; color:#333;">
          Dear <strong>${sellerName}</strong>,
        </p>

        <p style="font-size:15px; color:#333;">
          Your product <strong>"${productName}"</strong> has been successfully submitted on ${companyName}.
        </p>

        <p style="font-size:15px; color:#333;">
          It is currently under review by our admin team to ensure quality and compliance with platform guidelines.
        </p>

        <div style="background:#f1f2f6; padding:15px; border-radius:8px; margin:20px 0;">
          <p style="margin:0; font-size:15px; color:#2c3e50;">
            ⏳ <strong>What happens next?</strong>
          </p>
          <ul style="margin-top:10px; padding-left:20px; color:#555; font-size:14px;">
            <li>Our admin team will review your product details.</li>
            <li>Once approved, your product will be published.</li>
            <li>You will receive a confirmation email.</li>
          </ul>
        </div>

        <p style="font-size:14px; color:#555;">
          📌 <strong>Note:</strong> Ensure that your product details such as price, description, and images are accurate to avoid rejection.
        </p>

        <p style="font-size:14px; color:#555;">
          If you have any questions, feel free to contact our support team.
        </p>

        <p style="font-size:14px; color:#555;">
          Thank you for selling with us!
        </p>

        <p style="font-size:15px; color:#333; margin-top:20px;">
          Best regards,<br>
          <strong>${companyName} Team</strong>
        </p>

      </div>
    </div>
    `,
  };
};

module.exports = productApprovalPendingMail;