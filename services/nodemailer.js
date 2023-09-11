const nodemailer = require("nodemailer");
require("dotenv").config();

// const config = {
//   host: "smtp.sendgrid.net",
//   port: 587,
//   secure: true,
//   auth: {
//     user: "apikey",
//     pass: process.env.API_KEY,
//   },
// };

// const transporter = nodemailer.createTransport(config);
// const emailOptions = {
//   from: "your-email@test.pl",
//   to: "noresponse@gmail.com",
//   subject: "Nodemailer test",
//   text: "Cześć. Testujemy wysyłanie wiadomości!",
// };

// transporter
//   .sendMail(emailOptions)
//   .then((info) => console.log(info))
//   .catch((err) => console.log(err));

  async function sendMail(mailOptions) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail(mailOptions);
}
module.exports = sendMail;