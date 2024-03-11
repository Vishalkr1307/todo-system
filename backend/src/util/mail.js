const nodemailer = require("nodemailer");
const mailgen = require("mailgen");
const Otp = require("..//module/otp");
const User = require("..//module/user");
const bcrypt = require("bcrypt");
require("dotenv").config();

module.exports = async (email) => {
  const transport = await nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_PASSWORD,
    },
  });
  const user = await User.findOne({ email: email }).lean().exec();
  if (!user) {
    throw new Error("User not found");
  }
  const otp = Math.round(Math.random() * 9000 + 1000).toString();
  const hashOtp = bcrypt.hashSync(otp, 8);
  const otpVerification = await Otp.create({
    userId: user._id,
    otp: hashOtp,
    createdAt: Date.now(),
    expireAt: Date.now() + 1000 * 60 * 2,
  });
  await otpVerification.save();

  const MailGenerator = new mailgen({
    theme: "default",
    product: {
      name: "Data-System",
      link: "http://localhost:2345",
    },
  });

  const emailData = {
    body: {
      name: user?.name,
      intro: "Welcome to Data-System! We're very excited to have you on board.",
      action: {
        instructions: "To get started Data-System, please click here:",
        button: {
          color: "#22BC66", // Optional action button color
          text: otp,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };

  const emailBody = MailGenerator.generate(emailData);
  const emailText = MailGenerator.generatePlaintext(emailData);

  const info = await transport.sendMail({
    from: process.env.GMAIL_EMAIL,
    to: email,
    subject: "OtpVerification for login",
    text: emailText,
    html: emailBody,
  });
  if (info.messageId) {
    return {
      status: `otp sent your ${user.email}`,
      email: user.email,
      userId: otpVerification.userId,
      expireAt: `${Math.floor((new Date(otpVerification.expireAt).getTime()-Date.now())/1000)}seconds`,
    };
  }
};
