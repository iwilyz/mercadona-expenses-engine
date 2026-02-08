//config.gs

const CONFIG = {
  BATCH_SIZE: 10, // Mantenemos lote seguro
  MODEL_ID: 'models/gemini-2.5-flash',
  API_URL: 'https://generativelanguage.googleapis.com/v1beta',
  SHEETS: {
    MAIN: 'Registro_Facturas',
    ITEMS: 'Detalle_Productos',
    BUDGETS: 'Config_Presupuestos'
  },
  LABELS: {
    PROCESSED: 'MERCADONA_GUARDADO',
    QUERY: 'from:ticket_digital@mail.mercadona.com has:attachment'
  }
};

// --- HELPERS ---
function getScriptProp(key) { return PropertiesService.getScriptProperties().getProperty(key); }

// En Config.gs

function parseDateFromTicket(dateInput) {
  if (!dateInput) return new Date();
  
  // CASO 1: Si Sheets ya nos devuelve un objeto Date real, lo devolvemos tal cual.
  if (dateInput instanceof Date) {
    return dateInput;
  }

  // CASO 2: Si es un String (viene del JSON de Gemini "DD/MM/YYYY"), lo parseamos.
  if (typeof dateInput === 'string') {
    const parts = dateInput.split('/');
    // Validación básica para evitar errores si el string está mal formado
    if (parts.length === 3) {
      return new Date(parts[2], parts[1] - 1, parts[0]); // YYYY, MM-1, DD
    }
  }

  // Fallback de seguridad
  console.warn("⚠️ Fecha no reconocida:", dateInput);
  return new Date();
}

function formatDateForFile(dateStr) {
  if (!dateStr) return '00000000';
  const parts = dateStr.split('/');
  return parts.length === 3 ? `${parts[2]}${parts[1]}${parts[0]}` : '00000000';
}

function getMonthKey(dateObj) {
  // Retorna "MM/YYYY" para buscar en la tabla de presupuestos
  const mm = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const yyyy = dateObj.getFullYear();
  return `${mm}/${yyyy}`;
}
