import nodemailer from "nodemailer";
import { config } from "../config/env.ts";

export interface MailPayload {
  name: string;
  senderEmail: string;
  subject: string;
  message: string;
  ip: string;
  country: string;
  city?: string;
  browser?: string;
  platform?: string;
}

export async function sendContactEmail(payload: MailPayload): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
  try {
    const isConfigured = config.emailUser && config.emailPassword;

    let transporter: nodemailer.Transporter;

    if (isConfigured) {
      // Real developer configured transporter
      transporter = nodemailer.createTransport({
        host: config.emailHost,
        port: config.emailPort,
        secure: config.emailPort === 465, // True for 465, false for other ports
        auth: {
          user: config.emailUser,
          pass: config.emailPassword,
        },
      });
    } else {
      // Ethereal SMTP fallback for secure testing in dev/preview
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const fromAddress = isConfigured ? config.emailUser : payload.senderEmail;

    const mailOptions = {
      from: `"Razma Portfolio - ${payload.name}" <${fromAddress}>`,
      replyTo: payload.senderEmail,
      to: "razafimaharavomarion@gmail.com",
      subject: `[Portfolio Contact] ${payload.subject}`,
      text: `
        Nouveau message reçu depuis votre portfolio professionnel.

        Nom: ${payload.name}
        Email: ${payload.senderEmail}
        Sujet: ${payload.subject}
        Message:
        ${payload.message}

        Détails Techniques:
        IP publique : ${payload.ip}
        Pays : ${payload.country}
        Ville : ${payload.city || "Non identifiée"}
        Navigateur : ${payload.browser || "Non identifié"}
        Plateforme : ${payload.platform || "Non identifiée"}
        Date : ${new Date().toLocaleString("fr-FR")}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 8px; margin-top: 0;">Nouveau Message Portfolio</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 150px;">Nom:</td>
              <td style="padding: 8px 0;">${payload.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email Expéditeur:</td>
              <td style="padding: 8px 0;"><a href="mailto:${payload.senderEmail}" style="color: #4f46e5;">${payload.senderEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Sujet:</td>
              <td style="padding: 8px 0;">${payload.subject}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Date:</td>
              <td style="padding: 8px 0;">${new Date().toLocaleString("fr-FR")}</td>
            </tr>
          </table>
          
          <div style="background-color: #fff; border-left: 4px solid #4f46e5; padding: 15px; border-radius: 4px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <h4 style="margin: 0 0 10px 0; color: #111;">Message:</h4>
            <p style="margin: 0; white-space: pre-wrap;">${payload.message}</p>
          </div>

          <div style="font-size: 11px; color: #777; border-top: 1px solid #eee; padding-top: 10px;">
            <strong>Détails techniques :</strong><br/>
            IP publique : ${payload.ip}<br/>
            Pays : ${payload.country}<br/>
            Ville : ${payload.city || "Non identifiée"}<br/>
            Navigateur : ${payload.browser || "Non identifié"}<br/>
            Plateforme : ${payload.platform || "Non identifiée"}
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    let previewUrl: string | undefined;

    if (!isConfigured) {
      previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      console.log(`[Email Mock] Message envoyé ! URL de prévisualisation : ${previewUrl}`);
    }

    return { success: true, previewUrl };
  } catch (err: any) {
    console.error("Erreur d'envoi d'email:", err);
    return { success: false, error: err?.message || String(err) };
  }
}
