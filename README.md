# 🛒 Mercadona Expenses Engine (v8.1)

> **Automatización financiera personal impulsada por IA.**
> *Transforma correos de confirmación de compra en inteligencia de negocio real.*

---

### 📋 Resumen Ejecutivo
Este sistema resuelve el problema de la **trazabilidad de gastos hormiga** en la economía doméstica. Automatiza el flujo completo desde la recepción del ticket digital hasta la analítica en hojas de cálculo, eliminando el error humano y ahorrando aproximadamente **2 horas manuales al mes**.

### 🏗️ Arquitectura Técnica
El proyecto sigue una arquitectura **Serverless** basada en eventos, alojada en el ecosistema de Google.

* **Core:** Google Apps Script (V8 Runtime).
* **Inteligencia:** Gemini 1.5 Flash (vía API REST) para OCR y extracción estructurada.
* **Persistencia:** Google Sheets (como Base de Datos NoSQL ligera).
* **Interfaz:** HTMLService (SPA con Tailwind CSS).

### 🔄 Flujo de Datos (Data Journey)
1.  **Trigger:** Detección de correo de Mercadona (Gmail API).
2.  **Extracción:** El PDF adjunto se envía a Gemini 1.5 Flash.
3.  **Procesamiento:**
    * Lectura de líneas de producto.
    * Normalización de nombres.
    * *Regla de Negocio:* `Precio Unitario` = `Precio Final` (Gestión de descuentos).
4.  **Storage:** Inserción en Google Sheets + Actualización de Dashboard.

### 🛠️ Configuración (Setup)
Este proyecto utiliza `ScriptProperties` para manejar secretos.
Requiere:
- `GEMINI_API_KEY`: Llave de Google AI Studio.
- `SPREADSHEET_ID`: ID de la hoja de destino.

---
*Desarrollado como parte de mi portfolio de Arquitectura de Soluciones Cloud & AI.*
