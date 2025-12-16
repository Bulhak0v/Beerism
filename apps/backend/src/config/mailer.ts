import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "yeahiwritestuff@gmail.com",
    pass: "edzkjaokdjhskhay",
  },
});

export const sendResetEmail = async (to: string, newPassword: string, nickname: string) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #F2EFE5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #FCFCFC; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .header { background-color: #5C4033; padding: 30px; text-align: center; }
        .header h1 { color: #FCFCFC; margin: 0; font-size: 28px; letter-spacing: 1px; }
        .content { padding: 40px; color: #202020; text-align: center; }
        .greeting { font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #5C4033; }
        .message { font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 30px; }
        .password-box { background-color: #F2EFE5; border: 2px dashed #5C4033; padding: 15px; font-size: 24px; font-weight: bold; color: #202020; display: inline-block; margin-bottom: 30px; letter-spacing: 2px; border-radius: 8px; }
        .footer { background-color: #eee; padding: 20px; text-align: center; font-size: 12px; color: #777; }
        .btn { background-color: #5C4033; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Beerism</h1>
        </div>
        <div class="content">
          <p class="greeting">Cheers, ${nickname}!</p>
          <p class="message">
            We received a request to reset your password. No worries, it happens to the best of us after a few pints.<br><br>
            Here is your new temporary password:
          </p>
          
          <div class="password-box">${newPassword}</div>
          
          <p class="message">
            Please log in using this password and change it in your Profile settings immediately.
          </p>
          
          <a href="${process.env.FRONTEND_URL}/auth" class="btn">Log In Now</a>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Beerism. Drink responsibly.
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Beerism Support" <${process.env.SMTP_USER}>`,
    to,
    subject: "🍺 Your New Beerism Password",
    html: htmlContent,
  });
};