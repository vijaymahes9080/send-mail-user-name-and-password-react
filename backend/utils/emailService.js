const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// Create standard Nodemailer transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends a welcome email containing user details and the raw password.
 * 
 * @param {Object} user - The mongoose user instance.
 * @param {string} rawPassword - The raw password entered during registration.
 */
const sendWelcomeEmail = async (user, rawPassword = '') => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // Generate a secure, short-lived password reset/setup token
    const setupToken = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET || 'temp_jwt_secret',
      { expiresIn: '1h' }
    );
    
    const loginUrl = `${frontendUrl}/login`;
    const setupPasswordUrl = `${frontendUrl}/reset-password?token=${setupToken}`;

    const mailOptions = {
      from: `"Welcome Support" <${process.env.EMAIL_USER || 'noreply@platform.com'}>`,
      to: user.email,
      subject: 'Welcome to Our Platform - Account Credentials',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">Welcome to Our Platform!</h2>
          </div>
          
          <p style="color: #334155; font-size: 16px; line-height: 1.5;">Hi <strong>${user.fullName}</strong>,</p>
          <p style="color: #475569; font-size: 15px; line-height: 1.5;">Your registration is complete. Welcome aboard! Below are your registered account credentials:</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #f1f5f9; margin: 24px 0;">
            <h3 style="margin-top: 0; color: #1e293b; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Account Details:</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 140px;">Full Name</td>
                <td style="padding: 8px 0; color: #0f172a;">${user.fullName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Username</td>
                <td style="padding: 8px 0; color: #0f172a; font-family: monospace;">${user.username}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Registered Email</td>
                <td style="padding: 8px 0; color: #0f172a;">${user.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Password</td>
                <td style="padding: 8px 0; color: #0f172a; font-family: monospace;">${rawPassword}</td>
              </tr>
            </table>
          </div>
          
          <p style="color: #475569; font-size: 14px; line-height: 1.5; margin-bottom: 10px;">You can login directly using your credentials here:</p>
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${loginUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">Go to Login Page</a>
          </div>
          
          <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 13px; color: #b45309; line-height: 1.4;">
              <strong>Security reminder:</strong> Please keep your login credentials safe and do not share this email with others.
            </p>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
            This is an automated transactional notification. Please do not reply directly.
          </p>
        </div>
      `
    };

    // Skip sending and log a printout if standard fallback credentials remain configured
    if (process.env.EMAIL_USER === 'example@gmail.com' || process.env.EMAIL_PASS === 'xxxx xxxx xxxx xxxx' || !process.env.EMAIL_USER) {
      console.log('\n=== [DEVELOPMENT EMAIL LOG START] ===');
      console.log(`TO:       ${user.email}`);
      console.log(`SUBJECT:  ${mailOptions.subject}`);
      console.log(`LOGIN:    ${loginUrl}`);
      console.log(`SETUP PW: ${setupPasswordUrl}`);
      console.log('=== [DEVELOPMENT EMAIL LOG END] ===\n');
      return { success: true, mode: 'debug', setupToken };
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Nodemailer] Successfully sent registration email to ${user.email} (ID: ${info.messageId})`);
    return { success: true, mode: 'sent', messageId: info.messageId, setupToken };
  } catch (error) {
    console.error(`[Nodemailer Warning] Could not send welcome email to ${user.email}: ${error.message}`);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
};
