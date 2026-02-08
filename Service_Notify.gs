//Service_Notify.gs


function sendFinancialReport(ticketData, financeStatus) {
  // Enviamos a ti (usuario actual) y a tu esposa, separados por coma
const email = `${Session.getEffectiveUser().getEmail()},mayralatorrebcn@gmail.com`;
  
  // Lógica visual
  const isDanger = financeStatus.remaining < 0;
  const color = isDanger ? "#D32F2F" : "#388E3C"; // Rojo/Verde
  const percent = Math.min(100, (financeStatus.spent / financeStatus.budget) * 100).toFixed(1);

  let itemsList = ticketData.lista_productos
    .map(i => `<li>${i.cantidad}x ${i.nombre} - <b>${i.total_linea}€</b></li>`)
    .join('');

  const template = `
    <div style="font-family: 'Segoe UI', sans-serif; color: #333; max-width: 600px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #007041; color: white; padding: 20px; text-align: center;">
        <h2 style="margin:0;">Mercadona: ${ticketData.total.toFixed(2)} €</h2>
        <p style="margin:5px 0 0; opacity: 0.9;">${ticketData.fecha} | ${ticketData.lugar}</p>
      </div>
      
      <div style="padding: 20px;">
        <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 5px solid ${color};">
          <h3 style="margin-top:0;">📉 Control Presupuestario (${financeStatus.monthKey})</h3>
          <p>Presupuesto Objetivo: <b>${financeStatus.budget} €</b></p>
          <p>Gasto Acumulado: <b>${financeStatus.spent.toFixed(2)} €</b> (${percent}%)</p>
          <hr style="border: 0; border-top: 1px solid #ddd;">
          <p style="font-size: 1.2em;">Disponible: <b style="color: ${color};">${financeStatus.remaining.toFixed(2)} €</b></p>
        </div>

        <h3>🛒 Detalle de la Compra</h3>
        <ul style="color: #555; font-size: 0.9em; line-height: 1.6;">
          ${itemsList}
        </ul>
      </div>
      
      <div style="background: #eee; padding: 10px; text-align: center; font-size: 0.8em; color: #777;">
        Procesado por Gemini Engine v8.0 (Modular)
      </div>
    </div>
  `;

  GmailApp.sendEmail(email, `🛒 Gasto: ${ticketData.total}€ | Restante: ${financeStatus.remaining.toFixed(0)}€`, '', { htmlBody: template });
  console.log(`📧 Reporte enviado. Estado del mes ${financeStatus.monthKey}: ${percent}%`);
}
