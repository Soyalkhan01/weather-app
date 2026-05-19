from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import requests
import os
from database import save_city, get_history

load_dotenv()

app = Flask(__name__)
CORS(app)

API_KEY = os.getenv("WEATHER_API_KEY")

# =========================
# HOME ROUTE
# =========================
@app.route("/")
def home():
    return jsonify({
        "message": "Backend Running"
    })


# =========================
# WEATHER API
# =========================
@app.route("/weather/<city>")
def get_weather(city):

    try:
        url = f"https://api.weatherapi.com/v1/forecast.json?key={API_KEY}&q={city}&days=5"

        response = requests.get(url, timeout=10)
        data = response.json()

        if "error" in data:
            return jsonify({
                "error": data["error"]
            }), 404

        save_city(city)

        return jsonify(data)

    except requests.exceptions.RequestException:
        return jsonify({
            "error": "Weather service unavailable"
        }), 500


# =========================
# SEARCH CITY API
# =========================
@app.route("/search/<query>")
def search_city(query):

    try:
        url = f"https://api.weatherapi.com/v1/search.json?key={API_KEY}&q={query}"

        response = requests.get(url, timeout=10)
        data = response.json()

        return jsonify(data)

    except requests.exceptions.RequestException:
        return jsonify([]), 500


# =========================
# HISTORY API
# =========================
@app.route("/history")
def history():

    try:
        data = get_history()

        if not data:
            return jsonify([])

        return jsonify(data)

    except Exception:
        return jsonify([]), 500


# =========================
# RUN SERVER
# =========================
if __name__ == "__main__":
    app.run(debug=True)