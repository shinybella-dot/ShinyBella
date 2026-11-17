import { Resend } from 'resend';

let resendInstance: Resend | null = null;

const EMAIL_FROM = process.env.RESEND_FROM_EMAIL || 'ShinyBella <noreply@shinybella.com>';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getResend() {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('RESEND_API_KEY not configured - emails will not be sent');
      return null;
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

async function sendEmail(emailFn: (resend: Resend) => Promise<any>) {
  const resend = getResend();
  if (!resend) {
    console.log('Email not sent: RESEND_API_KEY not configured');
    return { success: false, error: 'Email service not configured' };
  }
  return emailFn(resend);
}

export async function sendSolicitudRecibidaEmail(to: string, folio: string, nombreSalon: string) {
  return sendEmail((resend) =>
    resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Solicitud de afiliación recibida - ${escapeHtml(folio)}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: linear-gradient(135deg, #CD9FA0 0%, #F2C1A3 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: #525871; margin: 0; font-size: 28px;">ShinyBella</h1>
            <p style="color: #525871; margin: 8px 0 0; opacity: 0.9;">Solicitud de afiliación recibida</p>
          </div>
          <div style="background: #fff; padding: 32px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 16px 16px;">
            <p style="font-size: 16px; color: #333; margin: 0 0 16px;">Hola <strong>${escapeHtml(nombreSalon)}</strong>,</p>
            <p style="font-size: 16px; color: #333; margin: 0 0 16px;">Hemos recibido tu solicitud de afiliación. Nuestro equipo la revisará en las próximas <strong>24-48 horas</strong>.</p>
            <div style="background: #fafafa; border: 1px solid #e0e0e0; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
              <p style="margin: 0 0 8px; color: #857C91; font-size: 14px;">Tu número de seguimiento</p>
              <code style="font-size: 24px; font-weight: bold; color: #525871; letter-spacing: 2px;">${escapeHtml(folio)}</code>
              <p style="margin: 12px 0 0; color: #857C91; font-size: 12px;">Guárdalo para consultar el estado de tu solicitud</p>
            </div>
            <p style="font-size: 14px; color: #857C91; margin: 24px 0 0;">Te contactaremos al correo registrado para notificarte el resultado.</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;">
            <p style="font-size: 12px; color: #857C91; margin: 0;">Este es un correo automático, por favor no respondas.</p>
          </div>
        </div>
      `,
    })
  );
}

export async function sendSolicitudAprobadaEmail(to: string, folio: string, nombreSalon: string, salonId: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shiny-bella.vercel.app';
  const pagoUrl = `${appUrl}/negocio/pago-plan?salon_id=${salonId}`;

  return sendEmail((resend) =>
    resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `¡Felicidades! Tu solicitud fue aprobada - ${escapeHtml(folio)}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 28px;">ShinyBella</h1>
            <p style="color: #fff; margin: 8px 0 0; opacity: 0.9;">¡Tu solicitud fue aprobada!</p>
          </div>
          <div style="background: #fff; padding: 32px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 16px 16px;">
            <p style="font-size: 16px; color: #333; margin: 0 0 16px;">Hola <strong>${escapeHtml(nombreSalon)}</strong>,</p>
            <p style="font-size: 16px; color: #333; margin: 0 0 16px;">¡Excelentes noticias! Tu solicitud de afiliación (<strong>${escapeHtml(folio)}</strong>) ha sido <span style="color: #22c55e; font-weight: bold;">APROBADA</span>.</p>
            <p style="font-size: 16px; color: #333; margin: 0 0 16px;">Para activar tu salón en ShinyBella y empezar a recibir citas online, solo falta un paso: suscribirte al <strong>Plan Básico ($60.10/mes)</strong>.</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${escapeHtml(pagoUrl)}" style="display: inline-block; background: linear-gradient(135deg, #CD9FA0 0%, #F2C1A3 100%); color: #525871; padding: 16px 32px; border-radius: 12px; font-weight: bold; text-decoration: none; font-size: 16px;">
                Activar mi plan - $60.10/mes
              </a>
            </div>
            <p style="font-size: 14px; color: #857C91; margin: 24px 0 0;">Una vez completado el pago, podrás conectar tu cuenta Stripe y acceder a tu panel de gestión.</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;">
            <p style="font-size: 12px; color: #857C91; margin: 0;">ShinyBella - Tu agenda de belleza digital</p>
          </div>
        </div>
      `,
    })
  );
}

export async function sendSolicitudRechazadaEmail(to: string, folio: string, nombreSalon: string, motivo: string) {
  return sendEmail((resend) =>
    resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Actualización de tu solicitud - ${escapeHtml(folio)}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 28px;">ShinyBella</h1>
            <p style="color: #fff; margin: 8px 0 0; opacity: 0.9;">Actualización sobre tu solicitud</p>
          </div>
          <div style="background: #fff; padding: 32px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 16px 16px;">
            <p style="font-size: 16px; color: #333; margin: 0 0 16px;">Hola <strong>${escapeHtml(nombreSalon)}</strong>,</p>
            <p style="font-size: 16px; color: #333; margin: 0 0 16px;">Lamentamos informarte que tu solicitud de afiliación (<strong>${escapeHtml(folio)}</strong>) ha sido <span style="color: #ef4444; font-weight: bold;">RECHAZADA</span>.</p>
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <p style="margin: 0 0 8px; color: #dc2626; font-size: 14px; font-weight: bold;">Motivo:</p>
              <p style="margin: 0; color: #333;">${escapeHtml(motivo)}</p>
            </div>
            <p style="font-size: 16px; color: #333; margin: 24px 0 0;">Puedes corregir la información y enviar una nueva solicitud cuando lo consideres oportuno.</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;">
            <p style="font-size: 12px; color: #857C91; margin: 0;">ShinyBella - Tu agenda de belleza digital</p>
          </div>
        </div>
      `,
    })
  );
}

export async function sendPagoFallidoEmail(to: string, salonNombre: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shiny-bella.vercel.app';
  return sendEmail((resend) =>
    resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: 'Pago no procesado - ShinyBella',
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 28px;">ShinyBella</h1>
            <p style="color: #fff; margin: 8px 0 0; opacity: 0.9;">Problema con tu pago</p>
          </div>
          <div style="background: #fff; padding: 32px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 16px 16px;">
            <p style="font-size: 16px; color: #333; margin: 0 0 16px;">Hola <strong>${escapeHtml(salonNombre)}</strong>,</p>
            <p style="font-size: 16px; color: #333; margin: 0 0 16px;">No pudimos procesar el pago de tu suscripción mensual. Tu salón permanecerá inactivo hasta que se resuelva.</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${escapeHtml(appUrl)}/negocio/pago-plan" style="display: inline-block; background: linear-gradient(135deg, #CD9FA0 0%, #F2C1A3 100%); color: #525871; padding: 16px 32px; border-radius: 12px; font-weight: bold; text-decoration: none; font-size: 16px;">
                Actualizar método de pago
              </a>
            </div>
            <p style="font-size: 14px; color: #857C91; margin: 24px 0 0;">Si necesitas ayuda, contáctanos respondiendo a este correo.</p>
          </div>
        </div>
      `,
    })
  );
}

export async function sendStripeConnectCompletadoEmail(to: string, salonNombre: string) {
  return sendEmail((resend) =>
    resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: 'Cuenta Stripe conectada - ShinyBella',
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 28px;">ShinyBella</h1>
            <p style="color: #fff; margin: 8px 0 0; opacity: 0.9;">¡Cuenta Stripe conectada!</p>
          </div>
          <div style="background: #fff; padding: 32px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 16px 16px;">
            <p style="font-size: 16px; color: #333; margin: 0 0 16px;">Hola <strong>${escapeHtml(salonNombre)}</strong>,</p>
            <p style="font-size: 16px; color: #333; margin: 0 0 16px;">Tu cuenta Stripe Connect ha sido configurada correctamente. Los pagos de las reservas se depositarán directamente en tu cuenta bancaria (menos la comisión de la plataforma).</p>
            <p style="font-size: 16px; color: #333; margin: 0 0 16px;">¡Ya puedes empezar a recibir citas y pagos online!</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;">
            <p style="font-size: 12px; color: #857C91; margin: 0;">ShinyBella - Tu agenda de belleza digital</p>
          </div>
        </div>
      `,
    })
  );
}