import transporter from "../config/email.js";

function escapeHtml(s) {
    if (s == null || s === "") return "";
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

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
     * Send 6-digit OTP code for email verification after registration
     */
    async sendVerificationOtpEmail(email, otp) {
        return this.sendMail({
            to: email,
            subject: "Mã xác thực tài khoản SoCo",
            html: `
        <h2>Chào mừng bạn đến với SoCo!</h2>
        <p>Nhập mã 6 chữ số bên dưới để xác thực tài khoản của bạn:</p>
        <p style="font-size:36px;font-weight:bold;letter-spacing:10px;color:#4F46E5;margin:24px 0;">${otp}</p>
        <p>Mã có hiệu lực trong <strong>10 phút</strong>. Không chia sẻ mã này với bất kỳ ai.</p>
        <p style="color:#888;font-size:13px;">Nếu bạn không đăng ký tài khoản SoCo, hãy bỏ qua email này.</p>
      `,
        });
    }

    /**
     * @deprecated Use sendVerificationOtpEmail instead
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
        const safeName = escapeHtml(shopName || "của bạn");
        const dashboardUrl = `${process.env.FRONTEND_URL || ""}`.replace(/\/$/, "") + "/seller/dashboard";
        const safeDashboardUrl = escapeHtml(dashboardUrl);
        return this.sendMail({
            to: email,
            subject: "Đăng ký Seller được chấp nhận - SoCo",
            html: `
        <h2>Chúc mừng!</h2>
        <p>Đơn đăng ký trở thành người bán trên <strong>SoCo</strong> cho shop <strong>${safeName}</strong> đã được <strong>phê duyệt</strong>.</p>
        <p>Tài khoản của bạn đã được cấp quyền <strong>Người bán (Seller)</strong>. Bạn có thể đăng nhập và sử dụng Trung tâm người bán để quản lý cửa hàng.</p>
        <p><strong>Gợi ý các bước tiếp theo:</strong></p>
        <ul style="margin:12px 0;padding-left:20px;line-height:1.6;">
          <li>Vào <strong>Trung tâm người bán</strong> để xem tổng quan đơn hàng và doanh thu.</li>
          <li>Tạo và đăng sản phẩm: thêm hình ảnh, mô tả, giá và tồn kho.</li>
          <li>Cập nhật thông tin shop (nếu cần) và theo dõi thông báo từ SoCo.</li>
          <li>Tuân thủ quy định nền tảng về hàng hóa, vận chuyển và chăm sóc khách hàng.</li>
        </ul>
        <p style="margin:24px 0;">
          <a href="${dashboardUrl}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
            Mở Trung tâm người bán
          </a>
        </p>
        <p style="color:#888;font-size:13px;">Nếu nút không hoạt động, hãy sao chép liên kết: <a href="${dashboardUrl}" style="color:#4F46E5;">${safeDashboardUrl}</a></p>
        <p style="color:#888;font-size:13px;">Cảm ơn bạn đã đồng hành cùng SoCo. Nếu cần hỗ trợ, vui lòng liên hệ bộ phận chăm sóc khách hàng.</p>
      `,
            text: `Chúc mừng! Đơn đăng ký Seller cho shop "${shopName || "của bạn"}" đã được phê duyệt.\n\n` +
                `Mở Trung tâm người bán: ${dashboardUrl}\n\n` +
                `— SoCo`,
        });
    }

    /**
     * Notify applicant that seller registration was rejected (admin reason optional).
     */
    async sendSellerRejectionEmail(to, { shopName, reason }) {
        const safeName = escapeHtml(shopName || "");
        const safeReason = escapeHtml(reason || "");
        const reasonBlock = safeReason
            ? `<p><strong>Lý do:</strong> ${safeReason}</p>`
            : "<p>Chi tiết cụ thể không được công bố.</p>";
        const shopLine = safeName
            ? `<p>Đơn đăng ký cho shop <strong>${safeName}</strong> trên SoCo <strong>không được phê duyệt</strong>.</p>`
            : "<p>Đơn đăng ký trở thành người bán trên SoCo của bạn <strong>không được phê duyệt</strong>.</p>";
        return this.sendMail({
            to,
            subject: "Đăng ký Seller không được chấp nhận - SoCo",
            html: `
        <h2>Thông báo từ chối đơn đăng ký Seller</h2>
        ${shopLine}
        ${reasonBlock}
        <p>Bạn có thể cập nhật hồ sơ và gửi lại đơn đăng ký sau khi đáp ứng đủ yêu cầu.</p>
        <p style="color:#888;font-size:13px;">Nếu bạn có thắc mắc, vui lòng liên hệ bộ phận hỗ trợ SoCo.</p>
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
