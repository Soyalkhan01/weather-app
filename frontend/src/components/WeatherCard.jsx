import React from "react";

const WeatherCard = ({ weather }) => {

  if (!weather?.location || !weather?.current) {
    return null;
  }

  return (

    <div className="dashboard">

      {/* LEFT */}

      <div className="left-panel">

        <div className="hero-card">

          <div className="hero-info">

            <h2>
              {weather.location.name}
            </h2>

            <p>
              {weather.location.country}
            </p>

            <h1 className="temperature">
              {weather.current.temp_c}°
            </h1>

            <p>
              {weather.current.condition.text}
            </p>

          </div>

          <img
            src={`https:${weather.current.condition.icon}`}
            alt="weather"
            className="weather-icon"
          />

        </div>

        {/* DETAILS */}

        <div className="weather-details">

          <div className="detail-box">
            <span>💧</span>
            <h4>Humidity</h4>
            <p>{weather.current.humidity}%</p>
          </div>

          <div className="detail-box">
            <span>🌬</span>
            <h4>Wind</h4>
            <p>{weather.current.wind_kph} km/h</p>
          </div>

          <div className="detail-box">
            <span>🌡</span>
            <h4>Feels Like</h4>
            <p>{weather.current.feelslike_c}°</p>
          </div>

          <div className="detail-box">
            <span>☀</span>
            <h4>UV Index</h4>
            <p>{weather.current.uv}</p>
          </div>

        </div>

        {/* EXTRA */}

        <div className="extra-info">

          <h3>
            Air Conditions
          </h3>

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

        {/* FORECAST */}

        <div className="forecast-section">

          <h3>
            5-Day Forecast
          </h3>

          <div className="forecast-container">

            {
              weather.forecast?.forecastday?.map((day, i) => (

                <div
                  className="forecast-card"
                  key={i}
                >

                  <p>{day.date}</p>

                  <img
                    src={`https:${day.day.condition.icon}`}
                    alt="forecast"
                  />

                  <h4>
                    {day.day.avgtemp_c}°
                  </h4>

                  <p>
                    {day.day.condition.text}
                  </p>

                </div>

              ))
            }

          </div>

        </div>

      </div>

    </div>

  );

};

export default WeatherCard;