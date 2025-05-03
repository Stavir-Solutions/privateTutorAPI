const nodemailer = require('nodemailer');
 
 // Configure the email transporter (Gmail example)
 const transporter = nodemailer.createTransport({
   service: 'gmail', // You can use any SMTP service, for Gmail it's 'gmail'
   auth: {
     user: 'your-email@gmail.com',  // Replace with your email
     pass: 'your-app-password',  // Use an App Password if 2FA is enabled
   },
 });
 
 async function sendEmail(to, subject, body) {
     const mailOptions = {
       from: 'keerthi@stavir.com', 
       to: to,                     
       subject: subject,           
       text: body,                 
       html: `<p><strong>Click here to reset your password:</strong> <a href="${body}">${body}</a></p>`, // HTML content
     };
 
   try {
     await transporter.sendMail(mailOptions);
     console.log(`Email sent to ${to}`);
   } catch (error) {
     console.error(`Failed to send email: ${error.message}`);
   }
 }
 
 module.exports = { sendEmail };