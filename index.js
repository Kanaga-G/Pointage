const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "xpertproformation@gmail.com",
    pass: "ojcrwostxxhhdonf",
  },
});

async function sendMail() {
  try {
    const info = await transporter.sendMail({
      from: '"Test Node" <xpertproformation@gmail.com>',
      to: "DESTINATAIRE@gmail.com",
      subject: "Test email Node.js",
      text: "Si tu reçois ce mail, ça marche !",
      html: "<h2>Email envoyé depuis Node.js avec succès</h2>",
    });

    console.log("Email envoyé :", info.messageId);
  } catch (err) {
    console.error("Erreur :", err);
  }
}

sendMail();
