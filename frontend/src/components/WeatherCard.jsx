import React, { useState } from "react";

const WeatherCard = ({ weather }) => {
  const [showMore, setShowMore] = useState(false);

  if (!weather?.location || !weather?.current) {
    return <h3 className="loading">Loading...</h3>;
  }

  const currentDayForecast = weather.forecast?.forecastday?.[0]?.day;
  const currentDayAstro = weather.forecast?.forecastday?.[0]?.astro;
  
  const getAqiDetails = (index) => {
    switch(index) {
      case 1: 
        return { text: "Good", status: "🟢 Safe", desc: "(0-50) Air is fresh" };
      case 2: 
        return { text: "Moderate", status: "🟡 Acceptable", desc: "(51-100) Safe for most" };
      case 3: 
        return { text: "Unhealthy for Sensitive Groups", status: "🟠 Caution", desc: "(101-150) Wear mask if sensitive" };
      case 4: 
        return { text: "Unhealthy", status: "🔴 Danger", desc: "(151-200) Harmful air quality" };
      case 5: 
        return { text: "Very Unhealthy", status: "💀 High Danger", desc: "(201-300) Avoid going outdoor" };
      case 6: 
        return { text: "Hazardous", status: "⚠️ Emergency", desc: "(301+) Severe health risk" };
      default: 
        return { text: "N/A", status: "", desc: "" };
    }
  };

  const aqiIndex = weather.current.air_quality?.["us-epa-index"];
  const aqiInfo = getAqiDetails(aqiIndex);

  return (
    <div className="weather-card">
      <div className="weather-top">
        <div className="weather-left">
          <p className="chance-rain">
            Chance of rain: {currentDayForecast?.daily_chance_of_rain || 0}%
          </p>
          <h2 className="city-name">{weather.location.name}</h2>
          <p className="country">{weather.location.country}</p>
          <h1 className="temperature">{weather.current.temp_c}°</h1>
          <p className="condition">{weather.current.condition.text}</p>
        </div>
        <div className="weather-right">
          <img
            src={`https:${weather.current.condition.icon}`}
            className="weather-icon"
            alt="weather"
          />
        </div>
      </div>

      <div className="today-forecast">
        <h3>TODAY'S FORECAST</h3>
        <div className="today-scroll">
          {weather.forecast?.forecastday?.[0]?.hour
            ?.filter((_, index) => index % 3 === 0)
            ?.slice(0, 6)
            ?.map((hour, i) => (
              <div key={i} className="hour-card">
                <p>{hour.time.split(" ")[1]}</p>
                <img src={`https:${hour.condition.icon}`} alt="hour" />
                <h4>{hour.temp_c}°</h4>
              </div>
            ))}
        </div>
      </div>

      <div className="extra-info">
        <div className="air-header">
          <h3>AIR CONDITIONS</h3>
          <button 
            className="see-more-btn" 
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? "See less" : "See more"}
          </button>
        </div>

        <div className="weather-details">
          <div className="detail-box">
            <span>🌡️</span>
            <div>
              <h4>Real Feel</h4>
              <p>{weather.current.feelslike_c}°</p>
            </div>
          </div>

          <div className="detail-box">
            <span>🌬️</span>
            <div>
              <h4>Wind</h4>
              <p>{weather.current.wind_kph} km/h</p>
            </div>
          </div>

          <div className="detail-box">
            <span>💧</span>
            <div>
              <h4>Humidity</h4>
              <p>{weather.current.humidity}%</p>
            </div>
          </div>

          <div className="detail-box">
            <span>☀️</span>
            <div>
              <h4>UV Index</h4>
              <p>{weather.current.uv}</p>
            </div>
          </div>

          <div className="detail-box">
            <span>😷</span>
            <div>
              <h4>Air Quality (AQI)</h4>
              {aqiIndex ? (
                <>
                  <p style={{ fontSize: "20px" }}>{aqiInfo.text}</p>
                  <div style={{ fontSize: "13px", marginTop: "4px", opacity: 0.9 }}>
                    <span style={{ fontWeight: "bold" }}>{aqiInfo.status}</span> — {aqiInfo.desc}
                  </div>
                </>
              ) : (
                <p>N/A</p>
              )}
            </div>
          </div>

          <div className="detail-box">
            <span>🌅</span>
            <div>
              <h4>Sunrise / Sunset</h4>
              <p style={{ fontSize: "16px", marginTop: "4px" }}>
                {currentDayAstro?.sunrise || "N/A"} / {currentDayAstro?.sunset || "N/A"}
              </p>
            </div>
          </div>

          {showMore && (
            <>
              <div className="detail-box">
                <span>👁️</span>
                <div>
                  <h4>Visibility</h4>
                  <p>{weather.current.vis_km} km</p>
                </div>
              </div>

              <div className="detail-box">
                <span>🎈</span>
                <div>
                  <h4>Pressure</h4>
                  <p>{weather.current.pressure_mb} mb</p>
                </div>
              </div>

              <div className="detail-box">
                <span>🌧️</span>
                <div>
                  <h4>Precipitation</h4>
                  <p>{weather.current.precip_mm} mm</p>
                </div>
              </div>

              <div className="detail-box">
                <span>🧭</span>
                <div>
                  <h4>Wind Dir</h4>
                  <p>{weather.current.wind_dir}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="forecast-section">
        <h3>7-DAY FORECAST</h3>
        <div className="forecast-container">
          {weather.forecast?.forecastday?.map((day, i) => (
            <div key={i} className="forecast-card">
              <p className="forecast-date">
                {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
              </p>
              <div className="forecast-middle">
                <img src={`https:${day.day.condition.icon}`} alt="forecast" />
                <span>{day.day.condition.text}</span>
              </div>
              <h4>
                {day.day.maxtemp_c}° / {day.day.mintemp_c}°
              </h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;