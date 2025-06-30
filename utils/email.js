const nodemailer = require('nodemailer');
const path = require('path');
const ejs = require('ejs');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'Gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Function to render email template
const renderTemplate = async (template, data) => {
  try {
    const templatePath = path.join(__dirname, '..', 'email-templates', `${template}.ejs`);
    return await ejs.renderFile(templatePath, data);
  } catch (error) {
    console.error('Error rendering email template:', error);
    throw error;
  }
};

exports.sendResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  const html = await renderTemplate('reset-password', {
    resetUrl,
    logoUrl: `${process.env.FRONTEND_URL}/assets/images/logo.png`,
    supportEmail: process.env.SUPPORT_EMAIL || 'support@salticsx.com'
  });

  await transporter.sendMail({
    from: `"SalticsX Support" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Password Reset Request',
    html
  });
};

exports.sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  const html = await renderTemplate('verify-email', {
    verificationUrl,
    logoUrl: `${process.env.FRONTEND_URL}/assets/images/logo.png`,
    supportEmail: process.env.SUPPORT_EMAIL || 'support@salticsx.com'
  });

  await transporter.sendMail({
    from: `"SalticsX Support" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Verify Your Email Address',
    html
  });
};