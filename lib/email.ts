import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { join } from 'path';
import { todayDate } from './utils';

const transporter = nodemailer.createTransport({
  host: process.env['SMTP_HOST'],
  port: Number(process.env['SMTP_PORT'] ?? 587),
  secure: process.env['SMTP_SECURE'] === 'true',
  auth: {
    user: process.env['SMTP_USER'],
    pass: process.env['SMTP_PASS'],
  },
});

export async function sendTeamInvitationEmail(
  email: string,
  teamName: string,
  inviterName: string,
  inviteToken: string,
) {
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invitation/${inviteToken}`;

  const templatePath = join(process.cwd(), 'emails', 'invitation.html');
  const template = readFileSync(templatePath, 'utf8');

  const html = applyTemplatePlaceholders(template, {
    frontUrl: process.env.NEXT_PUBLIC_APP_URL || '',
    teamName,
    inviterName,
    inviteUrl,
  });

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: `Invitación a unirte al equipo ${teamName} en Patio`,
    html,
  };

  return await transporter.sendMail(mailOptions);
}

interface ReminderEmailData {
  email: string;
  name: string;
  teamId: string;
  teamName: string;
}

function applyTemplatePlaceholders(
  template: string,
  data: Record<string, string>,
): string {
  return Object.entries(data).reduce(
    (result, [key, value]) =>
      result.replace(new RegExp(`#{${key}}`, 'g'), value),
    template,
  );
}

export async function sendReminderEmail({
  email,
  name,
  teamId,
  teamName,
}: ReminderEmailData) {
  const templatePath = join(process.cwd(), 'emails', 'reminder.html');
  const template = readFileSync(templatePath, 'utf8');

  // Create the voting link
  const voteLink = `${process.env.NEXT_PUBLIC_APP_URL}/team/${teamId}/${todayDate()}/mood`;

  const date = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = applyTemplatePlaceholders(template, {
    frontUrl: process.env.NEXT_PUBLIC_APP_URL || '',
    greetings: `¡Hola ${name}!`,
    today: `Hoy es ${date}`,
    question: `¿Estás feliz en ${teamName}?`,
    link: voteLink,
    thanks: 'Gracias por votar!',
    disclaimer:
      'Recibes este correo porque formas parte de un equipo de patio.',
  });

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: `Hoy es ${date}. ¿Estás feliz en ${teamName}?`,
    html,
  };

  return await transporter.sendMail(mailOptions);
}
