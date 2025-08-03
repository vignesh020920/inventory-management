const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Email templates
const emailTemplates = {
  emailVerification: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
        <h1 style="color: #333;">Email Verification</h1>
      </div>
      <div style="padding: 20px;">
        <p>Hello ${data.name},</p>
        <p>Thank you for registering! Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.frontendUrl}/verify-email/${data.verificationToken}" 
             style="background-color: #007bff; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p>If you didn't create an account, please ignore this email.</p>
        <p>Best regards,<br>The Team</p>
      </div>
    </div>
  `,

  passwordReset: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
        <h1 style="color: #333;">Password Reset</h1>
      </div>
      <div style="padding: 20px;">
        <p>Hello ${data.name},</p>
        <p>You requested a password reset. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.frontendUrl}/reset-password/${data.resetToken}" 
             style="background-color: #dc3545; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The Team</p>
      </div>
    </div>
  `,

  welcome: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
        <h1 style="color: #333;">Welcome!</h1>
      </div>
      <div style="padding: 20px;">
        <p>Hello ${data.name},</p>
        <p>Welcome to our platform! We're excited to have you on board.</p>
        <p>Get started by exploring our features and connecting with other users.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.frontendUrl}/dashboard" 
             style="background-color: #28a745; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The Team</p>
      </div>
    </div>
  `,
};

// Send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    // Get template content
    let html = "";
    if (options.template && emailTemplates[options.template]) {
      html = emailTemplates[options.template](options.data);
    } else if (options.html) {
      html = options.html;
    }

    const mailOptions = {
      from: `"${process.env.FROM_NAME || "Your App"}" <${
        process.env.SMTP_MAIL
      }>`,
      to: options.to,
      subject: options.subject,
      html: html,
      text: options.text,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent: ", info.messageId);
    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("✅ Email configuration is valid");
    return true;
  } catch (error) {
    console.error("❌ Email configuration is invalid:", error.message);
    return false;
  }
};

module.exports = {
  sendEmail,
  testEmailConfig,
};
