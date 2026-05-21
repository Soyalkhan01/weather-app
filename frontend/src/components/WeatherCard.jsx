import React from "react";

const WeatherCard = ({ weather }) => {
  if (!weather?.location || !weather?.current) {
    return <h3>Loading...</h3>;
  }

  return (
    <div className="weather-card">

      <div className="weather-top">
        <div>
          <h2 className="city-name">{weather.location.name}</h2>
          <p className="country">{weather.location.country}</p>
        </div>

        <img
          src={`https:${weather.current.condition.icon}`}
          className="weather-icon"
          alt="weather"
        />
      </div>

      <h1 className="temperature">
        {weather.current.temp_c}°C
      </h1>

      <p className="condition">
        {weather.current.condition.text}
      </p>

      {/* DETAILS SAFE */}
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
            <h4>UV</h4>
            <p>{weather.current.uv}</p>
          </div>
        </div>

      </div>

      {/* FORECAST SAFE */}
      <div className="forecast-section">

        <h3>5 Day Forecast</h3>

        <div className="forecast-container">

          {weather.forecast?.forecastday?.map((day, i) => (
            <div key={i} className="forecast-card">

              <p>{day.date}</p>

              <img src={`https:${day.day.condition.icon}`} />

              <h4>{day.day.avgtemp_c}°C</h4>

              <p>{day.day.condition.text}</p>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
};

export default WeatherCard;