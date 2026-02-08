//Fix_Reprocess_Zeros.gs


/**
 * 🛠️ REPAIR TOOL: REPROCESS ZERO PRICES (FIXED)
 * Fix: Añadido .getBlob() para compatibilidad con archivos de Drive.
 */

function runFixZeroPrices() {
  console.log("🚑 Iniciando Reparación de Precios (Modo Re-scan)...");

  const ssId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  const folderId = PropertiesService.getScriptProperties().getProperty('FOLDER_ID');
  
  const ss = SpreadsheetApp.openById(ssId);
  const sheet = ss.getSheetByName('Detalle_Productos');
  const folder = DriveApp.getFolderById(folderId);

  // 1. Identificar Facturas "Rotas"
  const data = sheet.getDataRange().getValues();
  const badInvoiceIds = new Set();
  
  const COL_ID = 0;
  const COL_PRECIO = 3;
  const COL_TOTAL = 5;

  for (let i = 1; i < data.length; i++) {
    const price = data[i][COL_PRECIO];
    const id = data[i][COL_ID];

    // Detectar precio 0, vacío o nulo
    if ((!price || price === 0 || price === "0" || price === "") && id) {
      badInvoiceIds.add(id);
    }
  }

  const targetIds = Array.from(badInvoiceIds);
  console.log(`📉 Detectadas ${targetIds.length} facturas con errores. Procesando...`);

  // Límite de seguridad
  const BATCH_LIMIT = 5; 
  const toProcess = targetIds.slice(0, BATCH_LIMIT);

  toProcess.forEach(invoiceId => {
    try {
      console.log(`🔄 Reparando Factura ID: ${invoiceId}`);

      const files = folder.searchFiles(`title contains '${invoiceId}' and trashed = false`);
      
      if (files.hasNext()) {
        const file = files.next();
        console.log(`   📄 PDF encontrado: ${file.getName()}`);

        // --- CORRECCIÓN AQUÍ ---
        // Usamos file.getBlob() para que Service_Gemini crea que es un adjunto
        let newData = extractDataFromPDF(file.getBlob()); 
        
        if (!newData) {
           console.warn("   ⚠️ Gemini devolvió null, reintentando...");
           Utilities.sleep(2000);
           newData = extractDataFromPDF(file.getBlob());
        }

        if (newData && newData.lista_productos.length > 0) {
          // Borrar viejos
          deleteRowsByInvoiceId(sheet, invoiceId);

          // Insertar nuevos
          const newRows = newData.lista_productos.map(item => [
            newData.id_factura,
            newData.fecha, 
            item.nombre,   
            item.precio_unitario,
            item.cantidad,
            item.total_linea
          ]);
          
          sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, 6).setValues(newRows);
          console.log(`   ✅ ¡Reparada! ${newRows.length} líneas insertadas.`);
          
        } else {
          console.error("   ❌ Gemini no pudo extraer datos.");
        }

      } else {
        console.warn(`   ⚠️ No se encontró PDF para: ${invoiceId}`);
      }
      
      Utilities.sleep(2000);

    } catch (e) {
      console.error(`   🔥 Error fatal en ID ${invoiceId}: ${e.toString()}`);
    }
  });

  console.log("🏁 Ronda de reparación finalizada.");
}

function deleteRowsByInvoiceId(sheet, invoiceId) {
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0] == invoiceId) { 
      sheet.deleteRow(i + 1); 
    }
  }
}
