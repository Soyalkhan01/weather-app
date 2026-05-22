import json
import os

FILE = "history.json"

if not os.path.exists(FILE):
    with open(FILE, "w") as f:
        json.dump([], f)

def save_city(city):
    with open(FILE, "r") as f:
        data = json.load(f)

    data = [item for item in data if item["city"].lower() != city.lower()]
    data.insert(0, {"city": city})

    with open(FILE, "w") as f:
        json.dump(data, f, indent=4)

def get_history():
    with open(FILE, "r") as f:
        return json.load(f)

def delete_city(city):
    with open(FILE, "r") as f:
        data = json.load(f)

    data = [item for item in data if item["city"].lower() != city.lower()]

    with open(FILE, "w") as f:
        json.dump(data, f, indent=4)
    return True