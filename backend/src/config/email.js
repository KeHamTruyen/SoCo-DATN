import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

transporter
    .verify()
    .then(() => console.log("✅ Email service connected"))
    .catch((err) =>
        console.warn("⚠️  Email service not configured:", err.message),
    );

export default transporter;
