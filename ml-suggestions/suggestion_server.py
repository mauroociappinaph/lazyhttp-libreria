from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib  # Reemplazado pickle por joblib para mayor seguridad
import os
import re

app = Flask(__name__)
CORS(app)  # Permite peticiones desde JavaScript

# Rutas a archivos
MODEL_PATH = 'data/error_model.joblib' # Cambiada la extensión del modelo
DATA_PATH = 'data/error_data.csv'

# Variables globales
model = None
data = None

def extract_features(error_info):
    """Convierte datos del error en características para el modelo"""
    # Codificar tipo de error
    error_types = ['HttpTimeoutError', 'HttpNetworkError', 'HttpAuthError',
                  'HttpAxiosError', 'HttpUnknownError', 'HttpAbortedError']
    error_type_features = [1 if error_info.get('error_type') == t else 0 for t in error_types]

    # Status code (normalizado)
    status_code = error_info.get('status_code', 0) / 500

    # URL pattern (extraer características simples)
    url = error_info.get('url_pattern', '')
    has_api = 1 if '/api/' in url else 0
    has_auth = 1 if '/auth/' in url else 0
    has_user = 1 if '/user' in url else 0

    # Método HTTP
    method_features = [
        1 if error_info.get('method') == 'GET' else 0,
        1 if error_info.get('method') == 'POST' else 0,
        1 if error_info.get('method') == 'PUT' else 0,
        1 if error_info.get('method') == 'DELETE' else 0
    ]

    # Combinar todas las características
    return error_type_features + [status_code, has_api, has_auth, has_user] + method_features

def initialize():
    """Inicializa el modelo y los datos"""
    global model, data

    # Crear directorios si no existen
    if not os.path.exists('data'):
        os.makedirs('data')

    # Crear dataframe vacío si no existe
    if not os.path.exists(DATA_PATH):
        data = pd.DataFrame(columns=[
            'error_type', 'status_code', 'url_pattern', 'method',
            'message', 'suggestion', 'was_helpful'
        ])
        data.to_csv(DATA_PATH, index=False)
    else:
        data = pd.read_csv(DATA_PATH)

    # Cargar modelo o crear uno nuevo
    if os.path.exists(MODEL_PATH):
        try:
            model = joblib.load(MODEL_PATH)
        except Exception as e:
            print(f"Error al cargar el modelo: {e}. Se creará uno nuevo.")
            # Si el modelo está corrupto, lo reiniciamos
            if os.path.exists(MODEL_PATH):
                os.remove(MODEL_PATH)
            train_model()
    else:
        model = RandomForestClassifier()
        # Entrenar con datos predeterminados si no hay
        if len(data) < 5:
            seed_initial_data()
        train_model()


def seed_initial_data():
    """Agrega algunos datos iniciales para empezar"""
    global data
    initial_data = [
        {
            'error_type': 'HttpTimeoutError',
            'status_code': 408,
            'url_pattern': '/api/products',
            'method': 'GET',
            'message': 'Timeout error',
            'suggestion': 'El servidor está tardando demasiado en responder. Intenta más tarde cuando haya menos tráfico.',
            'was_helpful': True
        },
        {
            'error_type': 'HttpAuthError',
            'status_code': 401,
            'url_pattern': '/api/auth/login',
            'method': 'POST',
            'message': 'Authentication failed',
            'suggestion': 'Las credenciales proporcionadas no son correctas. Verifica tu nombre de usuario y contraseña.',
            'was_helpful': True
        },
        {
            'error_type': 'HttpNetworkError',
            'status_code': 0,
            'url_pattern': '/api/users',
            'method': 'GET',
            'message': 'Network error',
            'suggestion': 'Verifica tu conexión a internet. Es posible que estés desconectado.',
            'was_helpful': True
        },
        {
            'error_type': 'HttpAxiosError',
            'status_code': 404,
            'url_pattern': '/api/products/123',
            'method': 'GET',
            'message': 'Not found',
            'suggestion': 'El recurso solicitado no existe. Verifica la URL e ID del producto.',
            'was_helpful': True
        },
        {
            'error_type': 'HttpUnknownError',
            'status_code': 500,
            'url_pattern': '/api/checkout',
            'method': 'POST',
            'message': 'Server error',
            'suggestion': 'Ocurrió un error en el servidor. Contacta al soporte técnico si persiste.',
            'was_helpful': True
        }
    ]

    data = pd.concat([data, pd.DataFrame(initial_data)], ignore_index=True)
    data.to_csv(DATA_PATH, index=False)

def train_model():
    """Entrena el modelo con los datos disponibles"""
    global model, data

    if len(data) < 3:  # Necesitamos al menos algunos ejemplos
        # Si no hay suficientes datos, creamos un modelo vacío pero no lo entrenamos
        model = RandomForestClassifier()
        return

    # Preparar datos de entrenamiento
    X = []
    y = []

    # Asegurarnos que la columna 'suggestion' existe y no tiene NaNs
    if 'suggestion' not in data.columns or data['suggestion'].isnull().all():
        print("No hay datos de sugerencias para entrenar el modelo.")
        model = RandomForestClassifier()
        return

    # Filtrar filas donde la sugerencia no es nula
    trainable_data = data.dropna(subset=['suggestion'])

    if len(trainable_data) < 3:
        print("No hay suficientes datos válidos para entrenar el modelo.")
        model = RandomForestClassifier()
        return

    for _, row in trainable_data.iterrows():
        error_info = {
            'error_type': row['error_type'],
            'status_code': row['status_code'],
            'url_pattern': row['url_pattern'],
            'method': row['method']
        }
        X.append(extract_features(error_info))
        y.append(row['suggestion'])

    # Entrenar el modelo
    X = np.array(X)
    model.fit(X, y)

    # Guardar el modelo
    joblib.dump(model, MODEL_PATH)

@app.route('/suggest', methods=['POST'])
def suggest():
    """Endpoint para obtener sugerencias"""
    global model

    # Obtener datos del error
    error_info = request.json
    if not error_info:
        return jsonify({'error': 'Cuerpo de la petición vacío o no es JSON'}), 400

    # Si no hay modelo entrenado o pocos datos, dar respuesta genérica
    if model is None or not hasattr(model, 'predict') or len(data) < 5:
        error_type = error_info.get('error_type', '')

        # Respuestas predeterminadas basadas en el tipo
        if 'Timeout' in error_type:
            return jsonify({'suggestion': 'Verifica tu conexión o intenta más tarde cuando haya menos tráfico.'})
        elif 'Auth' in error_type:
            return jsonify({'suggestion': 'Tu sesión puede haber expirado. Inicia sesión nuevamente.'})
        elif 'Network' in error_type:
            return jsonify({'suggestion': 'Verifica tu conexión a internet.'})
        else:
            return jsonify({'suggestion': 'Ha ocurrido un error. Inténtalo de nuevo más tarde.'})

    # Extraer características
    features = extract_features(error_info)

    # Predecir sugerencia
    try:
        suggestion = model.predict([features])[0]
        return jsonify({'suggestion': suggestion})
    except Exception as e:
        print(f"Error durante la predicción: {e}")
        return jsonify({'suggestion': 'Ocurrió un error al procesar la sugerencia.'})


@app.route('/feedback', methods=['POST'])
def feedback():
    """Recibe retroalimentación sobre si la sugerencia fue útil"""
    global data

    # Recibir y validar datos
    feedback_data = request.json
    if not feedback_data or not all(k in feedback_data for k in ['error_type', 'status_code', 'url_pattern', 'method', 'message', 'suggestion', 'was_helpful']):
        return jsonify({'error': 'Faltan campos en los datos de feedback'}), 400


    # Agregar a los datos
    data = pd.concat([data, pd.DataFrame([feedback_data])], ignore_index=True)
    data.to_csv(DATA_PATH, index=False)

    # Reentrenar cada cierto número de nuevos ejemplos
    if len(data) % 5 == 0:  # Cada 5 ejemplos nuevos
        train_model()

    return jsonify({'success': True, 'message': 'Feedback recibido correctamente'})

# Inicializar al arrancar
initialize()

if __name__ == '__main__':
    app.run(debug=True, port=8000)