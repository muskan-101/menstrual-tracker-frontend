from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "pcos_model.pkl")
model = joblib.load(MODEL_PATH)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    features = [
        data['age'],
        data['bmi'],
        data['cycle'],
        data['cycle_length'],
        data['weight_gain'],
        data['hair_growth'],
        data['skin_darkening'],
        data['hair_loss'],
        data['pimples'],
        data['fast_food'],
        data['exercise']
    ]

    features = np.array([features])

    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0][1]

    return jsonify({
        "prediction": int(prediction),
        "probability": float(probability)
    })

@app.route("/")
def home():
    return """
    <h1>PCOS Prediction Dashboard</h1>
    <form action="/predict_form" method="post">
        Age: <input name="age"><br>
        BMI: <input name="bmi"><br>
        Cycle (1=Irregular, 0=Regular): <input name="cycle"><br>
        Cycle Length: <input name="cycle_length"><br>
        Weight Gain: <input name="weight_gain"><br>
        Hair Growth: <input name="hair_growth"><br>
        Skin Darkening: <input name="skin_darkening"><br>
        Hair Loss: <input name="hair_loss"><br>
        Pimples: <input name="pimples"><br>
        Fast Food: <input name="fast_food"><br>
        Exercise: <input name="exercise"><br>
        <button type="submit">Predict</button>
    </form>
    """

@app.route("/predict_form", methods=["POST"])
def predict_form():
    data = request.form

    features = [
        float(data['age']),
        float(data['bmi']),
        int(data['cycle']),
        float(data['cycle_length']),
        int(data['weight_gain']),
        int(data['hair_growth']),
        int(data['skin_darkening']),
        int(data['hair_loss']),
        int(data['pimples']),
        int(data['fast_food']),
        int(data['exercise'])
    ]

    features = np.array([features])

    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0][1]

    return f"""
    <h2>Result</h2>
    <p>Prediction: {'PCOS' if prediction==1 else 'No PCOS'}</p>
    <p>Probability: {probability*100:.2f}%</p>
    <a href="/">Go Back</a>
    """

if __name__ == "__main__":
    app.run(debug=True)


