# 🛒 Mercadona Expenses Engine (v8.1)

> **Automatización FinOps personal con Gemini 2.5 Flash.**
> *Ingesta, procesamiento y análisis de gastos domésticos en tiempo real.*

---

### 📋 Resumen Ejecutivo
Sistema diseñado para ingerir el flujo de gastos proveniente de facturas digitales (PDF). Elimina la entrada manual mediante un motor de IA que extrae ítems línea por línea, **normaliza idiomas regionales (Catalán → Español)** y cruza datos con presupuestos dinámicos.

### 🏗️ Arquitectura Técnica (SOA)
El proyecto sigue una arquitectura orientada a servicios, desacoplando estrictamente lógica, datos y vistas.

* **Orquestador:** `Controller.gs` (Trigger horario).
* **IA Gateway:** `Service_Gemini.gs` conectando con **Gemini 2.5 Flash** (Enterprise API).
* **Persistencia:** `Service_Data.gs` (CRUD sobre Google Sheets).
* **Notificaciones:** `Service_Notify.gs` (Renderizado de plantillas HTML con "Semáforo Financiero").
* **Mantenimiento:** `Fix_Reprocess_Zeros.gs` (Re-escaneo forense de errores OCR).

### 🔄 Data Journey & Lógica Crítica
1.  **Input:** Detección de tickets (Gmail API) + Conversión a Base64.
2.  **Inferencia:** Prompt System con instrucción de traducción simultánea y extracción JSON estricta.
3.  **Validación:** Sanitización de Markdown y verificación de integridad.
4.  **Output:** Reporte email HTML + Archivo en Drive.

### 🛠️ Stack & Configuración
* **Runtime:** Google Apps Script V8.
* **Seguridad:** `BLOCK_NONE` en Safety Settings para evitar falsos positivos en productos sensibles.
* **Límites:** Batching de 10 correos/ejecución para gestión de cuotas de GAS.

---
*Estado Actual: Backend Operativo / Frontend (SPA) en desarrollo.*
