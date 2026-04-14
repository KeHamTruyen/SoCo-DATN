import nodemailer from "nodemailer";

const smtpUser = process.env.SMTP_USER?.trim();
const smtpPass = process.env.SMTP_PASS?.trim();
const smtpConfigured = Boolean(smtpUser && smtpPass);

/** Avoid passing empty auth — Nodemailer then fails verify with "Missing credentials for PLAIN". */
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    family: 4,
    ...(smtpConfigured ? { auth: { user: smtpUser, pass: smtpPass } } : {}),
});

if (smtpConfigured) {
    transporter
        .verify()
        .then(() => console.log("✅ Email service connected"))
        .catch((err) =>
            console.warn("⚠️  Email service not configured:", err.message),
        );
} else {
    console.warn(
        "⚠️  Email service disabled: set SMTP_USER and SMTP_PASS in backend/.env (see .env.example).",
    );
}

export default transporter;
