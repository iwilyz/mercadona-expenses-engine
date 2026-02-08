/**
 * 🌐 WebApp Service
 * Gestiona la entrega del Frontend y la inclusión de recursos.
 */

function doGet(e) {
  // Renderiza la plantilla 'Index.html'
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Mercadona FinOps Dashboard 🛒')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Helper para incluir componentes (CSS/JS) separados si fuera necesario en el futuro.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
