import nodemailer from "nodemailer";

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendTeamInvitationEmail(
  email: string,
  teamName: string,
  inviterName: string,
  inviteToken: string
) {
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/invitations/accept?token=${inviteToken}`;

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: `Invitación a unirte al equipo ${teamName}`,
    html: `
      <h2>Has sido invitado a unirte al equipo "${teamName}"</h2>
      <p>${inviterName} te ha invitado a unirte a su equipo en Patio.</p>
      <p>Haz clic en el siguiente enlace para aceptar la invitación:</p>
      <a href="${inviteUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Aceptar invitación</a>
      <p>Si no puedes hacer clic en el enlace, copia y pega esta URL en tu navegador:</p>
      <p>${inviteUrl}</p>
    `,
  };

  return await transporter.sendMail(mailOptions);
}

export async function sendMentionNotificationEmail(
  email: string,
  mentionerName: string,
  teamName: string,
  comment: string
) {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: `Te han mencionado en ${teamName}`,
    html: `
      <h2>Te han mencionado en el equipo "${teamName}"</h2>
      <p>${mentionerName} te ha mencionado en un comentario:</p>
      <blockquote style="border-left: 4px solid #007bff; padding-left: 16px; margin: 16px 0;">
        ${comment}
      </blockquote>
      <p>Ve a la aplicación para ver más detalles.</p>
    `,
  };

  return await transporter.sendMail(mailOptions);
}
