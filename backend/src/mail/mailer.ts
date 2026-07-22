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

export async function sendContactEmail(
  payload: MailPayload,
): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
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

    function sanitizeMessage(msg: string): string {
      return msg
        .split("\n")
        .map((line) => line.trim()) // enlève les espaces en début/fin de CHAQUE ligne
        .join("\n")
        .replace(/\n{3,}/g, "\n\n") // limite les lignes vides consécutives à 1 max
        .trim(); // enlève les retours à la ligne vides en tout début/fin
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
        ${sanitizeMessage(payload.message)}

        Détails Techniques:
        IP publique : ${payload.ip}
        Pays : ${payload.country}
        Ville : ${payload.city || "Non identifiée"}
        Navigateur : ${payload.browser || "Non identifié"}
        Plateforme : ${payload.platform || "Non identifiée"}
        Date : ${new Date().toLocaleString("fr-FR")}
      `,
      html: `
        <table
          role="presentation"
          cellpadding="0"
          cellspacing="0"
          border="0"
          width="100%"
          style="
            background:#f3f4f6;
            padding:30px 0;
            font-family:Arial,Helvetica,sans-serif;
          "
        >
          <tr>
            <td align="center">

              <table
                role="presentation"
                cellpadding="0"
                cellspacing="0"
                border="0"
                width="650"
                style="
                  width:650px;
                  max-width:650px;
                  background:#f8fafc;
                  border:1px solid #e5e7eb;
                  border-radius:14px;
                "
              >

                <!-- ================= HEADER ================= -->

                <tr>
                  <td
                    bgcolor="#1d4ed8"
                    style="
                      padding:20px 24px;
                      border-radius:14px 14px 0 0;
                    "
                  >

                    <table
                      role="presentation"
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                    >
                      <tr>

                        <!-- Logo + Nom -->

                        <td valign="middle">

                          <table
                            role="presentation"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                          >
                            <tr>

                              <td valign="middle">
                                <img
                                  src="https://brunelcreative.com/images/logo/avatar.png"
                                  width="42"
                                  height="42"
                                  alt="Razma"
                                  style="
                                    display:block;
                                    background:#ffffff;
                                    border-radius:10px;
                                  "
                                />
                              </td>

                              <td width="12"></td>

                              <td valign="middle">

                                <div
                                  style="
                                    color:#ffffff;
                                    font-size:28px;
                                    font-weight:bold;
                                    line-height:1;
                                  "
                                >
                                  Razma
                                </div>

                                <div
                                  style="
                                    color:#dbeafe;
                                    font-size:12px;
                                    letter-spacing:1px;
                                  "
                                >
                                  PORTFOLIO
                                </div>

                              </td>

                            </tr>
                          </table>

                        </td>

                        <!-- Métier -->

                        <td
                          align="right"
                          valign="middle"
                          style="
                            color:#ffffff;
                            font-size:15px;
                          "
                        >
                          Développeur Full Stack
                        </td>

                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- ================= CONTENU ================= -->

                <tr>
                  <td style="padding:28px;">

                    <!-- Informations -->

                    <table
                      role="presentation"
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="font-size:15px;color:#374151;"
                    >

                      <tr>
                        <td width="150" style="padding:10px 0;font-weight:bold;">
                          Nom :
                        </td>

                        <td style="padding:10px 0;">
                          ${payload.name}
                        </td>
                      </tr>

                      <tr>
                        <td style="padding:10px 0;font-weight:bold;">
                          Email Expéditeur :
                        </td>

                        <td style="padding:10px 0;">
                          <a
                            href="mailto:${payload.senderEmail}"
                            style="
                              color:#1d4ed8;
                              text-decoration:none;
                            "
                          >
                            ${payload.senderEmail}
                          </a>
                        </td>
                      </tr>

                      <tr>
                        <td style="padding:10px 0;font-weight:bold;">
                          Sujet :
                        </td>

                        <td style="padding:10px 0;">
                          ${payload.subject}
                        </td>
                      </tr>

                      <tr>
                        <td style="padding:10px 0;font-weight:bold;">
                          Date :
                        </td>

                        <td style="padding:10px 0;">
                          ${new Date().toLocaleString("fr-FR")}
                        </td>
                      </tr>

                    </table>

                    <!-- espace -->

                    <table
                      role="presentation"
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                    >
                      <tr>
                        <td height="20"></td>
                      </tr>
                    </table>

                    <!-- MESSAGE -->

                    <table
                      role="presentation"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      width="100%"
                      style="margin:0 0 25px 0;"
                    >
                      <tr>
                        <td
                          style="
                            background:#ffffff;
                            border-left:4px solid #2563eb;
                            border-radius:8px;
                            padding:20px;
                          "
                        >
                          <table
                            role="presentation"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                            width="100%"
                          >
                            <tr>
                              <td
                                style="
                                  font-size:18px;
                                  font-weight:bold;
                                  color:#111827;
                                  padding-bottom:18px;
                                "
                              >
                                Message :
                              </td>
                            </tr>

                            <tr>
                              <td style="padding:0;" align="left" valign="top">
                                <div style="text-align:left;white-space:pre-wrap;word-break:break-word;line-height:28px;font-size:15px;color:#374151;">${sanitizeMessage(payload.message)}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- espace -->

                    <table
                      role="presentation"
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                    >
                      <tr>
                        <td height="24"></td>
                      </tr>
                    </table>

                    <!-- DETAILS -->

                    <table
                      role="presentation"
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="
                        border-top:1px solid #e5e7eb;
                        color:#6b7280;
                        font-size:12px;
                      "
                    >

                      <tr>
                        <td style="padding-top:18px;">

                          <strong style="color:#374151;">
                            Détails techniques
                          </strong>

                          <br><br>

                          <strong>IP publique :</strong>
                          ${payload.ip}

                          <br>

                          <strong>Pays & Ville :</strong>
                          ${payload.country} -
                          ${payload.city || "Non identifiée"}

                          <br>

                          <strong>Navigateur & Plateforme :</strong>
                          ${payload.browser || "Non identifié"} -
                          ${payload.platform || "Non identifiée"}

                        </td>
                      </tr>

                    </table>

                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    let previewUrl: string | undefined;

    if (!isConfigured) {
      previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      console.log(
        `[Email Mock] Message envoyé ! URL de prévisualisation : ${previewUrl}`,
      );
    }

    return { success: true, previewUrl };
  } catch (err: any) {
    console.error("Erreur d'envoi d'email:", err);
    return { success: false, error: err?.message || String(err) };
  }
}
