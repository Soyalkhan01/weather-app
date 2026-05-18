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
        "message": "Backend Running"
    })

@app.route("/weather/<city>")
def get_weather(city):

    url = f"https://api.weatherapi.com/v1/current.json?key={API_KEY}&q={city}"

    response = requests.get(url)

    data = response.json()

    if "error" in data:
        return jsonify(data), 404

    save_city(city)

    return jsonify(data)

@app.route("/search/<query>")
def search_city(query):

    url = f"https://api.weatherapi.com/v1/search.json?key={API_KEY}&q={query}"

    response = requests.get(url)

    data = response.json()

    return jsonify(data)

@app.route("/history")
def history():

    return jsonify(
        get_history()
    )

if __name__ == "__main__":
    app.run(debug=True)