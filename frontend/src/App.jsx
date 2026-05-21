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

  const BACKEND_URL =
    "https://weather-backend-n5fs.onrender.com";

  // =========================
  // AUTO REFRESH
  // =========================

  useEffect(() => {

    const interval = setInterval(() => {

      if (city) {
        getWeather(city);
      }

    }, 300000);

    return () => clearInterval(interval);

  }, [city]);

  // =========================
  // WEATHER FETCH
  // =========================

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

        setCity(
          data.location?.name || selectedCity
        );

        getHistory();

      }

    } catch (err) {

      setError("Server error");

    } finally {

      setLoading(false);

    }

  };

  // =========================
  // SEARCH CITY
  // =========================

  const searchCities = async (value) => {

    setCity(value);

    if (!value.trim()) {

      setSuggestions([]);

      return;

    }

    try {

      const res = await fetch(
        `${BACKEND_URL}/search/${value}`
      );

      const data = await res.json();

      setSuggestions(
        Array.isArray(data) ? data : []
      );

    } catch (err) {

      console.log(err);

    }

  };

  // =========================
  // HISTORY
  // =========================

  const getHistory = async () => {

    try {

      const res = await fetch(
        `${BACKEND_URL}/history`
      );

      const data = await res.json();

      setHistory(
        Array.isArray(data) ? data : []
      );

    } catch (err) {

      console.log(err);

    }

  };

  // =========================
  // IP LOCATION FALLBACK
  // =========================

  const getIPLocationWeather = async () => {

    try {

      const res = await fetch(
        "https://ipapi.co/json/"
      );

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

  // =========================
  // GPS LOCATION
  // =========================

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

          const res = await fetch(
            `${BACKEND_URL}/weather/${lat},${lon}`
          );

          const data = await res.json();

          if (data?.error) {

            getIPLocationWeather();

          } else {

            setWeather(data);

            setCity(
              data.location?.name || ""
            );

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

  // =========================
  // ENTER SEARCH
  // =========================

  const handleKeyPress = (e) => {

    if (e.key === "Enter") {

      getWeather(city);

      setSuggestions([]);

    }

  };

  // =========================
  // DEFAULT LOAD
  // =========================

  useEffect(() => {

    getCurrentLocationWeather();

    getHistory();

  }, []);

  return (

    <div
      className={
        darkMode
          ? "container dark"
          : "container light"
      }
    >

      <div className="weather-box">

        {/* THEME TOGGLE */}

        <div className="theme-toggle">

          <button
            className="theme-btn"
            onClick={() =>
              setDarkMode(!darkMode)
            }
          >

            {
              darkMode
                ? "☀ Light Mode"
                : "🌙 Dark Mode"
            }

          </button>

        </div>

        {/* TITLE */}

        <h1>
          🌤 Live Weather Forecast
        </h1>

        {/* SEARCH */}

        <div className="search-box">

          <div className="search-container">

            <input
              type="text"
              placeholder="Search city..."
              value={city}
              onChange={(e) =>
                searchCities(
                  e.target.value
                )
              }
              onKeyDown={handleKeyPress}
            />

            {

              suggestions.length > 0 && (

                <div className="dropdown">

                  {

                    suggestions.map(
                      (item, index) => (

                        <div
                          key={index}
                          className="dropdown-item"
                          onClick={() => {

                            setCity(item.name);

                            getWeather(
                              item.name
                            );

                            setSuggestions([]);

                          }}
                        >

                          🌍 {item.name},{" "}
                          {item.country}

                        </div>

                      )
                    )

                  }

                </div>

              )

            }

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

        {/* LOADING */}

        {

          loading && (

            <p className="loading">
              Loading weather...
            </p>

          )

        }

        {/* ERROR */}

        {

          error && (

            <p className="error">
              {error}
            </p>

          )

        }

        {/* WEATHER CARD */}

        {

          weather && !loading && (

            <WeatherCard
              weather={weather}
            />

          )

        }

        {/* HISTORY */}

        <div className="history-box">

          <h2>
            📜 Search History
          </h2>

          <div className="history-scroll">

            {

              history.length > 0 ? (

                history.map(
                  (item, index) => (

                    <div
                      key={index}
                      className="history-item"
                      onClick={() =>
                        getWeather(
                          item.city
                        )
                      }
                    >

                      🌍 {item.city}

                    </div>

                  )
                )

              ) : (

                <p>
                  No history found
                </p>

              )

            }

          </div>

        </div>

      </div>

    </div>

  );

};

export default App;