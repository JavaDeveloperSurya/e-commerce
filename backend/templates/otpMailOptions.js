const mailOptions = (userEmail, otp) => {
    const companyName = process.env.NAME;
  return {
    to: userEmail,
    subject: `Your ${companyName} OTP Code (Valid for 5 Minutes)`,

    text: `
Your One-Time Password (OTP) for ${companyName} login is: ${otp}

This OTP will expire in 5 minutes.
Do not share this code with anyone.

If you did not request this login, please ignore this email.

-${companyName} Team
`,

    html: `
    <div style="font-family: Arial, sans-serif; background:#f5f6fa; padding:30px;">
      
      <div style="max-width:500px; margin:auto; background:#ffffff; border-radius:10px; padding:25px; border:1px solid #e6e6e6;">
        
        <h2 style="text-align:center; color:#2c3e50;">${companyName}</h2>
        
        <p style="font-size:16px; color:#333;">
          Hello,
        </p>

        <p style="font-size:16px; color:#333;">
          Use the following One-Time Password (OTP) to sign in to your ${companyName} account:
        </p>

        <div style="text-align:center; margin:25px 0;">
          <span style="
            background:#2c3e50;
            color:#ffffff;
            font-size:28px;
            letter-spacing:4px;
            padding:12px 28px;
            border-radius:8px;
            display:inline-block;
          ">
            ${otp}
          </span>
        </div>

        <p style="font-size:14px; color:#555;">
          ⏳ This OTP will expire in <strong>5 minutes</strong>.
        </p>

        <p style="font-size:14px; color:#555;">
          For security reasons, please do not share this code with anyone.
        </p>

        <p style="font-size:14px; color:#555;">
          If you didn't request this login, you can safely ignore this email.
        </p>

        <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">

        <p style="font-size:12px; color:#888; text-align:center;">
          © ${new Date().getFullYear()} ${companyName}. All rights reserved.
        </p>

      </div>
    </div>
    `,
  };
};

module.exports = mailOptions;