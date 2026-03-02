import transporter from "../config/email.js";

class EmailService {
    constructor() {
        this.from =
            process.env.SMTP_FROM || '"SoCo Platform" <noreply@soco.vn>';
    }

    async sendMail({ to, subject, html, text }) {
        return transporter.sendMail({
            from: this.from,
            to,
            subject,
            html,
            text,
        });
    }

    /**
     * Send email verification link after registration
     */
    async sendVerificationEmail(email, token) {
        const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
        return this.sendMail({
            to: email,
            subject: "Xác thực tài khoản SoCo",
            html: `
        <h2>Chào mừng bạn đến với SoCo!</h2>
        <p>Nhấn vào link bên dưới để xác thực tài khoản:</p>
        <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:8px;">
          Xác thực tài khoản
        </a>
        <p>Link có hiệu lực trong 24 giờ.</p>
      `,
        });
    }

    /**
     * Send OTP code for 2FA
     */
    async sendOtpEmail(email, otp) {
        return this.sendMail({
            to: email,
            subject: "Mã xác thực OTP - SoCo",
            html: `
        <h2>Mã OTP của bạn</h2>
        <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#4F46E5;">${otp}</p>
        <p>Mã có hiệu lực trong 5 phút. Không chia sẻ mã này với bất kỳ ai.</p>
      `,
        });
    }

    /**
     * Send password reset link / OTP
     */
    async sendPasswordResetEmail(email, token) {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        return this.sendMail({
            to: email,
            subject: "Đặt lại mật khẩu - SoCo",
            html: `
        <h2>Đặt lại mật khẩu</h2>
        <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào link bên dưới:</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:8px;">
          Đặt lại mật khẩu
        </a>
        <p>Link có hiệu lực trong 1 giờ. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
      `,
        });
    }

    /**
     * Send seller verification confirmation
     */
    async sendSellerApprovalEmail(email, shopName) {
        return this.sendMail({
            to: email,
            subject: "Đăng ký Seller được chấp nhận - SoCo",
            html: `
        <h2>Chúc mừng!</h2>
        <p>Shop <strong>${shopName}</strong> của bạn đã được phê duyệt.</p>
        <p>Bạn có thể bắt đầu đăng sản phẩm và bán hàng ngay bây giờ.</p>
      `,
        });
    }

    /**
     * Generic notification email
     */
    async sendNotificationEmail(email, title, message) {
        return this.sendMail({
            to: email,
            subject: `${title} - SoCo`,
            html: `
        <h2>${title}</h2>
        <p>${message}</p>
      `,
        });
    }
}

export default new EmailService();
