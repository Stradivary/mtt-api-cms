import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpEmail(email: string, name: string, otp: string) {
  const htmlContent = `
  <!DOCTYPE html>
  <html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Kode Verifikasi MTT</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f5f5f5;
        color: #333;
        line-height: 1.6;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: #ffffff;
        border: 1px solid #e0e0e0;
      }
      .header {
        padding: 24px 40px;
        background-color: #F4F9FF;
        display: flex;
        align-items: center;
      }
      .logo {
        max-height: 50px;
      }
      .content {
        padding: 40px;
      }
      h1 {
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 26px;
        color: black;
      }
      .greeting {
        font-size: 14px;
        margin-bottom: 14px;
        font-weight: 400;
        color: black;
      }
      .otp-label {
        font-size: 14px;
        margin-bottom: 16px;
        color: black;
      }
      .otp-code {
        font-size: 40px;
        font-weight: 700;
        letter-spacing: 8px;
        color: #10241B;
        margin: 20px 0;
        text-align: left;
      }
      .expire-info {
        font-size: 14px;
        color: black;
        margin-top: 12px;
        margin-bottom: 32px;
      }
      .expire-info b {
        font-weight: 600;
      }
      .note {
        font-size: 12px;
        margin-top: 32px;
        color: #4E5764;
        margin-bottom: 32px;
      }
      .divider {
        border-top: 1px solid #DBDBDB;
        margin: 24px 0;
      }
      .divider-bottom {
        border-top: 1px solid #EDEDED;
      }
      .footer {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;
        padding: 0 40px 40px;
        font-size: 10px;
        color: #A3A3A3;
        text-align: left;
      }
      .support {
        color: #CD3266;
        text-decoration: none;
        font-weight: 600;
      }
      .social-container {
        text-align: center;
      }
      .social-label {
        margin-top: 0px;
        font-size: 10px;
        color: #A3A3A3;
        margin-bottom: 6px;
      }
      .social-icons {
        display: inline-flex;
        gap: 10px;
      }
      .social-icon {
        background-color: #4C4C4C;
        color: #ffffff;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        text-decoration: none;
      }
      .social-icon i {
        font-size: 9px;
      }
      @media screen and (max-width: 600px) {
        .content {
          padding: 20px;
        }
        .otp-code {
          font-size: 28px;
        }
      }
    </style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://mtt.or.id/assets/logo/logo.png" alt="MTT" class="logo" width="auto" />
      </div>
      <div class="content">
        <h1>Kode Verifikasi MTT</h1>
        <div class="greeting">Halo ${name},</div>
        <div class="otp-label">
          Berikut ini adalah kode verifikasi rahasia Anda:
        </div>
        <div class="otp-code">${otp}</div>
        <div class="expire-info">
          Kode ini berlaku selama <b>2 menit</b>. Jangan bagikan kepada siapa pun.
        </div>
        <div class="divider"></div>
        <div class="note">
          Email ini dikirim otomatis oleh sistem MTT. Mohon tidak membalas.
          Jika Anda membutuhkan bantuan, silakan <a href="#" class="support">hubungi tim kami.</a>
        </div>
        <div class="divider-bottom"></div>
      </div>
      <div class="footer">
        <div>
          &copy; 2025 MTT. Seluruh Hak Dilindungi Undang-Undang.<br />
          Yayasan Masjid Telkomsel Taqwa
        </div>
        <div class="social-container">
          <p class="social-label">Ikuti Kami</p>
          <div class="social-icons">
            <a href="https://instagram.com/masjidtelkomseltaqwa" target="_blank" class="social-icon">
              <i class="fa-brands fa-instagram"></i>
            </a>
            <a href="https://www.linkedin.com/company/masjidtelkomseltaqwa/" target="_blank" class="social-icon">
              <i class="fa-brands fa-linkedin-in"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  const { data, error } = await resend.emails.send({
    from: 'KODE OTP MTT <ramouz.muzacky@mtt.or.id>',
    to: email,
    subject: 'Kode OTP Anda dari MTT',
    html: htmlContent,
  });

  if (error) throw new Error(error.message);
  return data;
}
