import React from "react";
import WeatherChart from "./WeatherChart";

const WeatherCard = ({ weather }) => {

  return (

    <div className="weather-card">

      <div className="weather-top">

        <div>

          <h2 className="city-name">
            {weather.location.name}
          </h2>

          <p className="country">
            {weather.location.country}
          </p>

        </div>

        <img
          src={`https:${weather.current.condition.icon}`}
          alt="weather icon"
          className="weather-icon"
        />

      </div>

      <h1 className="temperature">
        {weather.current.temp_c}°C
      </h1>

      <p className="condition">
        {weather.current.condition.text}
      </p>

      <div className="weather-details">

        <div className="detail-box">
          <span>💧</span>
          <div>
            <h4>Humidity</h4>
            <p>{weather.current.humidity}%</p>
          </div>
        </div>

        <div className="detail-box">
          <span>🌬</span>
          <div>
            <h4>Wind</h4>
            <p>{weather.current.wind_kph} kph</p>
          </div>
        </div>

        <div className="detail-box">
          <span>🌡</span>
          <div>
            <h4>Feels Like</h4>
            <p>{weather.current.feelslike_c}°C</p>
          </div>
        </div>

        <div className="detail-box">
          <span>☀</span>
          <div>
            <h4>UV Index</h4>
            <p>{weather.current.uv}</p>
          </div>
        </div>

      </div>

      <div className="extra-info">

        <h3>Weather Details</h3>

        <div className="extra-row">
          <span>Pressure</span>
          <span>{weather.current.pressure_mb} mb</span>
        </div>

        <div className="extra-row">
          <span>Visibility</span>
          <span>{weather.current.vis_km} km</span>
        </div>

        <div className="extra-row">
          <span>Cloud</span>
          <span>{weather.current.cloud}%</span>
        </div>

        <div className="extra-row">
          <span>Local Time</span>
          <span>{weather.location.localtime}</span>
        </div>

      </div>

      {/* ========================= */}
      {/* 5 DAY FORECAST */}
      {/* ========================= */}

      <div className="forecast-section">

        <h3>5 Day Forecast</h3>

        <div className="forecast-container">

          {weather.forecast?.forecastday?.map((day, index) => (

            <div key={index} className="forecast-card">

              <p>{day.date}</p>

              <img
                src={`https:${day.day.condition.icon}`}
                alt=""
              />

              <h4>{day.day.avgtemp_c}°C</h4>

              <p>{day.day.condition.text}</p>

            </div>

          ))}

        </div>

      </div>

      {/* WEATHER CHART */}
      <WeatherChart forecast={weather.forecast?.forecastday} />

    </div>

  );
};

export default WeatherCard;