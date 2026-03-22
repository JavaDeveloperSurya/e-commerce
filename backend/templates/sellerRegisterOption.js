const sellerPendingMail = (sellerEmail, sellerName) => {
    const companyName = process.env.NAME;
  return {
    to: sellerEmail,
    subject: `${companyName} Seller Registration Successful (Verification Pending)`,

    text: `
Dear ${sellerName},

Thank you for registering as a seller on ${companyName}.

Your account has been successfully created and is currently under review by our admin team.

What happens next?
- Our admin team will review your details.
- Once approved, you will receive a confirmation email.
- After approval, you can start adding and managing your products.

Note:
Please ensure all your submitted details are accurate to avoid delays.

If you did not initiate this registration, please ignore this email.

- ${companyName} Team
`,

    html: `
    <div style="font-family: Arial, sans-serif; background:#f5f6fa; padding:30px;">
  
      <div style="max-width:520px; margin:auto; background:#ffffff; border-radius:10px; padding:25px; border:1px solid #e6e6e6;">
        
        <h2 style="text-align:center; color:#2c3e50;">Seller Registration Successful</h2>

        <p style="font-size:16px; color:#333;">
          Dear <strong>${sellerName}</strong>,
        </p>

        <p style="font-size:15px; color:#333;">
          Thank you for registering as a seller on ${companyName}.
        </p>

        <p style="font-size:15px; color:#333;">
          Your account has been successfully created and is currently under review by our admin team. 
          This verification process ensures the quality and trustworthiness of all sellers on our platform.
        </p>

        <div style="background:#f1f2f6; padding:15px; border-radius:8px; margin:20px 0;">
          <p style="margin:0; font-size:15px; color:#2c3e50;">
            ⏳ <strong>What happens next?</strong>
          </p>
          <ul style="margin-top:10px; padding-left:20px; color:#555; font-size:14px;">
            <li>Our admin team will review your details.</li>
            <li>Once approved, you will receive a confirmation email.</li>
            <li>After approval, you can start adding and managing your products.</li>
          </ul>
        </div>

        <p style="font-size:14px; color:#555;">
          📌 <strong>Note:</strong> Please make sure that all the information provided during registration is accurate to avoid delays in the verification process.
        </p>

        <p style="font-size:14px; color:#555;">
          If you have any questions or need assistance, feel free to contact our support team.
        </p>

        <p style="font-size:14px; color:#555;">
          We appreciate your patience and look forward to having you onboard!
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

module.exports = sellerPendingMail;