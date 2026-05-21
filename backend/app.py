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

@app.route("/")
def home():

    return jsonify({
        "message": "Weather Backend Running Successfully"
    })

@app.route("/weather/<path:city>")
def get_weather(city):

    try:

        url = (
            f"https://api.weatherapi.com/v1/forecast.json"
            f"?key={API_KEY}&q={city}&days=5&aqi=yes&alerts=yes"
        )

        response = requests.get(url)

        data = response.json()

        if "error" in data:

            return jsonify(data), 404

        # SAVE SEARCH HISTORY
        save_city(data["location"]["name"])

        return jsonify(data)

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500

@app.route("/search/<query>")
def search_city(query):

    try:

        url = (
            f"https://api.weatherapi.com/v1/search.json"
            f"?key={API_KEY}&q={query}"
        )

        response = requests.get(url)

        data = response.json()

        return jsonify(data)

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500

@app.route("/history")
def history():

    try:

        return jsonify(
            get_history()
        )

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500

@app.route("/current-location/<lat>/<lon>")
def current_location_weather(lat, lon):

    try:

        location = f"{lat},{lon}"

        url = (
            f"https://api.weatherapi.com/v1/forecast.json"
            f"?key={API_KEY}&q={location}&days=5&aqi=yes&alerts=yes"
        )

        response = requests.get(url)

        data = response.json()

        return jsonify(data)

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500

if __name__ == "__main__":

    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )