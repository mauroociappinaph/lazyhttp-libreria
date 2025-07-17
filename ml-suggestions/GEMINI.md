# GEMINI.md - Guía para el Componente de Sugerencias de IA (ml-suggestions)

Este documento define el contexto y las directrices para el desarrollo y mantenimiento del microservicio de sugerencias de IA ubicado en `ml-suggestions/`.

## 1. Resumen del Componente

El directorio `ml-suggestions/` contiene un microservicio en Python/Flask diseñado para proporcionar sugerencias automáticas para errores HTTP comunes. Utiliza modelos de Machine Learning (scikit-learn) para analizar patrones de error y proponer soluciones.

## 2. Propósito

El objetivo principal de este componente es mejorar la experiencia del desarrollador al ofrecer asistencia inteligente y proactiva en la depuración de errores relacionados con `lazyHttp`.

## 3. Tecnologías Clave

*   **Lenguaje:** Python
*   **Framework Web:** Flask
*   **Machine Learning:** pandas, scikit-learn

## 4. Estructura del Directorio

*   `ml-suggestions/suggestion_server.py`: Lógica principal del servidor Flask.
*   `ml-suggestions/requirements.txt`: Dependencias de Python.
*   `ml-suggestions/data/`: Directorio para almacenar datos de entrenamiento o modelos.
*   `ml-suggestions/venv/`: Entorno virtual de Python.

## 5. Cómo Iniciar el Servidor

Para iniciar el servidor de sugerencias de IA:

1.  Navega al directorio `ml-suggestions/`.
2.  Activa el entorno virtual: `source venv/bin/activate` (o `venv\Scripts\activate` en Windows).
3.  Instala las dependencias (si no lo has hecho ya): `pip install -r requirements.txt`
4.  Inicia el servidor: `python suggestion_server.py`

## 6. Directrices de Desarrollo

*   **Manejo de Errores:** Asegurarse de que el servidor maneje robustamente las entradas inválidas y los errores internos.
*   **Rendimiento:** Optimizar el rendimiento del modelo y del servidor para respuestas rápidas.
*   **Escalabilidad:** Considerar la escalabilidad del servicio si el volumen de solicitudes aumenta.
*   **Privacidad:** No procesar ni almacenar información sensible del usuario.
*   **Entrenamiento del Modelo:** Documentar claramente el proceso de entrenamiento y re-entrenamiento del modelo de ML.

## 7. Integración con Husky (Oportunidad Futura)

Existe la posibilidad de integrar este servicio con los hooks de Husky. Si un hook falla, la salida de error podría enviarse a este servidor para obtener y mostrar sugerencias automáticas de solución al desarrollador.