import React, { useEffect, useState } from "react";
import "./App.css";
import WeatherCard from "./components/WeatherCard";

const App = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const BACKEND_URL = "https://weather-backend-n5fs.onrender.com";

  useEffect(() => {
    const interval = setInterval(() => {
      if (city) {
        getWeather(city);
      }
    }, 300000);
    return () => clearInterval(interval);
  }, [city]);

  const getWeather = async (selectedCity) => {
    if (!selectedCity?.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${BACKEND_URL}/weather/${encodeURIComponent(selectedCity)}`
      );
      const data = await res.json();

      if (!res.ok || data?.error) {
        setError("City not found");
        setWeather(null);
      } else {
        setWeather(data);
        setCity(data.location?.name || selectedCity);
        getHistory(); 
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  const searchCities = async (value) => {
    setCity(value);
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/search/${value}`);
      const data = await res.json();
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
    }
  };

  const getHistory = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/history`);
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
    }
  };

  const removeHistoryItem = async (e, id, cityName) => {
    e.stopPropagation();

    try {
      const target = id ? id : encodeURIComponent(cityName);
      const res = await fetch(`${BACKEND_URL}/history/${target}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setHistory(history.filter((item) => (id ? item._id !== id : item.city !== cityName)));
      }
    } catch (err) {
      console.log("History remove karne me error: ", err);
    }
  };


  const getIPLocationWeather = async () => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      if (data?.city) {
        getWeather(data.city);
      } else {
        getWeather("Delhi");
      }
    } catch (err) {
      getWeather("Delhi");
    }
  };


  const getCurrentLocationWeather = () => {
    if (!navigator.geolocation) {
      getIPLocationWeather();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          setLoading(true);
          const res = await fetch(`${BACKEND_URL}/weather/${lat},${lon}`);
          const data = await res.json();

          if (data?.error) {
            getIPLocationWeather();
          } else {
            setWeather(data);
            setCity(data.location?.name || "");
            setError("");
            getHistory();
          }
        } catch (err) {
          getIPLocationWeather();
        } finally {
          setLoading(false);
        }
      },
      () => {
        getIPLocationWeather();
      }
    );
  };


  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      getWeather(city);
      setSuggestions([]);
    }
  };

  useEffect(() => {
    getCurrentLocationWeather();
    getHistory();
  }, []);

  return (
    <div className={darkMode ? "container dark" : "container light"}>
      <div className="weather-box">
        <div className="top-bar">
          <div className="search-box">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search city..."
                value={city}
                onChange={(e) => searchCities(e.target.value)}
                onKeyDown={handleKeyPress}
              />

              {suggestions.length > 0 && (
                <div className="dropdown">
                  {suggestions.map((item, index) => (
                    <div
                      key={index}
                      className="dropdown-item"
                      onClick={() => {
                        setCity(item.name);
                        getWeather(item.name);
                        setSuggestions([]);
                      }}
                    >
                      🌍 {item.name}, {item.country}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                getWeather(city);
                setSuggestions([]);
              }}
            >
              Search
            </button>
          </div>

          <button className="theme-btn" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀" : "🌙"}
          </button>
        </div>

        {loading && <p className="loading">Loading weather...</p>}

        {error && <p className="error">{error}</p>}

        {weather && !loading && (
          <div className="dashboard">
            {/* LEFT */}
            <div className="left-panel">
              <WeatherCard weather={weather} />
            </div>
            <div className="right-panel">
              <h3>Search History</h3>
              <div className="history-scroll">
                {history.length > 0 ? (
                  history.map((item, index) => (
                    <div
                      key={index}
                      className="history-item"
                      onClick={() => getWeather(item.city)}
                    >
                      <span>🌍 {item.city}</span>
                      
                      <button
                        className="remove-btn"
                        onClick={(e) => removeHistoryItem(e, item._id, item.city)}
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <p>No history found</p>
                )
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;