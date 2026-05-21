import React, { useState } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [data, setData] = useState(null);

  const fetchWeather = async () => {
    if (!city) return;

    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=YOUR_KEY&units=metric`);
    const json = await res.json();
    setData(json);
  };

  return (
    <div className="app-container">
      <div className="weather-card">
        <h2 className="title">Live Weather Forecast</h2>

        <div className="input-box">
          <input
            type="text"
            placeholder="Enter City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button onClick={fetchWeather}>Search</button>
        </div>

        {data && (
          <>
            <div className="weather-top">
              <div>
                <h2 className="city-name">{data.name}</h2>
                <p>{data.sys.country}</p>
              </div>
              <div className="temperature">{data.main.temp}°C</div>
            </div>

            <div className="weather-details">
              <div className="detail-box">
                <span>Humidity</span> {data.main.humidity}%
              </div>
              <div className="detail-box">
                <span>Wind</span> {data.wind.speed} km/h
              </div>
              <div className="detail-box">
                <span>Pressure</span> {data.main.pressure} mb
              </div>
              <div className="detail-box">
                <span>Visibility</span> {data.visibility / 1000} km
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;