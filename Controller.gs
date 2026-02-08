//Controller.gs


/**
 * MERCADONA ENGINE v8.0 - MODULAR ARCHITECTURE
 * Tech Stack: GAS + Gemini Flash + Sheets DB
 */

function main_processTickets() {
  console.log("🚀 Iniciando Motor v8.0...");
  
  // 1. Inicializar Servicios
  const DB = new DataService();
  
  // 2. Buscar correos
  const label = GmailApp.getUserLabelByName(CONFIG.LABELS.PROCESSED) || GmailApp.createLabel(CONFIG.LABELS.PROCESSED);
  const threads = GmailApp.search(`${CONFIG.LABELS.QUERY} -label:${CONFIG.LABELS.PROCESSED}`, 0, CONFIG.BATCH_SIZE);

  if (threads.length === 0) {
    console.log("✅ Nada pendiente.");
    return;
  }

  // 3. Iterar
  threads.forEach(thread => {
   // Corrección: Compara el nombre de la etiqueta con la constante de texto directamente
if (thread.getLabels().some(l => l.getName() === CONFIG.LABELS.PROCESSED)) return;

    const messages = thread.getMessages();
    messages.forEach(msg => {
      const attachments = msg.getAttachments();
      attachments.forEach(att => {
        if (att.getContentType() === 'application/pdf') {
          
          console.log(`⚡ Analizando: ${msg.getSubject()}`);
          
          // A. Extracción IA (Retry logic podría ir aquí o dentro del servicio)
          let data = extractDataFromPDF(att);
          if (!data) {
             Utilities.sleep(1000);
             data = extractDataFromPDF(att);
          }

          if (data) {
            // B. Persistencia
            DB.saveTicket(data, att);

            // C. Lógica Financiera (Variable Mensual)
            const ticketDateObj = parseDateFromTicket(data.fecha);
            const status = DB.getFinancialStatus(ticketDateObj);

            // D. Notificación
            sendFinancialReport(data, status);
          }
        }
      });
    });
    
    // 4. Marcar como procesado
    thread.addLabel(label);
  });
  
  console.log("🏁 Ciclo finalizado.");
}
