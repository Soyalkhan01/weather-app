import React, { useState } from "react"; // 1. useState import kiya

const WeatherCard = ({ weather }) => {
  // 2. State create ki extra details toggle karne ke liye
  const [showMore, setShowMore] = useState(false);

  if (!weather?.location || !weather?.current) {
    return <h3 className="loading">Loading...</h3>;
  }

  return (
    <div className="weather-card">
      {/* TOP SECTION */}
      <div className="weather-top">
        <div className="weather-left">
          <p className="chance-rain">
            Chance of rain: {weather.forecast?.forecastday?.[0]?.day?.daily_chance_of_rain || 0}%
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

      {/* TODAY FORECAST */}
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

      {/* AIR CONDITIONS */}
      <div className="extra-info">
        <div className="air-header">
          <h3>AIR CONDITIONS</h3>
          {/* 3. Button par onClick lagaya aur text dynamic kiya */}
          <button 
            className="see-more-btn" 
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? "See less" : "See more"}
          </button>
        </div>

        <div className="weather-details">
          {/* Default 4 details */}
          <div className="detail-box">
            <span>🌡</span>
            <div>
              <h4>Real Feel</h4>
              <p>{weather.current.feelslike_c}°</p>
            </div>
          </div>

          <div className="detail-box">
            <span>🌬</span>
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
            <span>☀</span>
            <div>
              <h4>UV Index</h4>
              <p>{weather.current.uv}</p>
            </div>
          </div>

          {/* 4. Agar showMore true hai, toh yeh extra details dikhengi */}
          {showMore && (
            <>
              <div className="detail-box">
                <span>👁</span>
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
            </>
          )}
        </div>
      </div>

      {/* 7 DAY FORECAST */}
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