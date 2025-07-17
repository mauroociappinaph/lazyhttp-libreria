# GEMINI.md - Guía para el Servicio de Sugerencias de IA

Este documento detalla la arquitectura y el mantenimiento del componente `ml-suggestions`.

## 1. Arquitectura del Servicio

*   **Framework:** Python con Flask.
*   **Modelo:** Actualmente se utiliza un `LogisticRegression` de `scikit-learn` entrenado con datos de errores HTTP comunes y sus soluciones. El modelo está serializado en `model.pkl`.
*   **Entorno:** Las dependencias están gestionadas en `requirements.txt` y deben ser instaladas en un entorno virtual Python (`.venv/`).

## 2. Gestión de Datos

*   **Datos de Entrenamiento:** El conjunto de datos principal se encuentra en `data/error_logs.csv`. Contiene las columnas: `errorCode`, `errorMessage`, `context`, `suggestedFix`.
*   **Re-entrenamiento del Modelo:** Para re-entrenar el modelo con nuevos datos, ejecuta el script `train_model.py` (aún por crear). Este script cargará el CSV, re-entrenará el modelo y guardará la nueva versión de `model.pkl`.
*   **Feedback Loop:** El endpoint `/feedback` se utiliza para recoger datos de los usuarios sobre si una sugerencia fue útil. Estos datos se guardan en `data/feedback.csv` y deben ser revisados e integrados periódicamente en el conjunto de entrenamiento principal.

## 3. Endpoints de la API

*   **`POST /suggest`**:
    *   **Payload:** `{ "error": "...", "context": "..." }`
    *   **Respuesta:** `{ "suggestion": "..." }`
*   **`POST /feedback`**:
    *   **Payload:** `{ "suggestion": "...", "is_useful": true/false }`
    *   **Respuesta:** `{ "status": "received" }`
