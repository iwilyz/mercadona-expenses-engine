//Service_Data.gs


class DataService {
  constructor() {
    const ssId = getScriptProp('SPREADSHEET_ID');
    const folderId = getScriptProp('FOLDER_ID');
    this.ss = SpreadsheetApp.openById(ssId);
    this.folder = DriveApp.getFolderById(folderId);
    this.sheetMain = this.ss.getSheetByName(CONFIG.SHEETS.MAIN) || this.ss.insertSheet(CONFIG.SHEETS.MAIN);
    this.sheetItems = this.ss.getSheetByName(CONFIG.SHEETS.ITEMS) || this.ss.insertSheet(CONFIG.SHEETS.ITEMS);
    this.sheetBudgets = this.ss.getSheetByName(CONFIG.SHEETS.BUDGETS);
  }

  saveTicket(data, attachment) {
    // 1. Archivar PDF
    const fileName = `${formatDateForFile(data.fecha)}_Mercadona_${data.id_factura}.pdf`;
    attachment.setName(fileName);
    this.folder.createFile(attachment);

    // 2. Insertar Cabecera
    this.sheetMain.appendRow([
      data.fecha, data.total, data.lugar, 
      data.tarjeta, data.id_factura, "Archivado"
    ]);

    // 3. Insertar Items
    if (data.lista_productos?.length > 0) {
      const rows = data.lista_productos.map(p => [
        data.id_factura, data.fecha, p.nombre, p.precio_unitario, p.cantidad, p.total_linea
      ]);
      this.sheetItems.getRange(this.sheetItems.getLastRow() + 1, 1, rows.length, 6).setValues(rows);
    }
  }

  /**
   * Obtiene el presupuesto para el mes del ticket y calcula el gasto acumulado
   */
  getFinancialStatus(ticketDateObj) {
    const monthKey = getMonthKey(ticketDateObj); // Ej: "02/2025"
    
    // A. Obtener Presupuesto del Mes (Lookup dinámico)
    let monthlyBudget = 0;
    if (this.sheetBudgets) {
      const data = this.sheetBudgets.getDataRange().getValues();
      // Asume A: Mes, B: Importe. Saltamos header.
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] == monthKey) { // Comparación laxa por si es string/date
          monthlyBudget = parseFloat(data[i][1]);
          break;
        }
      }
    }
    // Fallback si no hay dato en tabla
    if (monthlyBudget === 0) monthlyBudget = 600; // Valor por defecto seguro

    // B. Calcular Gasto Acumulado en ese Mes
    let spentMonth = 0;
    const salesData = this.sheetMain.getDataRange().getValues();
    
    // Filtramos facturas que pertenezcan al mismo mes/año del ticket
    // Asume Col A: Fecha, Col B: Total
    for (let i = 1; i < salesData.length; i++) {
      const rowDate = parseDateFromTicket(salesData[i][0]);
      const rowTotal = parseFloat(salesData[i][1]) || 0;
      
      if (getMonthKey(rowDate) === monthKey) {
        spentMonth += rowTotal;
      }
    }

    return {
      monthKey: monthKey,
      budget: monthlyBudget,
      spent: spentMonth,
      remaining: monthlyBudget - spentMonth
    };
  }
}
