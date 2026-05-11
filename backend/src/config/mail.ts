import nodemailer from 'nodemailer';
import config from './env.js';

export const createSmtpTransport = () => {
  if (!config.mail.smtp.host || !config.mail.smtp.user || !config.mail.smtp.pass) {
    throw new Error('SMTP configuration is incomplete');
  }

  return nodemailer.createTransport({
    host: config.mail.smtp.host,
    port: config.mail.smtp.port,
    secure: config.mail.smtp.secure,
    auth: {
      user: config.mail.smtp.user,
      pass: config.mail.smtp.pass,
    },
  });
};

export const testSmtpConnection = async (): Promise<boolean> => {
  try {
    const transporter = createSmtpTransport();
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('SMTP connection test failed:', error);
    return false;
  }
};

export default {
  createSmtpTransport,
  testSmtpConnection,
};
