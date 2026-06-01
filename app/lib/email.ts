import { Resend } from "resend";

// Iniciamos el cliente de Resend solo si hay API KEY disponible
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendNotificationEmail({
  nombre,
  email,
  telefono,
  servicio,
  descripcion
}: {
  nombre: string;
  email: string;
  telefono: string;
  servicio: string;
  descripcion: string;
}) {
  if (!resend) {
    console.warn("Resend API Key no configurada. Saltando envío de email.");
    return false;
  }

  const adminEmail = process.env.ADMIN_EMAIL || "info@oscarcarregal.com"; // Email de destino

  try {
    const { data, error } = await resend.emails.send({
      from: "Web Oscar Carregal <onboarding@resend.dev>", // Cambiar cuando verifique su dominio
      to: [adminEmail],
      subject: `Nuevo Presupuesto: ${servicio} - ${nombre}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #2563eb; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Nuevo Presupuesto Web</h1>
          </div>
          <div style="padding: 24px;">
            <p style="font-size: 16px; color: #333;">Has recibido una nueva solicitud de presupuesto desde la web.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eaeaea; width: 30%;"><strong>Nombre:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eaeaea; color: #555;">${nombre}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eaeaea;"><strong>Servicio:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eaeaea; color: #555;">${servicio}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eaeaea;"><strong>Teléfono:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eaeaea; color: #555;">${telefono || 'No indicado'}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eaeaea;"><strong>Email:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eaeaea; color: #555;">${email || 'No indicado'}</td>
              </tr>
            </table>

            <div style="margin-top: 24px;">
              <strong>Mensaje / Descripción:</strong>
              <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; margin-top: 8px; color: #444; white-space: pre-wrap;">${descripcion}</div>
            </div>
            
            <div style="margin-top: 32px; text-align: center;">
              <a href="https://oscarcarregal.com/admin/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Ver en el Panel de Control</a>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Error enviando email:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Excepción en sendNotificationEmail:", error);
    return false;
  }
}
