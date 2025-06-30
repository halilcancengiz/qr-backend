import nodemailer from "nodemailer";


const imagePath = "./public/assets/logo.png";

const sendForgotPasswordEmail = async (to, subject, resetLink) => {
    try {
        // 1️⃣ E-posta gönderimi için SMTP ayarlarını yap
        const transporter = nodemailer.createTransport({
            service: "gmail", // Gmail kullanıyorsanız
            auth: {
                user: process.env.EMAIL_USER, // Gönderen e-posta adresi (örneğin: noreply@domain.com)
                pass: process.env.EMAIL_PASS, // E-posta şifresi veya uygulama şifresi
            },
            tls: {
                rejectUnauthorized: false, // Güvenlik sertifikası doğrulaması için TLS kullanma (bazı durumlarda gerekebilir)
            },
        });




        let htmlContent = `
           <div style="max-width: 400px; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); text-align: center;">
    <img src="cid:uniqueLogo" alt="Logo" width="75" height="auto" style="margin-bottom: 10px;"/>
    <p style="color: #333; font-size: 14px; line-height: 1.5;">
        Hesabınızla ilgili bir şifre sıfırlama isteği aldık. Güvenliğiniz bizim için önemli! Eğer bu isteği siz yaptıysanız, aşağıdaki butona tıklayarak yeni bir şifre oluşturabilirsiniz.
    </p>
    <p style="color: #555; font-size: 12px; line-height: 1.5;">
        Bu bağlantı, yalnızca <b>60 dakika</b> boyunca geçerli olacaktır. Belirtilen süre içinde yeni bir şifre belirlemezseniz, tekrar bir sıfırlama isteğinde bulunmanız gerekecektir.
    </p>
    <p style="color: #777; font-size: 12px;">
        Eğer bu isteği siz yapmadıysanız, endişelenmenize gerek yok. Hesabınız güvende kalacaktır ve herhangi bir işlem yapılmayacaktır.
    </p>
    <p style="color: #777; font-size: 12px;">
        Herhangi bir sorun yaşarsanız veya desteğe ihtiyacınız olursa, bizimle iletişime geçmekten çekinmeyin.
    </p>
    <a href="${resetLink}" style="display: inline-block; background-color:rgba(0, 0, 0, 0.84); color: white; padding: 10px 20px; text-align: center; text-decoration: none; border-radius: 5px; font-size: 14px; font-weight: bold; margin-top: 10px;">
        Yeni Şifre Oluştur
    </a>
    <p style="margin-top: 20px; color: #333; font-size: 14px;"><b>Teşekkürler</b></p>
    <p style="color: #555; font-size: 12px;"><b>Destek Ekibi</b></p>
</div>

        `

        // 2️⃣ E-posta içeriğini oluştur
        const mailOptions = {
            from: process.env.EMAIL_USER, // Kimden gönderildiği
            to, // Alıcı
            subject, // Konu
            html: htmlContent,
            attachments: [
                {
                    filename: "logo.png",
                    path: imagePath,
                    cid: "uniqueLogo", // HTML içinde kullanılacak Content-ID
                },
            ],
        };

        // 3️⃣ E-posta gönder
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
        return true;
    } catch (error) {
        console.error("Email send error:", error.message); // Daha ayrıntılı hata mesajı
        if (error.response) {
            console.error("SMTP Response:", error.response); // SMTP sunucusundan gelen yanıtı göster
        }
        return false;
    }
};

export default sendForgotPasswordEmail;
