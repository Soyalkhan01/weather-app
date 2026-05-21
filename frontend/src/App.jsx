import React, { useEffect, useState } from "react";
import WeatherCard from "./WeatherCard";

const App = () => {
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_KEY = "YOUR_API_KEY_HERE";

  // 1. GET LOCATION (GPS + fallback)
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => {
        // fallback if permission denied
        setCoords({ fallback: true });
      }
    );
  }, []);

  // 2. FETCH WEATHER
  useEffect(() => {
    if (!coords) return;

    const fetchWeather = async () => {
      try {
        setLoading(true);

        let url = "";

        if (coords.fallback) {
          url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=auto:ip&days=5`;
        } else {
          url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${coords.lat},${coords.lon}&days=5`;
        }

        const res = await fetch(url);
        const data = await res.json();

        setWeather(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [coords]);

  if (loading) return <h2 style={{ textAlign: "center" }}>Loading...</h2>;

  if (!weather) return <h2 style={{ textAlign: "center" }}>No Data Found</h2>;

  return (
    <div className="container">
      <div className="weather-box">
        <h1>Weather App</h1>

        <WeatherCard weather={weather} />
      </div>
    </div>
  );
};

export default App;