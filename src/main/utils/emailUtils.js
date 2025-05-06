const nodemailer = require('nodemailer');

// Configure the email transporter (Gmail example)
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use any SMTP service, for Gmail it's 'gmail'
    auth: {
        user: process.env.USERNAME,  // Replace with your email
        pass: process.env.APPPASSWORD,  // Use an App Password if 2FA is enabled
    },
});

async function sendEmail(to, emailsubject, emailBody) {
    const mailOptions = {
        from: 'keerthi@stavir.com',
        to: user.email,
        subject: emailsubject,
        text: emailBody

    };
    console.log('Email subject:', mailOptions);

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error(`Failed to send email: ${error.message}`);
    }
}

module.exports = {sendEmail};
