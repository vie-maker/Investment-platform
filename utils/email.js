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
  const templatePath = path.join(__dirname, '..', 'email-template', `${template}.ejs`);
  return await ejs.renderFile(templatePath, data);
};

// Send email function
const sendEmail = async (options) => {
  try {
    let html;

    if (options.template) {
      html = await renderTemplate(options.template, options.data);
    } else {
      html = options.html;
    }

    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      html: html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = sendEmail;