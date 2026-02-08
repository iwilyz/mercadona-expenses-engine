// Service_Gemini.gs


function extractDataFromPDF(attachment) {
  const apiKey = getScriptProp('GEMINI_API_KEY_PRO');
  if (!apiKey) throw new Error("API Key no configurada");

  const base64Data = Utilities.base64Encode(attachment.getBytes());
  const url = `${CONFIG.API_URL}/${CONFIG.MODEL_ID}:generateContent?key=${apiKey}`;
  
  // 🔥 CAMBIO CLAVE: Instrucción de traducción añadida
  const prompt = `
    Eres un extractor de datos financieros OCR inteligente.
    Analiza el ticket de Mercadona adjunto.
    
    INSTRUCCIONES CLAVE:
    1. Extrae la fecha, total y lista de productos.
    2. NORMALIZACIÓN DE IDIOMA: Traduce SIEMPRE los nombres de los productos al ESPAÑOL (Castellano) si aparecen en Catalán u otro idioma. (Ej: 'Pollastre' -> 'Pollo').
    3. Si hay descuentos, el 'precio_unitario' debe ser el precio final pagado.
    
    Formato de Salida: JSON estricto (sin markdown).
    Formato fecha: DD/MM/YYYY.
    
    Estructura JSON Esperada:
    {
      "fecha": "DD/MM/YYYY",
      "total": 0.00,
      "lugar": "Texto",
      "id_factura": "Texto",
      "tarjeta": "Texto",
      "lista_productos": [
        { "nombre": "Texto (EN ESPAÑOL)", "precio_unitario": 0.00, "cantidad": 1, "total_linea": 0.00 }
      ]
    }
  `;

  const payload = {
    "contents": [{ 
      "parts": [{ "text": prompt }, { "inline_data": { "mime_type": "application/pdf", "data": base64Data } }] 
    }],
    "safetySettings": [
      { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
      { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" }
    ]
  };

  try {
    const response = UrlFetchApp.fetch(url, {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify(payload),
      "muteHttpExceptions": true
    });
    
    const content = JSON.parse(response.getContentText());
    if (content.error) throw new Error(JSON.stringify(content.error));
    
    let text = content.candidates[0].content.parts[0].text;
    text = text.replace(/```json|```/g, '').trim(); 
    return JSON.parse(text);

  } catch (e) {
    console.error("❌ Gemini Error:", e);
    return null;
  }
}
